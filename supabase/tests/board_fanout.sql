-- Run after migration 025 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES ('db310000-0000-4000-8000-000000000001');
INSERT INTO auth.users (id)
SELECT ('db310000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::UUID
FROM generate_series(100, 1199) n;
INSERT INTO public.users (id, email, name, gender, profile_visibility)
VALUES ('db310000-0000-4000-8000-000000000001', 'fanout-author@example.invalid', 'Author', 'Woman', 'everyone');
INSERT INTO public.users (id, email, name, gender, profile_visibility)
SELECT ('db310000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::UUID,
  'fanout-' || n || '@example.invalid', 'Student', 'Woman', 'everyone'
FROM generate_series(100, 1199) n;
INSERT INTO public.courses (id, code, name)
VALUES ('db310000-0000-4000-8000-000000000010', 'TEST 9032', 'Fanout test');
INSERT INTO public.user_courses (user_id, course_id)
SELECT id, 'db310000-0000-4000-8000-000000000010'
FROM public.users WHERE email LIKE 'fanout-%@example.invalid';
INSERT INTO public.posts (id, author_id, course_id, content)
VALUES ('db310000-0000-4000-8000-000000000020', 'db310000-0000-4000-8000-000000000001',
  'db310000-0000-4000-8000-000000000010', 'Test post');
DO $$
BEGIN
  IF (SELECT count(*) FROM realtime.messages WHERE event = 'board_change'
    AND payload->>'post_id' = 'db310000-0000-4000-8000-000000000020') <> 1101 THEN
    RAISE EXCEPTION 'Board fanout did not cover all eligible course members';
  END IF;
END;
$$;
ROLLBACK;
