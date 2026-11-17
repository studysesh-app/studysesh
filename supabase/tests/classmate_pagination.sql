-- Run after migration 015 in a disposable Supabase database. Everything is rolled back.
BEGIN;

INSERT INTO auth.users (id) VALUES ('db150000-0000-4000-8000-000000000001');
INSERT INTO auth.users (id)
SELECT ('db150000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::UUID
FROM generate_series(101, 170) n;
INSERT INTO public.users (id, email, name, gender, profile_visibility)
VALUES ('db150000-0000-4000-8000-000000000001', 'page-viewer@example.invalid', 'Viewer', 'Man', 'everyone');
INSERT INTO public.users (id, email, name, gender, profile_visibility)
SELECT ('db150000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::UUID,
       'page-' || n || '@example.invalid', 'Student', 'Woman',
       CASE WHEN n = 102 THEN 'women-nb-only' ELSE 'everyone' END
FROM generate_series(101, 170) n;
INSERT INTO public.courses (id, code, name)
VALUES ('db150000-0000-4000-8000-000000000010', 'TEST 9016', 'Pagination test');
INSERT INTO public.user_courses (user_id, course_id)
SELECT id, 'db150000-0000-4000-8000-000000000010'
FROM public.users WHERE email LIKE 'page-%@example.invalid';
INSERT INTO public.blocked_users (blocker_id, blocked_id)
VALUES ('db150000-0000-4000-8000-000000000067', 'db150000-0000-4000-8000-000000000001');
INSERT INTO public.connections (requester_id, receiver_id, status)
VALUES ('db150000-0000-4000-8000-000000000001', 'db150000-0000-4000-8000-000000000068', 'accepted');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db150000-0000-4000-8000-000000000001', true);
DO $$
DECLARE cursor_one UUID; cursor_two UUID; first_count INTEGER; second_count INTEGER; final_count INTEGER;
BEGIN
  SELECT count(*) INTO first_count FROM public.classmate_page(NULL, 30);
  SELECT id INTO cursor_one FROM public.classmate_page(NULL, 30) ORDER BY id OFFSET 29 LIMIT 1;
  SELECT count(*) INTO second_count FROM public.classmate_page(cursor_one, 30);
  SELECT id INTO cursor_two FROM public.classmate_page(cursor_one, 30) ORDER BY id OFFSET 29 LIMIT 1;
  SELECT count(*) INTO final_count FROM public.classmate_page(cursor_two, 30);
  IF first_count <> 31 OR second_count <> 31 OR final_count <> 7 OR cursor_one >= cursor_two THEN
    RAISE EXCEPTION 'Classmate pages must be stable and complete: %, %, %', first_count, second_count, final_count;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.classmate_page(NULL, 50)
    WHERE id IN ('db150000-0000-4000-8000-000000000066', 'db150000-0000-4000-8000-000000000067', 'db150000-0000-4000-8000-000000000068')
  ) THEN
    RAISE EXCEPTION 'Restricted, blocked and connected profiles must be excluded';
  END IF;
  IF EXISTS (SELECT 1 FROM public.classmate_page(NULL, 30) WHERE shared_courses <> ARRAY['TEST 9016']::TEXT[]) THEN
    RAISE EXCEPTION 'Shared courses must be included';
  END IF;
END;
$$;

ROLLBACK;
