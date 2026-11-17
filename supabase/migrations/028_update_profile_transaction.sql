CREATE OR REPLACE FUNCTION public.update_profile(p_updates JSONB, p_prompts JSONB DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF COALESCE(pg_catalog.jsonb_typeof(p_updates), '') <> 'object' THEN
    RAISE EXCEPTION 'Invalid profile updates';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.jsonb_object_keys(p_updates) AS keys(name)
    WHERE name NOT IN ('name', 'pronouns', 'gender', 'year', 'degree_level', 'major', 'bio',
      'profile_visibility', 'photo_url', 'theme', 'status')
  ) THEN RAISE EXCEPTION 'Unsupported profile field'; END IF;
  IF p_prompts IS NOT NULL AND pg_catalog.jsonb_typeof(p_prompts) <> 'array' THEN
    RAISE EXCEPTION 'Invalid profile prompts';
  END IF;
  IF p_prompts IS NOT NULL AND pg_catalog.jsonb_array_length(p_prompts) > 3 THEN
    RAISE EXCEPTION 'Choose at most 3 profile prompts';
  END IF;

  UPDATE public.users SET
    name = CASE WHEN p_updates ? 'name' THEN p_updates->>'name' ELSE name END,
    pronouns = CASE WHEN p_updates ? 'pronouns'
      THEN ARRAY(SELECT pg_catalog.jsonb_array_elements_text(p_updates->'pronouns')) ELSE pronouns END,
    gender = CASE WHEN p_updates ? 'gender' THEN p_updates->>'gender' ELSE gender END,
    year = CASE WHEN p_updates ? 'year' THEN p_updates->>'year' ELSE year END,
    degree_level = CASE WHEN p_updates ? 'degree_level' THEN p_updates->>'degree_level' ELSE degree_level END,
    major = CASE WHEN p_updates ? 'major' THEN p_updates->>'major' ELSE major END,
    bio = CASE WHEN p_updates ? 'bio' THEN p_updates->>'bio' ELSE bio END,
    profile_visibility = CASE WHEN p_updates ? 'profile_visibility' THEN p_updates->>'profile_visibility' ELSE profile_visibility END,
    photo_url = CASE WHEN p_updates ? 'photo_url' THEN p_updates->>'photo_url' ELSE photo_url END,
    theme = CASE WHEN p_updates ? 'theme' THEN p_updates->>'theme' ELSE theme END,
    status = CASE WHEN p_updates ? 'status' THEN p_updates->>'status' ELSE status END
  WHERE id = caller;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  IF p_prompts IS NOT NULL THEN
    DELETE FROM public.user_prompts WHERE user_id = caller;
    INSERT INTO public.user_prompts (user_id, prompt, answer, sort_order)
    SELECT caller, item.prompt, item.answer, (input.ordinality - 1)::INTEGER
    FROM pg_catalog.jsonb_array_elements(p_prompts) WITH ORDINALITY AS input(value, ordinality)
    CROSS JOIN LATERAL pg_catalog.jsonb_to_record(input.value) AS item(prompt TEXT, answer TEXT);
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.update_profile(JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_profile(JSONB, JSONB) TO authenticated;
