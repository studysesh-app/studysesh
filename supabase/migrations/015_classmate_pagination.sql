-- UUID keyset pagination remains stable when candidates are added or removed.
CREATE OR REPLACE FUNCTION public.classmate_page(p_after UUID DEFAULT NULL, p_limit INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID, name TEXT, pronouns TEXT[], gender TEXT, year TEXT, major TEXT,
  photo_url TEXT, bio TEXT, shared_courses TEXT[], prompts JSONB
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH candidates AS (
    SELECT DISTINCT other.user_id
    FROM public.user_courses mine
    JOIN public.user_courses other ON other.course_id = mine.course_id
    WHERE mine.user_id = auth.uid()
      AND other.user_id <> auth.uid()
      AND (p_after IS NULL OR other.user_id > p_after)
      AND NOT EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.status = 'accepted'
          AND ((c.requester_id = auth.uid() AND c.receiver_id = other.user_id)
            OR (c.receiver_id = auth.uid() AND c.requester_id = other.user_id))
      )
  ),
  page AS (
    SELECT u.id, u.name, u.pronouns, u.gender, u.year, u.major, u.photo_url, u.bio
    FROM candidates c JOIN public.users u ON u.id = c.user_id
    ORDER BY u.id
    LIMIT (LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50) + 1)
  )
  SELECT page.id, page.name, page.pronouns, page.gender, page.year, page.major,
    page.photo_url, page.bio,
    ARRAY(
      SELECT DISTINCT c.code
      FROM public.user_courses mine
      JOIN public.user_courses other ON other.course_id = mine.course_id
      JOIN public.courses c ON c.id = mine.course_id
      WHERE mine.user_id = auth.uid() AND other.user_id = page.id
      ORDER BY c.code
    ),
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object('prompt', p.prompt, 'answer', p.answer) ORDER BY p.sort_order)
      FROM public.user_prompts p WHERE p.user_id = page.id
    ), '[]'::jsonb)
  FROM page ORDER BY page.id;
$$;

REVOKE ALL ON FUNCTION public.classmate_page(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.classmate_page(UUID, INTEGER) TO authenticated;
