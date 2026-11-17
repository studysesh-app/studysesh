-- Run after migration 009 in a disposable Supabase database. Everything is rolled back.
BEGIN;

INSERT INTO auth.users (id) VALUES
  ('db090000-0000-4000-8000-000000000001'),
  ('db090000-0000-4000-8000-000000000002'),
  ('db090000-0000-4000-8000-000000000003'),
  ('db090000-0000-4000-8000-000000000004');

INSERT INTO public.users (id, email, name, gender, profile_visibility) VALUES
  ('db090000-0000-4000-8000-000000000001', 'visibility-1@example.invalid', 'Viewer', 'Man', 'everyone'),
  ('db090000-0000-4000-8000-000000000002', 'visibility-2@example.invalid', 'Restricted', 'Woman', 'women-nb-only'),
  ('db090000-0000-4000-8000-000000000003', 'visibility-3@example.invalid', 'Blocked', 'Woman', 'everyone'),
  ('db090000-0000-4000-8000-000000000004', 'visibility-4@example.invalid', 'Viewer', 'Non-Binary', 'everyone');

INSERT INTO public.courses (id, code, name)
VALUES ('db090000-0000-4000-8000-000000000010', 'TEST 9009', 'Visibility test');
INSERT INTO public.user_courses (user_id, course_id) VALUES
  ('db090000-0000-4000-8000-000000000002', 'db090000-0000-4000-8000-000000000010');
INSERT INTO storage.objects (bucket_id, name, metadata) VALUES
  ('proofs', 'db090000-0000-4000-8000-000000000002/TEST_9009.pdf', '{"size":100,"mimetype":"application/pdf"}');
INSERT INTO public.tutor_courses (user_id, course_id, is_approved, proof_url) VALUES
  ('db090000-0000-4000-8000-000000000002', 'db090000-0000-4000-8000-000000000010', TRUE, 'db090000-0000-4000-8000-000000000002/TEST_9009.pdf');
INSERT INTO public.posts (id, author_id, course_id, content) VALUES
  ('db090000-0000-4000-8000-000000000020', 'db090000-0000-4000-8000-000000000002', 'db090000-0000-4000-8000-000000000010', 'Test post');
INSERT INTO public.comments (id, post_id, author_id, content) VALUES
  ('db090000-0000-4000-8000-000000000021', 'db090000-0000-4000-8000-000000000020', 'db090000-0000-4000-8000-000000000004', 'Test comment');
INSERT INTO public.blocked_users (blocker_id, blocked_id) VALUES
  ('db090000-0000-4000-8000-000000000003', 'db090000-0000-4000-8000-000000000001');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db090000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  IF public.can_view_profile('db090000-0000-4000-8000-000000000002')
     OR public.can_view_profile('db090000-0000-4000-8000-000000000003') THEN
    RAISE EXCEPTION 'Restricted and reverse-blocked profiles must be hidden';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE id IN ('db090000-0000-4000-8000-000000000002', 'db090000-0000-4000-8000-000000000003'))
     OR EXISTS (SELECT 1 FROM public.user_courses WHERE user_id = 'db090000-0000-4000-8000-000000000002')
     OR EXISTS (SELECT 1 FROM public.tutor_courses WHERE user_id = 'db090000-0000-4000-8000-000000000002')
     OR EXISTS (SELECT 1 FROM public.course_tutors('db090000-0000-4000-8000-000000000010'))
     OR EXISTS (SELECT 1 FROM public.posts WHERE id = 'db090000-0000-4000-8000-000000000020')
     OR EXISTS (SELECT 1 FROM public.comments WHERE id = 'db090000-0000-4000-8000-000000000021') THEN
    RAISE EXCEPTION 'Related rows must not reveal hidden profiles or posts';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claim.sub', 'db090000-0000-4000-8000-000000000004', true);
DO $$
BEGIN
  IF NOT public.can_view_profile('db090000-0000-4000-8000-000000000002')
     OR EXISTS (SELECT 1 FROM public.tutor_courses WHERE user_id = 'db090000-0000-4000-8000-000000000002')
     OR NOT EXISTS (SELECT 1 FROM public.course_tutors('db090000-0000-4000-8000-000000000010') WHERE user_id = 'db090000-0000-4000-8000-000000000002')
     OR NOT EXISTS (SELECT 1 FROM public.posts WHERE id = 'db090000-0000-4000-8000-000000000020')
     OR NOT EXISTS (SELECT 1 FROM public.comments WHERE id = 'db090000-0000-4000-8000-000000000021') THEN
    RAISE EXCEPTION 'An eligible viewer should see the restricted profile and related rows';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claim.sub', 'db090000-0000-4000-8000-000000000003', true);
DO $$
BEGIN
  IF public.can_view_profile('db090000-0000-4000-8000-000000000001')
     OR NOT EXISTS (SELECT 1 FROM public.my_blocked_profiles() WHERE id = 'db090000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'Blockers must not see the profile but must be able to manage their block list';
  END IF;
END;
$$;

ROLLBACK;
