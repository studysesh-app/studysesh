-- Run after migration 029 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db290000-0000-4000-8000-000000000001'),
  ('db290000-0000-4000-8000-000000000002');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db290000-0000-4000-8000-000000000001', 'push-1@example.invalid', 'Sender', 'Woman'),
  ('db290000-0000-4000-8000-000000000002', 'push-2@example.invalid', 'Receiver', 'Woman');
CREATE TEMP TABLE saved_push_job (id UUID, lease_id UUID);
GRANT SELECT, INSERT ON saved_push_job TO service_role;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db290000-0000-4000-8000-000000000002', true);
SELECT public.register_push_device('db290000-0000-4000-8000-000000000002', 'ExpoPushToken[test-device]', 'ios');
DO $$
BEGIN
  BEGIN
    PERFORM public.register_push_device('db290000-0000-4000-8000-000000000001', 'ExpoPushToken[other]', 'ios');
    RAISE EXCEPTION 'A stale session registered a device for another account';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'A stale session registered a device for another account' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM * FROM public.claim_push_deliveries(10);
    RAISE EXCEPTION 'User claimed server push jobs';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
RESET ROLE;
INSERT INTO public.activities (id, user_id, actor_id, type) VALUES
  ('db290000-0000-4000-8000-000000000010', 'db290000-0000-4000-8000-000000000002',
   'db290000-0000-4000-8000-000000000001', 'message');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.push_deliveries) THEN RAISE EXCEPTION 'Opt-out should not queue push'; END IF;
END;
$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db290000-0000-4000-8000-000000000002', true);
SELECT public.set_push_preferences('db290000-0000-4000-8000-000000000002', TRUE, FALSE, FALSE);
RESET ROLE;
INSERT INTO public.activities (id, user_id, actor_id, type) VALUES
  ('db290000-0000-4000-8000-000000000011', 'db290000-0000-4000-8000-000000000002',
   'db290000-0000-4000-8000-000000000001', 'message');
SET LOCAL ROLE service_role;
DO $$
DECLARE job RECORD; receipt RECORD;
BEGIN
  SELECT * INTO job FROM public.claim_push_deliveries(10);
  IF job.id IS NULL OR job.activity_id <> 'db290000-0000-4000-8000-000000000011' THEN
    RAISE EXCEPTION 'Opted-in notification was not queued';
  END IF;
  IF NOT public.validate_push_delivery(job.id, job.lease_id)
     OR public.validate_push_delivery(job.id, 'db290000-0000-4000-8000-000000000099') THEN
    RAISE EXCEPTION 'Delivery lease validation failed';
  END IF;
  PERFORM public.complete_push_delivery(job.id, job.lease_id, 'accepted', 'ticket-1', NULL);
  UPDATE public.push_preferences SET messages = FALSE WHERE user_id = 'db290000-0000-4000-8000-000000000002';
  UPDATE public.push_deliveries SET next_attempt_at = now() WHERE id = job.id;
  SELECT * INTO receipt FROM public.claim_push_deliveries(10);
  IF receipt.ticket_id <> 'ticket-1' OR NOT public.validate_push_delivery(receipt.id, receipt.lease_id) THEN
    RAISE EXCEPTION 'Receipt was not scheduled after opt-out';
  END IF;
  PERFORM public.complete_push_delivery(receipt.id, receipt.lease_id, 'delivered', NULL, NULL);
  IF NOT EXISTS (SELECT 1 FROM public.push_deliveries WHERE id = job.id AND state = 'delivered') THEN
    RAISE EXCEPTION 'Delivery receipt was not recorded';
  END IF;
  UPDATE public.push_preferences SET messages = TRUE WHERE user_id = 'db290000-0000-4000-8000-000000000002';
END;
$$;
RESET ROLE;
INSERT INTO public.activities (id, user_id, actor_id, type) VALUES
  ('db290000-0000-4000-8000-000000000013', 'db290000-0000-4000-8000-000000000002',
   'db290000-0000-4000-8000-000000000001', 'message');
SET LOCAL ROLE service_role;
DO $$
DECLARE job RECORD;
BEGIN
  SELECT * INTO job FROM public.claim_push_deliveries(10);
  UPDATE public.push_preferences SET messages = FALSE WHERE user_id = 'db290000-0000-4000-8000-000000000002';
  IF public.validate_push_delivery(job.id, job.lease_id) THEN RAISE EXCEPTION 'Opted-out leased push remained valid'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.push_deliveries WHERE id = job.id AND state = 'canceled') THEN
    RAISE EXCEPTION 'Opted-out leased push was not canceled';
  END IF;
  UPDATE public.push_preferences SET messages = TRUE WHERE user_id = 'db290000-0000-4000-8000-000000000002';
END;
$$;
RESET ROLE;
INSERT INTO public.activities (id, user_id, actor_id, type) VALUES
  ('db290000-0000-4000-8000-000000000014', 'db290000-0000-4000-8000-000000000002',
   'db290000-0000-4000-8000-000000000001', 'message');
SET LOCAL ROLE service_role;
INSERT INTO saved_push_job SELECT id, lease_id FROM public.claim_push_deliveries(10);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db290000-0000-4000-8000-000000000001', true);
SELECT public.register_push_device('db290000-0000-4000-8000-000000000001', 'ExpoPushToken[test-device]', 'ios');
SET LOCAL ROLE service_role;
DO $$
DECLARE job RECORD;
BEGIN
  SELECT * INTO job FROM saved_push_job;
  PERFORM public.complete_push_delivery(job.id, job.lease_id, 'invalid_device', NULL, NULL);
  IF NOT EXISTS (SELECT 1 FROM public.push_devices
    WHERE token = 'ExpoPushToken[test-device]' AND user_id = 'db290000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'A stale receipt removed a reassigned device';
  END IF;
END;
$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db290000-0000-4000-8000-000000000002', true);
SELECT public.register_push_device('db290000-0000-4000-8000-000000000002', 'ExpoPushToken[test-device]', 'ios');
RESET ROLE;
INSERT INTO public.activities (id, user_id, actor_id, type) VALUES
  ('db290000-0000-4000-8000-000000000012', 'db290000-0000-4000-8000-000000000002',
   'db290000-0000-4000-8000-000000000001', 'message');
INSERT INTO public.blocked_users (blocker_id, blocked_id) VALUES
  ('db290000-0000-4000-8000-000000000002', 'db290000-0000-4000-8000-000000000001');
SET LOCAL ROLE service_role;
DO $$
DECLARE claimed INTEGER;
BEGIN
  SELECT COUNT(*) INTO claimed FROM public.claim_push_deliveries(10);
  IF claimed <> 0 OR NOT EXISTS (SELECT 1 FROM public.push_deliveries WHERE activity_id = 'db290000-0000-4000-8000-000000000012' AND state = 'canceled') THEN
    RAISE EXCEPTION 'Blocked sender should not produce a push';
  END IF;
END;
$$;
ROLLBACK;
