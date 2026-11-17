CREATE OR REPLACE FUNCTION public.sync_connection_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' OR (OLD.status = 'pending' AND NEW.status IS DISTINCT FROM 'pending') THEN
    DELETE FROM public.activities WHERE type = 'connection_request' AND reference_id = OLD.id;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO public.activities (user_id, actor_id, type, reference_id)
    VALUES (NEW.requester_id, NEW.receiver_id, 'connection_accepted', NEW.id);
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_connection_activity
  AFTER DELETE OR UPDATE OF status ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.sync_connection_activity();

CREATE OR REPLACE FUNCTION public.send_connection_request(p_receiver_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE request_id UUID;
BEGIN
  INSERT INTO public.connections (requester_id, receiver_id, status)
  VALUES (auth.uid(), p_receiver_id, 'pending')
  RETURNING id INTO request_id;

  INSERT INTO public.activities (user_id, actor_id, type, reference_id)
  VALUES (p_receiver_id, auth.uid(), 'connection_request', request_id);
  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.send_connection_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_connection_request(UUID) TO authenticated;

DROP POLICY IF EXISTS "activities_insert" ON public.activities;
CREATE POLICY "activities_insert" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND user_id <> auth.uid());

CREATE OR REPLACE FUNCTION public.validate_connection_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.type = 'connection_request' THEN
    PERFORM 1 FROM public.connections c
    WHERE c.id = NEW.reference_id AND c.status = 'pending'
      AND c.requester_id = NEW.actor_id AND c.receiver_id = NEW.user_id
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'The connection request is no longer pending';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_connection_activity
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.validate_connection_activity();

DELETE FROM public.activities a
WHERE a.type = 'connection_request'
  AND NOT EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.id = a.reference_id AND c.status = 'pending'
      AND c.requester_id = a.actor_id AND c.receiver_id = a.user_id
  );
