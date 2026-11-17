-- Run after migration 022 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db210000-0000-4000-8000-000000000001'),
  ('db210000-0000-4000-8000-000000000002');
INSERT INTO public.users (id, email, name, gender)
VALUES ('db210000-0000-4000-8000-000000000002', 'other-email@example.invalid', 'Other', 'Woman');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db210000-0000-4000-8000-000000000001', true);
SELECT set_config('request.jwt.claims', '{"email":"own-email@cmail.carleton.ca"}', true);
DO $$
BEGIN
  PERFORM public.complete_profile(
    '{"name":"Owner","gender":"Woman","pronouns":[],"is_tutor":false}'::JSONB,
    '[{"prompt":"One","answer":"A"},{"prompt":"Two","answer":"B"},{"prompt":"Three","answer":"C"}]'::JSONB,
    ARRAY[]::TEXT[], '[]'::JSONB
  );
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND name = 'Owner') THEN
    RAISE EXCEPTION 'Onboarding must still create the caller profile';
  END IF;
  BEGIN
    PERFORM email FROM public.users WHERE id = 'db210000-0000-4000-8000-000000000002';
    RAISE EXCEPTION 'Another profile email was exposed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.users SET email = 'unverified@example.invalid' WHERE id = auth.uid();
    RAISE EXCEPTION 'Client changed the verified profile email';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.users (id, email, name, gender)
    VALUES (auth.uid(), 'forged@example.invalid', 'Forged', 'Woman');
    RAISE EXCEPTION 'Client inserted a profile directly';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
RESET ROLE;
UPDATE auth.users SET email = 'updated-email@cmail.carleton.ca' WHERE id = 'db210000-0000-4000-8000-000000000001';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = 'db210000-0000-4000-8000-000000000001'
    AND email = 'updated-email@cmail.carleton.ca') THEN
    RAISE EXCEPTION 'Owner email update failed';
  END IF;
  BEGIN
    UPDATE auth.users SET email = 'outside@example.invalid' WHERE id = 'db210000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'Non-Carleton email was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Non-Carleton email was accepted' THEN RAISE; END IF;
  END;
END;
$$;
ROLLBACK;
