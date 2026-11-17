-- Run after migration 027 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db270000-0000-4000-8000-000000000001'),
  ('db270000-0000-4000-8000-000000000002');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db270000-0000-4000-8000-000000000001', 'delete-1@example.invalid', 'Deleting', 'Woman'),
  ('db270000-0000-4000-8000-000000000002', 'delete-2@example.invalid', 'Remaining', 'Woman');
INSERT INTO public.courses (id, code, name)
VALUES ('db270000-0000-4000-8000-000000000010', 'TEST 9027', 'Deletion test');
INSERT INTO public.posts (id, author_id, course_id, content) VALUES
  ('db270000-0000-4000-8000-000000000020', 'db270000-0000-4000-8000-000000000002',
   'db270000-0000-4000-8000-000000000010', 'Post');
INSERT INTO public.comments (id, post_id, author_id, parent_id, content) VALUES
  ('db270000-0000-4000-8000-000000000021', 'db270000-0000-4000-8000-000000000020', 'db270000-0000-4000-8000-000000000001', NULL, 'Parent'),
  ('db270000-0000-4000-8000-000000000022', 'db270000-0000-4000-8000-000000000020', 'db270000-0000-4000-8000-000000000002', 'db270000-0000-4000-8000-000000000021', 'Reply');
INSERT INTO public.activities (id, user_id, actor_id, type) VALUES
  ('db270000-0000-4000-8000-000000000023', 'db270000-0000-4000-8000-000000000002', 'db270000-0000-4000-8000-000000000001', 'board_like');
INSERT INTO public.conversations (id) VALUES ('db270000-0000-4000-8000-000000000030');
INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES
  ('db270000-0000-4000-8000-000000000030', 'db270000-0000-4000-8000-000000000001'),
  ('db270000-0000-4000-8000-000000000030', 'db270000-0000-4000-8000-000000000002');

SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF public.begin_account_deletion('db270000-0000-4000-8000-000000000001') IS NULL
     OR public.begin_account_deletion('db270000-0000-4000-8000-000000000001') IS NOT NULL THEN
    RAISE EXCEPTION 'Deletion lease did not prevent a concurrent attempt';
  END IF;
END;
$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db270000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  IF public.can_upload_account_files() THEN RAISE EXCEPTION 'Uploads allowed during deletion'; END IF;
  BEGIN
    INSERT INTO storage.objects (bucket_id, name) VALUES
      ('avatars', 'db270000-0000-4000-8000-000000000001/avatar.jpg');
    RAISE EXCEPTION 'Avatar upload succeeded during deletion';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
SET LOCAL ROLE service_role;
UPDATE public.account_deletions SET expires_at = now() - INTERVAL '1 second'
WHERE user_id = 'db270000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF NOT public.can_upload_account_files() THEN RAISE EXCEPTION 'Expired lease still blocked uploads'; END IF;
END;
$$;
SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF public.begin_account_deletion('db270000-0000-4000-8000-000000000001') IS NULL THEN
    RAISE EXCEPTION 'Expired deletion lease could not be reclaimed';
  END IF;
END;
$$;
DELETE FROM public.account_deletions WHERE user_id = 'db270000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF NOT public.can_upload_account_files() THEN RAISE EXCEPTION 'Uploads remained blocked after lease release'; END IF;
END;
$$;
RESET ROLE;
DELETE FROM auth.users WHERE id = 'db270000-0000-4000-8000-000000000001';
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.comments WHERE id IN ('db270000-0000-4000-8000-000000000021', 'db270000-0000-4000-8000-000000000022'))
     OR NOT EXISTS (SELECT 1 FROM public.activities WHERE id = 'db270000-0000-4000-8000-000000000023' AND actor_id IS NULL)
     OR NOT EXISTS (SELECT 1 FROM public.conversations WHERE id = 'db270000-0000-4000-8000-000000000030') THEN
    RAISE EXCEPTION 'Deleting one account did not preserve the other user correctly';
  END IF;
END;
$$;
DELETE FROM auth.users WHERE id = 'db270000-0000-4000-8000-000000000002';
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.conversations WHERE id = 'db270000-0000-4000-8000-000000000030') THEN
    RAISE EXCEPTION 'Empty conversation was not cleaned up';
  END IF;
END;
$$;
ROLLBACK;
