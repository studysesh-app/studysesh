-- Run after migration 025 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db250000-0000-4000-8000-000000000001'),
  ('db250000-0000-4000-8000-000000000002'),
  ('db250000-0000-4000-8000-000000000003'),
  ('db250000-0000-4000-8000-000000000004');
INSERT INTO public.users (id, email, name, gender, profile_visibility) VALUES
  ('db250000-0000-4000-8000-000000000001', 'live-1@example.invalid', 'Author', 'Woman', 'women-nb-only'),
  ('db250000-0000-4000-8000-000000000002', 'live-2@example.invalid', 'Eligible', 'Woman', 'everyone'),
  ('db250000-0000-4000-8000-000000000003', 'live-3@example.invalid', 'Ineligible', 'Man', 'everyone'),
  ('db250000-0000-4000-8000-000000000004', 'live-4@example.invalid', 'Blocked', 'Woman', 'everyone');
INSERT INTO public.courses (id, code, name)
VALUES ('db250000-0000-4000-8000-000000000010', 'TEST 9025', 'Realtime test');
INSERT INTO public.user_courses (user_id, course_id)
SELECT id, 'db250000-0000-4000-8000-000000000010'
FROM public.users WHERE email LIKE 'live-%@example.invalid';
INSERT INTO public.blocked_users (blocker_id, blocked_id)
VALUES ('db250000-0000-4000-8000-000000000001', 'db250000-0000-4000-8000-000000000004');
INSERT INTO public.posts (id, author_id, course_id, content)
VALUES ('db250000-0000-4000-8000-000000000020', 'db250000-0000-4000-8000-000000000001',
  'db250000-0000-4000-8000-000000000010', 'Test post');
INSERT INTO public.comments (id, post_id, author_id, content)
VALUES ('db250000-0000-4000-8000-000000000021', 'db250000-0000-4000-8000-000000000020',
  'db250000-0000-4000-8000-000000000001', 'Test comment');
INSERT INTO public.post_likes (user_id, post_id)
VALUES ('db250000-0000-4000-8000-000000000002', 'db250000-0000-4000-8000-000000000020');
DELETE FROM public.post_likes WHERE user_id = 'db250000-0000-4000-8000-000000000002'
  AND post_id = 'db250000-0000-4000-8000-000000000020';
INSERT INTO public.comment_likes (user_id, comment_id)
VALUES ('db250000-0000-4000-8000-000000000002', 'db250000-0000-4000-8000-000000000021');
DELETE FROM public.comment_likes WHERE user_id = 'db250000-0000-4000-8000-000000000002'
  AND comment_id = 'db250000-0000-4000-8000-000000000021';
DELETE FROM public.comments WHERE id = 'db250000-0000-4000-8000-000000000021';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM realtime.messages WHERE topic =
       'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000002'
       AND event = 'board_change' AND private AND payload->>'kind' = 'post_insert')
     OR NOT EXISTS (SELECT 1 FROM realtime.messages WHERE topic =
       'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000002'
       AND payload->>'kind' = 'comment_remove')
     OR (SELECT COUNT(*) FROM realtime.messages WHERE topic =
       'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000002'
       AND payload->>'kind' = 'post_change') <> 2
     OR (SELECT COUNT(*) FROM realtime.messages WHERE topic =
       'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000002'
       AND payload->>'kind' = 'comment_change') <> 2 THEN
    RAISE EXCEPTION 'Eligible viewer did not receive expected private board events';
  END IF;
  IF EXISTS (SELECT 1 FROM realtime.messages WHERE topic IN (
    'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000003',
    'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000004'
  )) THEN RAISE EXCEPTION 'Ineligible or blocked viewer received a board event'; END IF;
END;
$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db250000-0000-4000-8000-000000000002', true);
SELECT set_config('realtime.topic', 'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000002', true);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM realtime.messages WHERE event = 'board_change') THEN
    RAISE EXCEPTION 'Eligible viewer could not read their own board topic';
  END IF;
END;
$$;
SELECT set_config('realtime.topic', 'board:db250000-0000-4000-8000-000000000010:db250000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM realtime.messages WHERE event = 'board_change') THEN
    RAISE EXCEPTION 'Viewer could read another user topic';
  END IF;
END;
$$;
ROLLBACK;
