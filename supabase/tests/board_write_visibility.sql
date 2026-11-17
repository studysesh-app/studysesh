-- Run after migration 026 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db260000-0000-4000-8000-000000000001'),
  ('db260000-0000-4000-8000-000000000002'),
  ('db260000-0000-4000-8000-000000000003');
INSERT INTO public.users (id, email, name, gender, profile_visibility) VALUES
  ('db260000-0000-4000-8000-000000000001', 'board-write-1@example.invalid', 'Author', 'Woman', 'women-nb-only'),
  ('db260000-0000-4000-8000-000000000002', 'board-write-2@example.invalid', 'Ineligible', 'Man', 'everyone'),
  ('db260000-0000-4000-8000-000000000003', 'board-write-3@example.invalid', 'Eligible', 'Woman', 'everyone');
INSERT INTO public.courses (id, code, name)
VALUES ('db260000-0000-4000-8000-000000000010', 'TEST 9026', 'Write visibility');
INSERT INTO public.posts (id, author_id, course_id, content) VALUES
  ('db260000-0000-4000-8000-000000000020', 'db260000-0000-4000-8000-000000000001',
   'db260000-0000-4000-8000-000000000010', 'Hidden post');
INSERT INTO public.comments (id, post_id, author_id, content) VALUES
  ('db260000-0000-4000-8000-000000000021', 'db260000-0000-4000-8000-000000000020',
   'db260000-0000-4000-8000-000000000001', 'Hidden comment');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db260000-0000-4000-8000-000000000002', true);
DO $$
BEGIN
  BEGIN
    INSERT INTO public.post_likes (user_id, post_id) VALUES (auth.uid(), 'db260000-0000-4000-8000-000000000020');
    RAISE EXCEPTION 'Hidden post was liked';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.comments (post_id, author_id, content)
    VALUES ('db260000-0000-4000-8000-000000000020', auth.uid(), 'Unauthorized');
    RAISE EXCEPTION 'Hidden post was commented on';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.comment_likes (user_id, comment_id) VALUES (auth.uid(), 'db260000-0000-4000-8000-000000000021');
    RAISE EXCEPTION 'Hidden comment was liked';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db260000-0000-4000-8000-000000000003', true);
INSERT INTO public.post_likes (user_id, post_id) VALUES (auth.uid(), 'db260000-0000-4000-8000-000000000020');
INSERT INTO public.comments (id, post_id, author_id, parent_id, content)
VALUES ('db260000-0000-4000-8000-000000000022', 'db260000-0000-4000-8000-000000000020', auth.uid(),
  'db260000-0000-4000-8000-000000000021', 'Allowed reply');
DO $$
BEGIN
  BEGIN
    INSERT INTO public.comments (post_id, author_id, parent_id, content)
    VALUES ('db260000-0000-4000-8000-000000000020', auth.uid(), 'db260000-0000-4000-8000-000000000022', 'Nested');
    RAISE EXCEPTION 'Nested reply was accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
ROLLBACK;
