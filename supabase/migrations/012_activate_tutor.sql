-- Promote an existing student and add the initial tutoring courses atomically.
CREATE OR REPLACE FUNCTION public.activate_tutor(p_courses JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  caller_id UUID := auth.uid();
  item RECORD;
  selected_course_id UUID;
BEGIN
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF COALESCE(pg_catalog.jsonb_typeof(p_courses), '') <> 'array'
     OR pg_catalog.jsonb_array_length(p_courses) = 0 THEN
    RAISE EXCEPTION 'Select at least one tutoring course';
  END IF;

  PERFORM 1 FROM public.users WHERE id = caller_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  FOR item IN
    SELECT * FROM pg_catalog.jsonb_to_recordset(p_courses)
      AS c(course_code TEXT, proof_url TEXT, group_price NUMERIC, individual_price NUMERIC, session_type TEXT)
  LOOP
    IF item.group_price IS NULL OR item.group_price NOT BETWEEN 2 AND 10
       OR item.individual_price IS NULL OR item.individual_price NOT BETWEEN 10 AND 30
       OR item.session_type IS NULL OR item.session_type NOT IN ('online', 'in-person', 'both') THEN
      RAISE EXCEPTION 'Invalid tutoring pricing or session type';
    END IF;
    SELECT public.lock_active_course(item.course_code) INTO selected_course_id;
    IF selected_course_id IS NULL THEN RAISE EXCEPTION 'A selected tutoring course was not found'; END IF;

    INSERT INTO public.tutor_courses
      (user_id, course_id, proof_url, group_price, individual_price, session_type, is_approved)
    VALUES
      (caller_id, selected_course_id, item.proof_url, item.group_price, item.individual_price, item.session_type, TRUE);
  END LOOP;

  UPDATE public.users SET is_tutor = TRUE WHERE id = caller_id;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_tutor(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_tutor(JSONB) TO authenticated;
