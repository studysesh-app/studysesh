-- Hiding a thread preserves both participants and its history. A later message
-- makes it visible again; opening it explicitly only reopens it for the caller.
ALTER TABLE public.conversation_participants ADD COLUMN left_at TIMESTAMPTZ;

CREATE TABLE public.conversation_pairs (
  conversation_id UUID PRIMARY KEY REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_low UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_high UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  UNIQUE (user_low, user_high),
  CHECK (user_low < user_high)
);
ALTER TABLE public.conversation_pairs ENABLE ROW LEVEL SECURITY;

-- Preserve the oldest complete thread when duplicate legacy threads exist.
WITH pairs AS (
  SELECT p.conversation_id, (array_agg(p.user_id ORDER BY p.user_id))[1] AS user_low,
    (array_agg(p.user_id ORDER BY p.user_id))[2] AS user_high, c.created_at
  FROM public.conversation_participants p
  JOIN public.conversations c ON c.id = p.conversation_id
  GROUP BY p.conversation_id, c.created_at
  HAVING COUNT(*) = 2
)
INSERT INTO public.conversation_pairs (conversation_id, user_low, user_high)
SELECT DISTINCT ON (user_low, user_high) conversation_id, user_low, user_high
FROM pairs
ORDER BY user_low, user_high, created_at, conversation_id;

CREATE OR REPLACE FUNCTION public.open_conversation(p_other_user UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller UUID := auth.uid();
  low_id UUID;
  high_id UUID;
  result_id UUID;
  created BOOLEAN := FALSE;
BEGIN
  IF caller IS NULL OR p_other_user IS NULL OR caller = p_other_user
     OR NOT public.can_view_profile(p_other_user) THEN
    RAISE EXCEPTION 'Cannot start a conversation with this user';
  END IF;
  low_id := LEAST(caller, p_other_user);
  high_id := GREATEST(caller, p_other_user);
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(low_id::TEXT || high_id::TEXT, 0));
  IF NOT public.can_view_profile(p_other_user) THEN
    RAISE EXCEPTION 'Cannot start a conversation with this user';
  END IF;

  SELECT conversation_id INTO result_id FROM public.conversation_pairs
  WHERE user_low = low_id AND user_high = high_id;
  IF result_id IS NULL THEN
    INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO result_id;
    INSERT INTO public.conversation_pairs (conversation_id, user_low, user_high)
    VALUES (result_id, low_id, high_id);
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (result_id, caller), (result_id, p_other_user);
    created := TRUE;
  ELSE
    UPDATE public.conversation_participants SET left_at = NULL
    WHERE conversation_id = result_id AND user_id = caller;
  END IF;
  RETURN pg_catalog.jsonb_build_object('conversationId', result_id, 'created', created);
END;
$$;
REVOKE ALL ON FUNCTION public.open_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_conversation(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.hide_conversation(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.conversation_participants
  SET left_at = pg_catalog.now(), last_read_at = pg_catalog.now()
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Conversation could not be hidden'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.hide_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hide_conversation(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.reopen_conversation_for_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.conversation_participants
  SET last_read_at = left_at, left_at = NULL
  WHERE conversation_id = NEW.conversation_id AND left_at IS NOT NULL;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reopen_conversation_for_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.reopen_conversation_for_message();

REVOKE UPDATE ON public.conversation_participants FROM PUBLIC, anon, authenticated;
GRANT UPDATE (left_at, last_read_at) ON public.conversation_participants TO authenticated;

CREATE INDEX idx_messages_conversation_cursor
  ON public.messages (conversation_id, created_at DESC, id DESC);
