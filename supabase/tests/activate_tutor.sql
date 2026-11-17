-- Run after migration 012 in a disposable Supabase database. Everything is rolled back.
BEGIN;

INSERT INTO auth.users (id) VALUES ('db120000-0000-4000-8000-000000000001');
INSERT INTO public.users (id, email, name, gender, is_tutor)
VALUES ('db120000-0000-4000-8000-000000000001', 'tutor-conversion@example.invalid', 'Student', 'Woman', FALSE);
INSERT INTO public.courses (id, code, name) VALUES
  ('db120000-0000-4000-8000-000000000010', 'TEST 9013', 'Conversion test'),
  ('db120000-0000-4000-8000-000000000011', 'TEST 9014', 'Conversion test 2');
INSERT INTO public.user_courses (user_id, course_id)
VALUES ('db120000-0000-4000-8000-000000000001', 'db120000-0000-4000-8000-000000000010');
INSERT INTO storage.objects (bucket_id, name, metadata)
VALUES ('proofs', 'db120000-0000-4000-8000-000000000001/TEST_9013.pdf', '{"size":100,"mimetype":"application/pdf"}');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db120000-0000-4000-8000-000000000001', true);
DO $$
DECLARE
  good JSONB := '{"course_code":"TEST 9013","proof_url":"db120000-0000-4000-8000-000000000001/TEST_9013.pdf","group_price":6,"individual_price":20,"session_type":"both"}';
  bad JSONB := '{"course_code":"TEST 9014","proof_url":"","group_price":6,"individual_price":20,"session_type":"both"}';
BEGIN
  BEGIN
    PERFORM public.activate_tutor(jsonb_build_array(good, bad));
    RAISE EXCEPTION 'Invalid proof was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Invalid proof was accepted' THEN RAISE; END IF;
  END;
  IF EXISTS (SELECT 1 FROM public.tutor_courses WHERE user_id = 'db120000-0000-4000-8000-000000000001')
     OR (SELECT is_tutor FROM public.users WHERE id = 'db120000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'A failed conversion must roll back completely';
  END IF;
  PERFORM public.activate_tutor(jsonb_build_array(good));
  IF NOT (SELECT is_tutor FROM public.users WHERE id = 'db120000-0000-4000-8000-000000000001')
     OR NOT EXISTS (SELECT 1 FROM public.tutor_courses WHERE user_id = 'db120000-0000-4000-8000-000000000001' AND group_price = 6 AND individual_price = 20)
     OR NOT EXISTS (SELECT 1 FROM public.user_courses WHERE user_id = 'db120000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'Conversion must save prices and preserve studying courses';
  END IF;
END;
$$;

ROLLBACK;
