-- Run after migration 013 in a disposable Supabase database. Everything is rolled back.
BEGIN;

INSERT INTO auth.users (id) VALUES ('db130000-0000-4000-8000-000000000001');
INSERT INTO public.users (id, email, name, gender, bio, status)
VALUES ('db130000-0000-4000-8000-000000000001', 'limits@example.invalid', repeat('N', 100), 'Woman', repeat('B', 300), repeat('S', 24));
INSERT INTO public.courses (id, code, name)
VALUES ('db130000-0000-4000-8000-000000000010', 'TEST 9015', 'Limits test');
INSERT INTO public.posts (id, author_id, course_id, content)
VALUES ('db130000-0000-4000-8000-000000000020', 'db130000-0000-4000-8000-000000000001', 'db130000-0000-4000-8000-000000000010', repeat('P', 5000));
INSERT INTO public.comments (id, post_id, author_id, content)
VALUES ('db130000-0000-4000-8000-000000000021', 'db130000-0000-4000-8000-000000000020', 'db130000-0000-4000-8000-000000000001', repeat('C', 500));
INSERT INTO public.user_prompts (user_id, prompt, answer)
VALUES ('db130000-0000-4000-8000-000000000001', 'Question', repeat('A', 150));
INSERT INTO public.conversations (id) VALUES ('db130000-0000-4000-8000-000000000030');
INSERT INTO public.messages (id, conversation_id, sender_id, content)
VALUES ('db130000-0000-4000-8000-000000000031', 'db130000-0000-4000-8000-000000000030', 'db130000-0000-4000-8000-000000000001', repeat('M', 4000));

DO $$
BEGIN
  BEGIN
    UPDATE public.users SET name = repeat('N', 101) WHERE id = 'db130000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'Oversized name accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.users SET bio = repeat('B', 301) WHERE id = 'db130000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'Oversized bio accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.users SET status = repeat('S', 25) WHERE id = 'db130000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'Oversized status accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.user_prompts SET answer = repeat('A', 151) WHERE user_id = 'db130000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'Oversized prompt answer accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.posts SET content = repeat('P', 5001) WHERE id = 'db130000-0000-4000-8000-000000000020';
    RAISE EXCEPTION 'Oversized post accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.comments SET content = repeat('C', 501) WHERE id = 'db130000-0000-4000-8000-000000000021';
    RAISE EXCEPTION 'Oversized comment accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.messages SET content = repeat('M', 4001) WHERE id = 'db130000-0000-4000-8000-000000000031';
    RAISE EXCEPTION 'Oversized message accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.messages SET content = ' ' || chr(10) || chr(9) WHERE id = 'db130000-0000-4000-8000-000000000031';
    RAISE EXCEPTION 'Whitespace-only message accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.tutor_courses (user_id, course_id, is_approved, group_price, session_type)
    VALUES ('db130000-0000-4000-8000-000000000001', 'db130000-0000-4000-8000-000000000010', FALSE, 11, 'both');
    RAISE EXCEPTION 'Out-of-range tutor price accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.tutor_courses (user_id, course_id, is_approved, group_price, session_type)
    VALUES ('db130000-0000-4000-8000-000000000001', 'db130000-0000-4000-8000-000000000010', FALSE, 6, 'invalid');
    RAISE EXCEPTION 'Invalid session type accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
END;
$$;

ROLLBACK;
