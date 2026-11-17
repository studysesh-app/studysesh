-- Run after migration 023 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES ('db230000-0000-4000-8000-000000000001');
INSERT INTO public.users (id, email, name, gender)
VALUES ('db230000-0000-4000-8000-000000000001', 'board-page@example.invalid', 'Student', 'Woman');
INSERT INTO public.courses (id, code, name)
VALUES ('db230000-0000-4000-8000-000000000010', 'TEST 9023', 'Board pagination');
INSERT INTO public.posts (id, author_id, course_id, content, created_at)
SELECT ('db230000-0000-4000-8001-' || lpad(to_hex(n), 12, '0'))::UUID,
  'db230000-0000-4000-8000-000000000001', 'db230000-0000-4000-8000-000000000010',
  'Post ' || n, '2026-01-01'::TIMESTAMPTZ
FROM generate_series(1, 65) n;
INSERT INTO public.comments (id, post_id, author_id, content, created_at)
SELECT ('db230000-0000-4000-8002-' || lpad(to_hex(n), 12, '0'))::UUID,
  'db230000-0000-4000-8001-000000000001', 'db230000-0000-4000-8000-000000000001',
  'Comment ' || n, '2026-01-01'::TIMESTAMPTZ
FROM generate_series(1, 65) n;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db230000-0000-4000-8000-000000000001', true);
DO $$
DECLARE
  post_time TIMESTAMPTZ; post_id UUID; comment_time TIMESTAMPTZ; comment_id UUID;
BEGIN
  IF (SELECT count(*) FROM public.board_posts_page('db230000-0000-4000-8000-000000000010')) <> 31 THEN
    RAISE EXCEPTION 'First post page must include a next-page sentinel';
  END IF;
  SELECT created_at, id INTO post_time, post_id
  FROM public.board_posts_page('db230000-0000-4000-8000-000000000010')
  ORDER BY created_at DESC, id DESC OFFSET 29 LIMIT 1;
  IF (SELECT count(*) FROM public.board_posts_page('db230000-0000-4000-8000-000000000010', post_time, post_id)) <> 31 THEN
    RAISE EXCEPTION 'Second post page is incomplete';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.board_posts_page('db230000-0000-4000-8000-000000000010',
    NULL, NULL, 1, 'db230000-0000-4000-8001-000000000001') WHERE comments = 65) THEN
    RAISE EXCEPTION 'Comment counts must not be capped by response limits';
  END IF;
  SELECT created_at, id INTO comment_time, comment_id
  FROM public.board_comments_page('db230000-0000-4000-8001-000000000001')
  ORDER BY created_at, id OFFSET 29 LIMIT 1;
  IF (SELECT count(*) FROM public.board_comments_page('db230000-0000-4000-8001-000000000001', comment_time, comment_id)) <> 31 THEN
    RAISE EXCEPTION 'Second comment page is incomplete';
  END IF;
END;
$$;
ROLLBACK;
