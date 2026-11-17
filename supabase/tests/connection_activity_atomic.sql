-- Run after migration 017 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db170000-0000-4000-8000-000000000001'),
  ('db170000-0000-4000-8000-000000000002'),
  ('db170000-0000-4000-8000-000000000003');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db170000-0000-4000-8000-000000000001', 'atomic-1@example.invalid', 'Sender', 'Woman'),
  ('db170000-0000-4000-8000-000000000002', 'atomic-2@example.invalid', 'Receiver', 'Woman'),
  ('db170000-0000-4000-8000-000000000003', 'atomic-3@example.invalid', 'Receiver', 'Woman');

CREATE FUNCTION public.test_reject_activity() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_id = 'db170000-0000-4000-8000-000000000003' THEN
    RAISE EXCEPTION 'Simulated activity failure';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER test_reject_activity BEFORE INSERT ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.test_reject_activity();

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db170000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  BEGIN
    PERFORM public.send_connection_request('db170000-0000-4000-8000-000000000003');
    RAISE EXCEPTION 'Failed notification was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Failed notification was accepted' THEN RAISE; END IF;
  END;
  IF EXISTS (SELECT 1 FROM public.connections WHERE receiver_id = 'db170000-0000-4000-8000-000000000003') THEN
    RAISE EXCEPTION 'Failed notification left a connection behind';
  END IF;
END;
$$;
SELECT public.send_connection_request('db170000-0000-4000-8000-000000000002');
SELECT set_config('request.jwt.claim.sub', 'db170000-0000-4000-8000-000000000002', true);
DO $$
DECLARE request_id UUID;
BEGIN
  SELECT id INTO request_id FROM public.connections
  WHERE requester_id = 'db170000-0000-4000-8000-000000000001'
    AND receiver_id = 'db170000-0000-4000-8000-000000000002';
  IF NOT EXISTS (SELECT 1 FROM public.activities WHERE type = 'connection_request' AND reference_id = request_id) THEN
    RAISE EXCEPTION 'Request notification was not created';
  END IF;
  UPDATE public.connections SET status = 'accepted' WHERE id = request_id;
  IF EXISTS (SELECT 1 FROM public.activities WHERE type = 'connection_request' AND reference_id = request_id) THEN
    RAISE EXCEPTION 'Accepted request notification remained';
  END IF;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db170000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.activities WHERE type = 'connection_accepted'
    AND actor_id = 'db170000-0000-4000-8000-000000000002') THEN
    RAISE EXCEPTION 'Accepted notification was not created';
  END IF;
END;
$$;
DELETE FROM public.connections WHERE receiver_id = 'db170000-0000-4000-8000-000000000002';
SELECT public.send_connection_request('db170000-0000-4000-8000-000000000002');
DELETE FROM public.connections WHERE receiver_id = 'db170000-0000-4000-8000-000000000002' AND status = 'pending';
SELECT set_config('request.jwt.claim.sub', 'db170000-0000-4000-8000-000000000002', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.activities WHERE type = 'connection_request') THEN
    RAISE EXCEPTION 'Canceled request notification remained';
  END IF;
END;
$$;
ROLLBACK;
