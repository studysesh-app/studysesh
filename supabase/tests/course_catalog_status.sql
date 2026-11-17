-- Run after migration 030 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES ('db300000-0000-4000-8000-000000000001');
INSERT INTO public.users (id, email, name, gender)
VALUES ('db300000-0000-4000-8000-000000000001', 'catalog@example.invalid', 'Student', 'Woman');
INSERT INTO public.courses (id, code, name, is_active) VALUES
  ('db300000-0000-4000-8000-000000000010', 'TEST 9030', 'Current', TRUE),
  ('db300000-0000-4000-8000-000000000011', 'TEST 9031', 'Retired', TRUE);
INSERT INTO public.user_courses (user_id, course_id)
VALUES ('db300000-0000-4000-8000-000000000001', 'db300000-0000-4000-8000-000000000011');
UPDATE public.courses SET is_active = FALSE WHERE id = 'db300000-0000-4000-8000-000000000011';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db300000-0000-4000-8000-000000000001', true);
SELECT set_config('request.jwt.claims', '{"email":"catalog@cmail.carleton.ca"}', true);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_courses WHERE user_id = auth.uid()
    AND course_id = 'db300000-0000-4000-8000-000000000011') THEN
    RAISE EXCEPTION 'Existing retired-course enrollment disappeared';
  END IF;
  BEGIN
    PERFORM public.complete_profile('{"name":"Changed","gender":"Woman","pronouns":[],"is_tutor":false}'::JSONB,
      '[{"prompt":"A","answer":"A"},{"prompt":"B","answer":"B"},{"prompt":"C","answer":"C"}]'::JSONB,
      ARRAY['TEST 9031'], '[]'::JSONB);
    RAISE EXCEPTION 'Retired course was accepted during onboarding';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Retired course was accepted during onboarding' THEN RAISE; END IF;
  END;
  IF NOT EXISTS (SELECT 1 FROM public.user_courses WHERE user_id = auth.uid()
    AND course_id = 'db300000-0000-4000-8000-000000000011') THEN
    RAISE EXCEPTION 'Failed onboarding did not preserve enrollment';
  END IF;
  DELETE FROM public.user_courses WHERE user_id = auth.uid() AND course_id = 'db300000-0000-4000-8000-000000000011';
  BEGIN
    INSERT INTO public.user_courses (user_id, course_id)
    VALUES (auth.uid(), 'db300000-0000-4000-8000-000000000011');
    RAISE EXCEPTION 'Retired course was re-enrolled';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
    WHEN raise_exception THEN IF SQLERRM = 'Retired course was re-enrolled' THEN RAISE; END IF;
  END;
  INSERT INTO public.user_courses (user_id, course_id)
  VALUES (auth.uid(), 'db300000-0000-4000-8000-000000000010');
END;
$$;
ROLLBACK;
