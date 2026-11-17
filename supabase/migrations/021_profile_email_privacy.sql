-- Public profile rows do not expose email. The account owner gets their email
-- from Supabase Auth rather than a cross-user-readable table column.
REVOKE SELECT ON public.users FROM PUBLIC, anon, authenticated;
GRANT SELECT (
  id, name, pronouns, gender, year, degree_level, major, bio, photo_url,
  status, profile_visibility, is_tutor, theme, created_at, updated_at
) ON public.users TO authenticated;

-- The transaction writes only auth.uid() and derives email from auth.jwt().
-- It needs owner privileges to upsert the restricted column. This definition
-- also fixes the ordinality alias in migration 007.
CREATE OR REPLACE FUNCTION public.complete_profile(
  p_profile JSONB, p_prompts JSONB, p_courses TEXT[], p_tutor_courses JSONB
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_email TEXT := auth.jwt() ->> 'email';
  v_requested_tutors INTEGER;
  v_found_tutors INTEGER;
BEGIN
  IF v_user_id IS NULL OR v_email IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF pg_catalog.lower(v_email) !~ '^[^[:space:]@]+@cmail[.]carleton[.]ca$' THEN
    RAISE EXCEPTION 'A Carleton student email address is required';
  END IF;
  IF NULLIF(BTRIM(p_profile ->> 'name'), '') IS NULL THEN RAISE EXCEPTION 'A profile name is required'; END IF;
  IF COALESCE(jsonb_typeof(p_prompts), '') <> 'array' THEN
    RAISE EXCEPTION 'Add 3 profile prompts before continuing';
  END IF;
  IF jsonb_array_length(p_prompts) < 3 THEN
    RAISE EXCEPTION 'Add 3 profile prompts before continuing';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_prompts) AS prompt(prompt TEXT, answer TEXT)
    WHERE NULLIF(BTRIM(prompt.prompt), '') IS NULL OR NULLIF(BTRIM(prompt.answer), '') IS NULL
  ) THEN RAISE EXCEPTION 'Profile prompts and answers cannot be blank'; END IF;

  INSERT INTO public.users (id, email, name, pronouns, gender, year, degree_level, major, profile_visibility, photo_url, is_tutor)
  VALUES (
    v_user_id, v_email, BTRIM(p_profile ->> 'name'),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_profile -> 'pronouns', '[]'::jsonb))),
    COALESCE(NULLIF(p_profile ->> 'gender', ''), 'Prefer not to say'), p_profile ->> 'year',
    p_profile ->> 'degree_level', p_profile ->> 'major',
    COALESCE(NULLIF(p_profile ->> 'profile_visibility', ''), 'everyone'),
    NULLIF(p_profile ->> 'photo_url', ''), COALESCE((p_profile ->> 'is_tutor')::BOOLEAN, FALSE)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email, name = EXCLUDED.name, pronouns = EXCLUDED.pronouns,
    gender = EXCLUDED.gender, year = EXCLUDED.year, degree_level = EXCLUDED.degree_level,
    major = EXCLUDED.major, profile_visibility = EXCLUDED.profile_visibility,
    photo_url = EXCLUDED.photo_url, is_tutor = EXCLUDED.is_tutor, updated_at = now();

  DELETE FROM public.user_prompts WHERE user_id = v_user_id;
  INSERT INTO public.user_prompts (user_id, prompt, answer, sort_order)
  SELECT v_user_id, prompt.prompt, prompt.answer, (input.ordinality - 1)::INTEGER
  FROM jsonb_array_elements(p_prompts) WITH ORDINALITY AS input(value, ordinality)
  CROSS JOIN LATERAL jsonb_to_record(input.value) AS prompt(prompt TEXT, answer TEXT);

  PERFORM c.id FROM public.courses c WHERE c.code = ANY(COALESCE(p_courses, ARRAY[]::TEXT[])) FOR SHARE;
  IF EXISTS (
    SELECT 1 FROM UNNEST(COALESCE(p_courses, ARRAY[]::TEXT[])) AS requested(code)
    WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.code = requested.code AND c.is_active)
  ) THEN RAISE EXCEPTION 'One or more selected courses do not exist'; END IF;
  DELETE FROM public.user_courses WHERE user_id = v_user_id;
  INSERT INTO public.user_courses (user_id, course_id)
  SELECT v_user_id, c.id FROM public.courses c
  WHERE c.code = ANY(COALESCE(p_courses, ARRAY[]::TEXT[])) AND c.is_active ON CONFLICT DO NOTHING;

  DELETE FROM public.tutor_courses WHERE user_id = v_user_id;
  IF COALESCE((p_profile ->> 'is_tutor')::BOOLEAN, FALSE) THEN
    IF COALESCE(jsonb_typeof(p_tutor_courses), '') <> 'array' THEN
      RAISE EXCEPTION 'Select at least one tutoring course';
    END IF;
    IF jsonb_array_length(p_tutor_courses) = 0 THEN
      RAISE EXCEPTION 'Select at least one tutoring course';
    END IF;
    PERFORM c.id FROM public.courses c
    WHERE c.code IN (SELECT item->>'course_code' FROM jsonb_array_elements(p_tutor_courses) item)
    FOR SHARE;
    SELECT COUNT(DISTINCT tutor.course_code), COUNT(DISTINCT course.code)
    INTO v_requested_tutors, v_found_tutors
    FROM jsonb_to_recordset(p_tutor_courses)
      AS tutor(course_code TEXT, group_price NUMERIC, individual_price NUMERIC, proof_url TEXT, session_type TEXT)
    LEFT JOIN public.courses course ON course.code = tutor.course_code AND course.is_active;
    IF v_requested_tutors <> v_found_tutors OR v_requested_tutors <> jsonb_array_length(p_tutor_courses) THEN
      RAISE EXCEPTION 'One or more selected tutoring courses are invalid or duplicated';
    END IF;
    INSERT INTO public.tutor_courses (user_id, course_id, group_price, individual_price, proof_url, session_type, is_approved)
    SELECT v_user_id, course.id, tutor.group_price, tutor.individual_price, tutor.proof_url,
      COALESCE(NULLIF(tutor.session_type, ''), 'both'), TRUE
    FROM jsonb_to_recordset(p_tutor_courses)
      AS tutor(course_code TEXT, group_price NUMERIC, individual_price NUMERIC, proof_url TEXT, session_type TEXT)
    JOIN public.courses course ON course.code = tutor.course_code AND course.is_active
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      group_price = EXCLUDED.group_price, individual_price = EXCLUDED.individual_price,
      proof_url = EXCLUDED.proof_url, session_type = EXCLUDED.session_type, is_approved = EXCLUDED.is_approved;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_profile(JSONB, JSONB, TEXT[], JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_profile(JSONB, JSONB, TEXT[], JSONB) TO authenticated;
