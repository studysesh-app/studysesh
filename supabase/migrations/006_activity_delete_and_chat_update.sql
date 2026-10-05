-- Let someone dismiss their own notifications, and withdraw a request they sent.
-- Let a participant update their own row (last_read_at, and rejoining is done by the edge function).

CREATE POLICY "activities_delete_own" ON public.activities
  FOR DELETE
  USING (user_id = auth.uid() OR actor_id = auth.uid());

CREATE POLICY "conv_participants_update_own" ON public.conversation_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
