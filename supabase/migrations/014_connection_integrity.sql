-- Refuse deployment if duplicate active pairs exist; resolve them explicitly first.
CREATE UNIQUE INDEX connections_active_pair_unique
  ON public.connections (LEAST(requester_id, receiver_id), GREATEST(requester_id, receiver_id))
  WHERE status IN ('pending', 'accepted');

DROP POLICY IF EXISTS "connections_insert" ON public.connections;
CREATE POLICY "connections_insert" ON public.connections FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND receiver_id <> auth.uid()
    AND status = 'pending'
    AND public.can_view_profile(receiver_id)
  );

DROP POLICY IF EXISTS "connections_update" ON public.connections;
CREATE POLICY "connections_update" ON public.connections FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid() AND status = 'pending' AND public.can_view_profile(requester_id))
  WITH CHECK (receiver_id = auth.uid() AND status = 'accepted' AND public.can_view_profile(requester_id));

REVOKE UPDATE ON public.connections FROM PUBLIC, anon, authenticated;
GRANT UPDATE (status) ON public.connections TO authenticated;
