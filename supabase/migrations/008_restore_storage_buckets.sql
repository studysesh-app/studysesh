-- Restore buckets if they were removed from the hosted project.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', TRUE),
  ('proofs', 'proofs', FALSE)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "proofs_owner_read" ON storage.objects;
DROP POLICY IF EXISTS "proofs_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "proofs_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "proofs_owner_delete" ON storage.objects;

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "proofs_owner_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "proofs_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "proofs_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "proofs_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
