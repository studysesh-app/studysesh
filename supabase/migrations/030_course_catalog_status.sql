-- Historical enrollments, posts and tutoring records remain linked to retired courses.
ALTER TABLE public.courses ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE OR REPLACE FUNCTION public.lock_active_course(p_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE course_id UUID;
BEGIN
  SELECT c.id INTO course_id FROM public.courses c WHERE c.code = p_code AND c.is_active FOR SHARE;
  RETURN course_id;
END;
$$;
REVOKE ALL ON FUNCTION public.lock_active_course(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lock_active_course(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_active_course()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM 1 FROM public.courses c WHERE c.id = NEW.course_id AND c.is_active FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This course is no longer available for new enrollment'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER check_active_studying_course BEFORE INSERT ON public.user_courses
  FOR EACH ROW EXECUTE FUNCTION public.check_active_course();
CREATE TRIGGER check_active_tutoring_course BEFORE INSERT ON public.tutor_courses
  FOR EACH ROW EXECUTE FUNCTION public.check_active_course();

DROP POLICY IF EXISTS "user_courses_insert" ON public.user_courses;
CREATE POLICY "user_courses_insert" ON public.user_courses FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = user_courses.course_id AND c.is_active)
  );
DROP POLICY IF EXISTS "tutor_courses_insert" ON public.tutor_courses;
CREATE POLICY "tutor_courses_insert" ON public.tutor_courses FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = tutor_courses.course_id AND c.is_active)
  );
