-- Run after migration 024 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db240000-0000-4000-8000-000000000001'),
  ('db240000-0000-4000-8000-000000000002'),
  ('db240000-0000-4000-8000-000000000003'),
  ('db240000-0000-4000-8000-000000000004'),
  ('db240000-0000-4000-8000-000000000005');
INSERT INTO public.users (id, email, name, gender, profile_visibility) VALUES
  ('db240000-0000-4000-8000-000000000001', 'avatar-1@example.invalid', 'Owner', 'Woman', 'women-nb-only'),
  ('db240000-0000-4000-8000-000000000002', 'avatar-2@example.invalid', 'Eligible', 'Woman', 'everyone'),
  ('db240000-0000-4000-8000-000000000003', 'avatar-3@example.invalid', 'Ineligible', 'Man', 'everyone'),
  ('db240000-0000-4000-8000-000000000004', 'avatar-4@example.invalid', 'Blocked', 'Woman', 'everyone');
INSERT INTO storage.objects (bucket_id, name) VALUES
  ('avatars', 'db240000-0000-4000-8000-000000000001/avatar.jpg'),
  ('avatars', 'db240000-0000-4000-8000-000000000005/avatar.jpg');
INSERT INTO public.blocked_users (blocker_id, blocked_id)
VALUES ('db240000-0000-4000-8000-000000000001', 'db240000-0000-4000-8000-000000000004');
DO $$
BEGIN
  IF (SELECT public FROM storage.buckets WHERE id = 'avatars') IS DISTINCT FROM FALSE THEN
    RAISE EXCEPTION 'Avatars bucket must be private';
  END IF;
END;
$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db240000-0000-4000-8000-000000000002', true);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE name = 'db240000-0000-4000-8000-000000000001/avatar.jpg') THEN
    RAISE EXCEPTION 'Eligible viewer cannot read avatar';
  END IF;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db240000-0000-4000-8000-000000000003', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.objects WHERE name = 'db240000-0000-4000-8000-000000000001/avatar.jpg') THEN
    RAISE EXCEPTION 'Ineligible viewer can read avatar';
  END IF;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db240000-0000-4000-8000-000000000004', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.objects WHERE name = 'db240000-0000-4000-8000-000000000001/avatar.jpg') THEN
    RAISE EXCEPTION 'Blocked viewer can read avatar';
  END IF;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db240000-0000-4000-8000-000000000005', true);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE name = 'db240000-0000-4000-8000-000000000005/avatar.jpg') THEN
    RAISE EXCEPTION 'Owner must be able to read an onboarding upload before creating a profile';
  END IF;
END;
$$;
RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'avatars') THEN
    RAISE EXCEPTION 'Anonymous users can read private avatars';
  END IF;
END;
$$;
ROLLBACK;
