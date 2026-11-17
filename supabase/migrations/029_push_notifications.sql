CREATE TABLE public.push_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  messages BOOLEAN NOT NULL DEFAULT FALSE,
  connections BOOLEAN NOT NULL DEFAULT FALSE,
  board BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.push_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  revision UUID NOT NULL DEFAULT gen_random_uuid(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.push_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_preferences_select_own" ON public.push_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "push_devices_select_own" ON public.push_devices FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE ALL ON public.push_preferences, public.push_devices FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.push_preferences, public.push_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_preferences, public.push_devices TO service_role;

CREATE OR REPLACE FUNCTION public.set_push_preferences(p_expected_user UUID, p_messages BOOLEAN, p_connections BOOLEAN, p_board BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_expected_user OR p_messages IS NULL OR p_connections IS NULL OR p_board IS NULL THEN
    RAISE EXCEPTION 'Invalid notification preferences';
  END IF;
  INSERT INTO public.push_preferences (user_id, messages, connections, board)
  VALUES (auth.uid(), p_messages, p_connections, p_board)
  ON CONFLICT (user_id) DO UPDATE SET messages = EXCLUDED.messages, connections = EXCLUDED.connections,
    board = EXCLUDED.board, updated_at = pg_catalog.now();
END;
$$;
REVOKE ALL ON FUNCTION public.set_push_preferences(UUID, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_push_preferences(UUID, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.register_push_device(p_expected_user UUID, p_token TEXT, p_platform TEXT, p_previous_token TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_expected_user OR p_platform NOT IN ('ios', 'android') OR p_platform IS NULL
     OR p_token IS NULL OR pg_catalog.length(p_token) > 256
     OR p_token !~ '^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$' THEN
    RAISE EXCEPTION 'Invalid push device';
  END IF;
  INSERT INTO public.push_devices (user_id, token, platform)
  VALUES (auth.uid(), p_token, p_platform)
  ON CONFLICT (token) DO UPDATE SET
    revision = CASE WHEN public.push_devices.user_id IS DISTINCT FROM EXCLUDED.user_id
      OR public.push_devices.platform IS DISTINCT FROM EXCLUDED.platform
      THEN pg_catalog.gen_random_uuid() ELSE public.push_devices.revision END,
    user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, updated_at = pg_catalog.now();
  IF p_previous_token IS NOT NULL AND p_previous_token <> p_token THEN
    DELETE FROM public.push_devices WHERE token = p_previous_token;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.register_push_device(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_push_device(UUID, TEXT, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.unregister_push_device(p_expected_user UUID, p_token TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_expected_user THEN RAISE EXCEPTION 'Session changed'; END IF;
  DELETE FROM public.push_devices WHERE user_id = auth.uid() AND token = p_token;
END;
$$;
REVOKE ALL ON FUNCTION public.unregister_push_device(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unregister_push_device(UUID, TEXT) TO authenticated;

CREATE TABLE public.push_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.push_devices(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'receipt', 'delivered', 'failed', 'canceled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  ticket_id TEXT,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lease_id UUID,
  lease_until TIMESTAMPTZ,
  lease_device_revision UUID,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (activity_id, device_id)
);
ALTER TABLE public.push_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_deliveries FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_deliveries TO service_role;
CREATE INDEX idx_push_deliveries_ready ON public.push_deliveries (next_attempt_at, created_at)
  WHERE state IN ('pending', 'receipt');

CREATE OR REPLACE FUNCTION public.enqueue_activity_push()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.push_deliveries (activity_id, device_id)
  SELECT NEW.id, d.id FROM public.push_devices d
  JOIN public.push_preferences p ON p.user_id = d.user_id
  WHERE d.user_id = NEW.user_id AND NEW.actor_id IS NOT NULL AND NEW.actor_id <> NEW.user_id
    AND ((NEW.type = 'message' AND p.messages)
      OR (NEW.type IN ('connection_request', 'connection_accepted') AND p.connections)
      OR (NEW.type IN ('board_like', 'board_reply') AND p.board))
  ON CONFLICT (activity_id, device_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enqueue_activity_push AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_activity_push();

CREATE OR REPLACE FUNCTION public.claim_push_deliveries(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  id UUID, lease_id UUID, token TEXT, activity_id UUID, activity_type TEXT, ticket_id TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.push_deliveries d
  WHERE d.state IN ('delivered', 'failed', 'canceled') AND d.completed_at < pg_catalog.now() - INTERVAL '30 days';

  UPDATE public.push_deliveries d SET state = 'canceled', completed_at = pg_catalog.now(), lease_id = NULL, lease_until = NULL
  FROM public.push_devices device, public.activities activity
  LEFT JOIN public.push_preferences prefs ON prefs.user_id = activity.user_id
  WHERE d.device_id = device.id AND d.activity_id = activity.id
    AND d.state IN ('pending', 'receipt') AND (d.lease_until IS NULL OR d.lease_until < pg_catalog.now())
    AND (
      device.user_id <> activity.user_id OR (
        d.state = 'pending' AND (
          activity.actor_id IS NULL OR COALESCE(activity.is_read, FALSE)
          OR EXISTS (SELECT 1 FROM public.account_deletions deleting
            WHERE deleting.user_id = activity.user_id AND deleting.expires_at > pg_catalog.now())
          OR NOT public.board_viewer_can_see(activity.user_id, activity.actor_id)
          OR NOT COALESCE(CASE
            WHEN activity.type = 'message' THEN prefs.messages
            WHEN activity.type IN ('connection_request', 'connection_accepted') THEN prefs.connections
            WHEN activity.type IN ('board_like', 'board_reply') THEN prefs.board
            ELSE FALSE END, FALSE)
        )
      )
    );

  RETURN QUERY
  WITH ready AS (
    SELECT d.id FROM public.push_deliveries d
    WHERE d.state IN ('pending', 'receipt') AND d.next_attempt_at <= pg_catalog.now()
      AND (d.lease_until IS NULL OR d.lease_until < pg_catalog.now())
    ORDER BY d.next_attempt_at, d.created_at, d.id
    FOR UPDATE SKIP LOCKED LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 100)
  ),
  claimed AS (
    UPDATE public.push_deliveries d SET lease_id = pg_catalog.gen_random_uuid(),
      lease_until = pg_catalog.now() + INTERVAL '2 minutes',
      lease_device_revision = (SELECT device.revision FROM public.push_devices device WHERE device.id = d.device_id),
      attempts = d.attempts + CASE WHEN d.ticket_id IS NULL THEN 1 ELSE 0 END
    FROM ready WHERE d.id = ready.id
    RETURNING d.id, d.lease_id, d.device_id, d.activity_id, d.ticket_id
  )
  SELECT c.id, c.lease_id, device.token, c.activity_id, activity.type, c.ticket_id
  FROM claimed c JOIN public.push_devices device ON device.id = c.device_id
  JOIN public.activities activity ON activity.id = c.activity_id;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_push_deliveries(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_push_deliveries(INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.validate_push_delivery(p_id UUID, p_lease UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.push_deliveries d
    JOIN public.push_devices device ON device.id = d.device_id
    JOIN public.activities activity ON activity.id = d.activity_id
    LEFT JOIN public.push_preferences prefs ON prefs.user_id = activity.user_id
    WHERE d.id = p_id AND d.lease_id = p_lease AND d.lease_until > pg_catalog.now()
      AND device.user_id = activity.user_id AND device.revision = d.lease_device_revision
      AND (d.state = 'receipt' OR (
        activity.actor_id IS NOT NULL AND NOT COALESCE(activity.is_read, FALSE)
        AND NOT EXISTS (SELECT 1 FROM public.account_deletions deleting
          WHERE deleting.user_id = activity.user_id AND deleting.expires_at > pg_catalog.now())
        AND public.board_viewer_can_see(activity.user_id, activity.actor_id)
        AND COALESCE(CASE
          WHEN activity.type = 'message' THEN prefs.messages
          WHEN activity.type IN ('connection_request', 'connection_accepted') THEN prefs.connections
          WHEN activity.type IN ('board_like', 'board_reply') THEN prefs.board
          ELSE FALSE END, FALSE)
      ))
  ) INTO valid;
  IF NOT valid THEN
    UPDATE public.push_deliveries SET state = 'canceled', completed_at = pg_catalog.now(), lease_id = NULL, lease_until = NULL
    WHERE id = p_id AND lease_id = p_lease;
  END IF;
  RETURN valid;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_push_delivery(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_push_delivery(UUID, UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.complete_push_delivery(
  p_id UUID, p_lease UUID, p_action TEXT, p_ticket TEXT DEFAULT NULL, p_error TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE job public.push_deliveries%ROWTYPE;
BEGIN
  SELECT * INTO job FROM public.push_deliveries WHERE id = p_id AND lease_id = p_lease
    AND lease_until > pg_catalog.now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Push delivery lease expired'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.push_devices device JOIN public.activities activity ON activity.id = job.activity_id
    WHERE device.id = job.device_id AND device.user_id = activity.user_id AND device.revision = job.lease_device_revision
  ) THEN
    UPDATE public.push_deliveries SET state = 'canceled', completed_at = pg_catalog.now(), lease_id = NULL, lease_until = NULL
    WHERE id = p_id;
    RETURN;
  END IF;
  IF p_action = 'invalid_device' THEN
    DELETE FROM public.push_devices WHERE id = job.device_id;
    RETURN;
  ELSIF p_action = 'accepted' AND p_ticket IS NOT NULL AND pg_catalog.length(p_ticket) <= 256 THEN
    UPDATE public.push_deliveries SET state = 'receipt', ticket_id = p_ticket,
      next_attempt_at = pg_catalog.now() + INTERVAL '15 minutes', lease_id = NULL, lease_until = NULL
    WHERE id = p_id;
  ELSIF p_action = 'delivered' THEN
    UPDATE public.push_deliveries SET state = 'delivered', completed_at = pg_catalog.now(), lease_id = NULL, lease_until = NULL
    WHERE id = p_id;
  ELSIF p_action = 'receipt_wait' AND job.ticket_id IS NOT NULL THEN
    UPDATE public.push_deliveries SET
      state = CASE WHEN job.created_at < pg_catalog.now() - INTERVAL '24 hours' THEN 'failed' ELSE 'receipt' END,
      completed_at = CASE WHEN job.created_at < pg_catalog.now() - INTERVAL '24 hours' THEN pg_catalog.now() ELSE NULL END,
      next_attempt_at = pg_catalog.now() + INTERVAL '15 minutes', lease_id = NULL, lease_until = NULL,
      last_error = CASE WHEN job.created_at < pg_catalog.now() - INTERVAL '24 hours' THEN 'Receipt expired' ELSE NULL END
    WHERE id = p_id;
  ELSIF p_action IN ('retry', 'failed') THEN
    UPDATE public.push_deliveries SET
      state = CASE WHEN p_action = 'failed' OR job.attempts >= 5 THEN 'failed' ELSE 'pending' END,
      completed_at = CASE WHEN p_action = 'failed' OR job.attempts >= 5 THEN pg_catalog.now() ELSE NULL END,
      ticket_id = NULL,
      next_attempt_at = pg_catalog.now() + (LEAST(3600, 60 * pg_catalog.power(2, GREATEST(job.attempts - 1, 0))) * INTERVAL '1 second'),
      lease_id = NULL, lease_until = NULL, last_error = LEFT(COALESCE(p_error, 'Delivery failed'), 300)
    WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Invalid push delivery action';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_push_delivery(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_push_delivery(UUID, UUID, TEXT, TEXT, TEXT) TO service_role;
