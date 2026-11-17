-- Run after migration 011 in a disposable Supabase database. Everything is rolled back.
BEGIN;

INSERT INTO auth.users (id) VALUES ('db110000-0000-4000-8000-000000000001');
INSERT INTO public.users (id, email, name, gender, is_tutor)
VALUES ('db110000-0000-4000-8000-000000000001', 'proof-test@example.invalid', 'Tutor', 'Woman', TRUE);
INSERT INTO public.courses (id, code, name) VALUES
  ('db110000-0000-4000-8000-000000000010', 'TEST 9011', 'Proof test'),
  ('db110000-0000-4000-8000-000000000011', 'TEST 9012', 'Proof test 2');
INSERT INTO storage.objects (bucket_id, name, metadata) VALUES
  ('proofs', 'db110000-0000-4000-8000-000000000001/TEST_9011.pdf', '{"size":10485760,"mimetype":"application/pdf"}'),
  ('proofs', 'db110000-0000-4000-8000-000000000001/TEST_9012.png', '{"size":10485761,"mimetype":"image/png"}');

DO $$
BEGIN
  BEGIN
    INSERT INTO public.tutor_courses (user_id, course_id, proof_url)
    VALUES ('db110000-0000-4000-8000-000000000001', 'db110000-0000-4000-8000-000000000010', NULL);
    RAISE EXCEPTION 'Missing proof was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Missing proof was accepted' THEN RAISE; END IF;
  END;
  BEGIN
    INSERT INTO public.tutor_courses (user_id, course_id, proof_url)
    VALUES ('db110000-0000-4000-8000-000000000001', 'db110000-0000-4000-8000-000000000011', 'db110000-0000-4000-8000-000000000001/TEST_9012.png');
    RAISE EXCEPTION 'Oversized proof was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Oversized proof was accepted' THEN RAISE; END IF;
  END;
  BEGIN
    INSERT INTO public.tutor_courses (user_id, course_id, proof_url)
    VALUES ('db110000-0000-4000-8000-000000000001', 'db110000-0000-4000-8000-000000000011', 'db110000-0000-4000-8000-000000000001/TEST_9011.pdf');
    RAISE EXCEPTION 'Proof for another course was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Proof for another course was accepted' THEN RAISE; END IF;
  END;
END;
$$;

INSERT INTO public.tutor_courses (user_id, course_id, proof_url)
VALUES ('db110000-0000-4000-8000-000000000001', 'db110000-0000-4000-8000-000000000010', 'db110000-0000-4000-8000-000000000001/TEST_9011.pdf');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db110000-0000-4000-8000-000000000001', true);
DO $$
DECLARE affected INTEGER;
BEGIN
  DELETE FROM storage.objects WHERE name = 'db110000-0000-4000-8000-000000000001/TEST_9011.pdf';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Referenced proof was deleted'; END IF;
  UPDATE storage.objects SET metadata = '{"size":1,"mimetype":"text/plain"}'
  WHERE name = 'db110000-0000-4000-8000-000000000001/TEST_9011.pdf';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Referenced proof was overwritten'; END IF;
END;
$$;

ROLLBACK;
