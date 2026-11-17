-- Run after migration 014 in a disposable Supabase database. Everything is rolled back.
BEGIN;

INSERT INTO auth.users (id) VALUES
  ('db140000-0000-4000-8000-000000000001'),
  ('db140000-0000-4000-8000-000000000002');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db140000-0000-4000-8000-000000000001', 'connection-1@example.invalid', 'Sender', 'Woman'),
  ('db140000-0000-4000-8000-000000000002', 'connection-2@example.invalid', 'Recipient', 'Woman');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db140000-0000-4000-8000-000000000001', true);
INSERT INTO public.connections (id, requester_id, receiver_id, status)
VALUES ('db140000-0000-4000-8000-000000000010', 'db140000-0000-4000-8000-000000000001', 'db140000-0000-4000-8000-000000000002', 'pending');
DO $$
DECLARE affected INTEGER;
BEGIN
  UPDATE public.connections SET status = 'accepted' WHERE id = 'db140000-0000-4000-8000-000000000010';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Requester accepted their own request'; END IF;
  BEGIN
    UPDATE public.connections SET receiver_id = 'db140000-0000-4000-8000-000000000001'
    WHERE id = 'db140000-0000-4000-8000-000000000010';
    RAISE EXCEPTION 'Connection parties could be changed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;

SELECT set_config('request.jwt.claim.sub', 'db140000-0000-4000-8000-000000000002', true);
DO $$
BEGIN
  BEGIN
    INSERT INTO public.connections (requester_id, receiver_id, status)
    VALUES ('db140000-0000-4000-8000-000000000002', 'db140000-0000-4000-8000-000000000001', 'pending');
    RAISE EXCEPTION 'Opposite-direction duplicate accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END;
$$;
UPDATE public.connections SET status = 'accepted' WHERE id = 'db140000-0000-4000-8000-000000000010';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.connections WHERE id = 'db140000-0000-4000-8000-000000000010' AND status = 'accepted') THEN
    RAISE EXCEPTION 'Receiver could not accept request';
  END IF;
END;
$$;

ROLLBACK;
