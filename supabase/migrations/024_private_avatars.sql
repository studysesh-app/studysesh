-- A private bucket ensures a known object URL is not sufficient to read a photo.
DO $$
BEGIN
  UPDATE storage.buckets SET public = FALSE WHERE id = 'avatars';
  IF NOT FOUND THEN RAISE EXCEPTION 'The avatars bucket is missing'; END IF;
END;
$$;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_visible_read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR CASE
        WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN public.can_view_profile(((storage.foldername(name))[1])::UUID)
        ELSE FALSE
      END
    )
  );
