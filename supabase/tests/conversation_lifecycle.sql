-- Run after migration 018 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db180000-0000-4000-8000-000000000001'),
  ('db180000-0000-4000-8000-000000000002');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db180000-0000-4000-8000-000000000001', 'chat-lifecycle-1@example.invalid', 'Sender', 'Woman'),
  ('db180000-0000-4000-8000-000000000002', 'chat-lifecycle-2@example.invalid', 'Receiver', 'Woman');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db180000-0000-4000-8000-000000000001', true);
SELECT public.open_conversation('db180000-0000-4000-8000-000000000002');
SELECT set_config('request.jwt.claim.sub', 'db180000-0000-4000-8000-000000000002', true);
DO $$
DECLARE conversation UUID;
BEGIN
  SELECT conversation_id INTO conversation FROM public.conversation_participants
  WHERE user_id = auth.uid();
  PERFORM public.hide_conversation(conversation);
  IF NOT EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversation
    AND user_id = auth.uid() AND left_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Conversation was not hidden';
  END IF;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db180000-0000-4000-8000-000000000001', true);
DO $$
DECLARE existing UUID; reopened UUID;
BEGIN
  SELECT conversation_id INTO existing FROM public.conversation_participants WHERE user_id = auth.uid();
  reopened := (public.open_conversation('db180000-0000-4000-8000-000000000002')->>'conversationId')::UUID;
  IF reopened <> existing OR NOT EXISTS (SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = existing AND user_id = 'db180000-0000-4000-8000-000000000002' AND left_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Opening must reuse the thread without reopening the other user';
  END IF;
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (existing, auth.uid(), 'A new message');
  IF EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = existing AND left_at IS NOT NULL) THEN
    RAISE EXCEPTION 'A new message must restore the hidden thread';
  END IF;
END;
$$;
RESET ROLE;
INSERT INTO public.blocked_users (blocker_id, blocked_id)
VALUES ('db180000-0000-4000-8000-000000000002', 'db180000-0000-4000-8000-000000000001');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db180000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  BEGIN
    PERFORM public.open_conversation('db180000-0000-4000-8000-000000000002');
    RAISE EXCEPTION 'Blocked conversation was opened';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Blocked conversation was opened' THEN RAISE; END IF;
  END;
END;
$$;
ROLLBACK;
