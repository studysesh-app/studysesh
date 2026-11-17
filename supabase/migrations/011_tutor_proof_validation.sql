-- Existing unverified listings are left unchanged until reviewed. New approved
-- listings and changes to their proof must reference an owned stored document.
CREATE OR REPLACE FUNCTION public.validate_tutor_proof()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  course_code TEXT;
  path_prefix TEXT;
  object_metadata JSONB;
  object_size NUMERIC;
  object_type TEXT;
BEGIN
  IF NEW.is_approved IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  SELECT code INTO course_code FROM public.courses WHERE id = NEW.course_id;
  path_prefix := NEW.user_id::TEXT || '/' || pg_catalog.regexp_replace(course_code, '\s+', '_', 'g') || '.';
  IF course_code IS NULL OR NEW.proof_url IS NULL
     OR pg_catalog.left(NEW.proof_url, pg_catalog.length(path_prefix)) <> path_prefix
     OR pg_catalog.substr(NEW.proof_url, pg_catalog.length(path_prefix) + 1) !~ '^[A-Za-z0-9]+$' THEN
    RAISE EXCEPTION 'A proof document for this course is required';
  END IF;

  SELECT metadata INTO object_metadata
  FROM storage.objects
  WHERE bucket_id = 'proofs' AND name = NEW.proof_url;

  IF object_metadata IS NULL OR COALESCE(object_metadata ->> 'size', '') !~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'The proof document could not be verified';
  END IF;
  object_size := (object_metadata ->> 'size')::NUMERIC;
  object_type := pg_catalog.lower(COALESCE(object_metadata ->> 'mimetype', ''));
  IF object_size < 1 OR object_size > 10485760
     OR (object_type <> 'application/pdf' AND object_type NOT LIKE 'image/%') THEN
    RAISE EXCEPTION 'Proof must be a PDF or image no larger than 10 MB';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_tutor_proof ON public.tutor_courses;
CREATE TRIGGER validate_tutor_proof
  BEFORE INSERT OR UPDATE OF proof_url, user_id, course_id, is_approved
  ON public.tutor_courses
  FOR EACH ROW EXECUTE FUNCTION public.validate_tutor_proof();

-- A referenced proof cannot be overwritten or deleted through the client.
DROP POLICY IF EXISTS "proofs_owner_update" ON storage.objects;
CREATE POLICY "proofs_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT
    AND NOT EXISTS (SELECT 1 FROM public.tutor_courses t WHERE t.user_id = auth.uid() AND t.proof_url = storage.objects.name)
  )
  WITH CHECK (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "proofs_owner_delete" ON storage.objects;
CREATE POLICY "proofs_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT
    AND NOT EXISTS (SELECT 1 FROM public.tutor_courses t WHERE t.user_id = auth.uid() AND t.proof_url = storage.objects.name)
  );
