-- Run after migration 019 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db190000-0000-4000-8000-000000000001'),
  ('db190000-0000-4000-8000-000000000002');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db190000-0000-4000-8000-000000000001', 'summary-1@example.invalid', 'Sender', 'Woman'),
  ('db190000-0000-4000-8000-000000000002', 'summary-2@example.invalid', 'Receiver', 'Woman');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db190000-0000-4000-8000-000000000001', true);
SELECT public.open_conversation('db190000-0000-4000-8000-000000000002');
INSERT INTO public.messages (conversation_id, sender_id, content, created_at)
SELECT p.conversation_id, auth.uid(), 'Message ' || n, '2026-01-01'::TIMESTAMPTZ + n * INTERVAL '1 second'
FROM public.conversation_participants p CROSS JOIN generate_series(1, 1050) n
WHERE p.user_id = auth.uid();
SELECT set_config('request.jwt.claim.sub', 'db190000-0000-4000-8000-000000000002', true);
DO $$
DECLARE conversation UUID;
BEGIN
  SELECT id INTO conversation FROM public.conversation_summary_page();
  IF public.unread_message_count() <> 1050 OR NOT EXISTS (
    SELECT 1 FROM public.conversation_summary_page()
    WHERE id = conversation AND unread_count = 1050 AND last_content = 'Message 1050'
  ) THEN
    RAISE EXCEPTION 'Summary must count all messages and return the latest message';
  END IF;
  PERFORM public.hide_conversation(conversation);
  IF public.unread_message_count() <> 0 OR EXISTS (SELECT 1 FROM public.conversation_summary_page()) THEN
    RAISE EXCEPTION 'Hidden conversations must not appear or contribute unread messages';
  END IF;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db190000-0000-4000-8000-000000000001', true);
INSERT INTO public.messages (conversation_id, sender_id, content, created_at)
SELECT p.conversation_id, auth.uid(), 'After hiding', clock_timestamp() + INTERVAL '1 second'
FROM public.conversation_participants p WHERE p.user_id = auth.uid();
SELECT set_config('request.jwt.claim.sub', 'db190000-0000-4000-8000-000000000002', true);
DO $$
BEGIN
  IF public.unread_message_count() <> 1 OR NOT EXISTS (
    SELECT 1 FROM public.conversation_summary_page() WHERE unread_count = 1 AND last_content = 'After hiding'
  ) THEN RAISE EXCEPTION 'Only the new message should be unread after reopening'; END IF;
END;
$$;
RESET ROLE;
INSERT INTO auth.users (id)
SELECT ('db190000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::UUID
FROM generate_series(200, 234) n;
INSERT INTO public.users (id, email, name, gender)
SELECT ('db190000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::UUID,
       'summary-' || n || '@example.invalid', 'Student', 'Woman'
FROM generate_series(200, 234) n;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db190000-0000-4000-8000-000000000001', true);
DO $$
DECLARE n INTEGER; cutoff_at TIMESTAMPTZ; cutoff_id UUID; first_count INTEGER; second_count INTEGER;
BEGIN
  FOR n IN 200..234 LOOP
    PERFORM public.open_conversation(('db190000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::UUID);
  END LOOP;
  SELECT count(*) INTO first_count FROM public.conversation_summary_page(NULL, NULL, 30);
  SELECT sort_at, id INTO cutoff_at, cutoff_id
  FROM public.conversation_summary_page(NULL, NULL, 30) ORDER BY sort_at DESC, id DESC OFFSET 29 LIMIT 1;
  SELECT count(*) INTO second_count FROM public.conversation_summary_page(cutoff_at, cutoff_id, 30);
  IF first_count <> 31 OR second_count <> 6 THEN
    RAISE EXCEPTION 'Conversation pages must contain all 36 threads: %, %', first_count, second_count;
  END IF;
END;
$$;
ROLLBACK;
