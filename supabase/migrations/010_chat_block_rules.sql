-- Participant checks must bypass participant RLS to avoid recursive policies
-- and must inspect blocks in both directions.
CREATE OR REPLACE FUNCTION public.can_access_conversation(target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants mine
      WHERE mine.conversation_id = target_id AND mine.user_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.conversation_participants other
      JOIN public.blocked_users b
        ON (b.blocker_id = auth.uid() AND b.blocked_id = other.user_id)
        OR (b.blocker_id = other.user_id AND b.blocked_id = auth.uid())
      WHERE other.conversation_id = target_id AND other.user_id <> auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.can_access_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_conversation(UUID) TO authenticated;

DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT TO authenticated
  USING (public.can_access_conversation(id));

DROP POLICY IF EXISTS "conv_participants_select" ON public.conversation_participants;
CREATE POLICY "conv_participants_select" ON public.conversation_participants FOR SELECT TO authenticated
  USING (public.can_access_conversation(conversation_id));

-- Only the service-role Edge Function creates conversations and participants.
DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
DROP POLICY IF EXISTS "conv_participants_insert" ON public.conversation_participants;

DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated
  USING (public.can_access_conversation(conversation_id));

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND status = 'sent'
    AND public.can_access_conversation(conversation_id)
  );

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages FOR UPDATE TO authenticated
  USING (sender_id <> auth.uid() AND status = 'sent' AND public.can_access_conversation(conversation_id))
  WITH CHECK (status = 'delivered' AND public.can_access_conversation(conversation_id));

REVOKE UPDATE ON public.messages FROM PUBLIC, anon, authenticated;
GRANT UPDATE (status) ON public.messages TO authenticated;
