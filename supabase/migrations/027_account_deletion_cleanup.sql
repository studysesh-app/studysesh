-- Deleting an author must not be blocked by another user's activity or reply.
ALTER TABLE public.activities DROP CONSTRAINT activities_actor_id_fkey;
ALTER TABLE public.activities ADD CONSTRAINT activities_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.comments DROP CONSTRAINT comments_parent_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.remove_empty_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.conversations c WHERE c.id = OLD.conversation_id
    AND NOT EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id);
  RETURN OLD;
END;
$$;
CREATE TRIGGER remove_empty_conversation AFTER DELETE ON public.conversation_participants
  FOR EACH ROW EXECUTE FUNCTION public.remove_empty_conversation();

-- A short lease prevents new uploads while the account's storage is being removed.
CREATE TABLE public.account_deletions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_deletions TO service_role;

CREATE OR REPLACE FUNCTION public.begin_account_deletion(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE attempt UUID := pg_catalog.gen_random_uuid(); claimed UUID;
BEGIN
  INSERT INTO public.account_deletions (user_id, attempt_id, expires_at)
  VALUES (p_user_id, attempt, pg_catalog.now() + INTERVAL '15 minutes')
  ON CONFLICT (user_id) DO UPDATE SET attempt_id = EXCLUDED.attempt_id, expires_at = EXCLUDED.expires_at
    WHERE public.account_deletions.expires_at <= pg_catalog.now()
  RETURNING attempt_id INTO claimed;
  RETURN claimed;
END;
$$;
REVOKE ALL ON FUNCTION public.begin_account_deletion(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.begin_account_deletion(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.can_upload_account_files()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid())
    AND NOT EXISTS (SELECT 1 FROM public.account_deletions d WHERE d.user_id = auth.uid() AND d.expires_at > pg_catalog.now());
$$;
REVOKE ALL ON FUNCTION public.can_upload_account_files() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_upload_account_files() TO authenticated;

DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
CREATE POLICY "avatars_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files());
DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files())
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files());
DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files());

DROP POLICY IF EXISTS "proofs_owner_insert" ON storage.objects;
CREATE POLICY "proofs_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files());
DROP POLICY IF EXISTS "proofs_owner_update" ON storage.objects;
CREATE POLICY "proofs_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files()
    AND NOT EXISTS (SELECT 1 FROM public.tutor_courses t WHERE t.user_id = auth.uid() AND t.proof_url = storage.objects.name)
  )
  WITH CHECK (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files());
DROP POLICY IF EXISTS "proofs_owner_delete" ON storage.objects;
CREATE POLICY "proofs_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT AND public.can_upload_account_files()
    AND NOT EXISTS (SELECT 1 FROM public.tutor_courses t WHERE t.user_id = auth.uid() AND t.proof_url = storage.objects.name)
  );
