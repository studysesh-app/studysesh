-- Run after migration 010 in a disposable Supabase database. Everything is rolled back.
BEGIN;

INSERT INTO auth.users (id) VALUES
  ('db100000-0000-4000-8000-000000000001'),
  ('db100000-0000-4000-8000-000000000002');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db100000-0000-4000-8000-000000000001', 'chat-1@example.invalid', 'Sender', 'Man'),
  ('db100000-0000-4000-8000-000000000002', 'chat-2@example.invalid', 'Recipient', 'Woman');
INSERT INTO public.conversations (id)
VALUES ('db100000-0000-4000-8000-000000000010');
INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES
  ('db100000-0000-4000-8000-000000000010', 'db100000-0000-4000-8000-000000000001'),
  ('db100000-0000-4000-8000-000000000010', 'db100000-0000-4000-8000-000000000002');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db100000-0000-4000-8000-000000000001', true);
INSERT INTO public.messages (id, conversation_id, sender_id, content) VALUES
  ('db100000-0000-4000-8000-000000000020', 'db100000-0000-4000-8000-000000000010', 'db100000-0000-4000-8000-000000000001', 'Test message');
DO $$
BEGIN
  IF (SELECT count(*) FROM public.conversation_participants WHERE conversation_id = 'db100000-0000-4000-8000-000000000010') <> 2 THEN
    RAISE EXCEPTION 'Participants should be visible without recursive RLS';
  END IF;
  BEGIN
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES ('db100000-0000-4000-8000-000000000010', 'db100000-0000-4000-8000-000000000001');
    RAISE EXCEPTION 'Direct participant insertion must be denied';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE public.messages SET content = 'Altered' WHERE id = 'db100000-0000-4000-8000-000000000020';
    RAISE EXCEPTION 'Message content updates must be denied';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;

SELECT set_config('request.jwt.claim.sub', 'db100000-0000-4000-8000-000000000002', true);
UPDATE public.messages SET status = 'delivered' WHERE id = 'db100000-0000-4000-8000-000000000020';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.messages WHERE id = 'db100000-0000-4000-8000-000000000020' AND status = 'delivered') THEN
    RAISE EXCEPTION 'Recipient should be able to mark a message delivered';
  END IF;
END;
$$;

RESET ROLE;
INSERT INTO public.blocked_users (blocker_id, blocked_id) VALUES
  ('db100000-0000-4000-8000-000000000002', 'db100000-0000-4000-8000-000000000001');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db100000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  IF public.can_access_conversation('db100000-0000-4000-8000-000000000010')
     OR EXISTS (SELECT 1 FROM public.messages WHERE id = 'db100000-0000-4000-8000-000000000020')
     OR EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = 'db100000-0000-4000-8000-000000000010') THEN
    RAISE EXCEPTION 'A block must hide the conversation in both directions';
  END IF;
  BEGIN
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES ('db100000-0000-4000-8000-000000000010', 'db100000-0000-4000-8000-000000000001', 'Blocked message');
    RAISE EXCEPTION 'A blocked participant must not send messages';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;

ROLLBACK;
