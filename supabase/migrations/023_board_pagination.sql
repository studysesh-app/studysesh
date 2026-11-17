ALTER TABLE public.posts ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.comments ALTER COLUMN created_at SET NOT NULL;
CREATE INDEX idx_posts_course_cursor ON public.posts (course_id, created_at DESC, id DESC);
CREATE INDEX idx_comments_post_cursor ON public.comments (post_id, created_at, id);

CREATE OR REPLACE FUNCTION public.board_posts_page(
  p_course_id UUID, p_before_at TIMESTAMPTZ DEFAULT NULL, p_before_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 30, p_only UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID, author_id UUID, author_name TEXT, author_year TEXT, content TEXT, type TEXT,
  created_at TIMESTAMPTZ, likes BIGINT, comments BIGINT, is_liked BOOLEAN
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$
  SELECT p.id, p.author_id, u.name, u.year, p.content, p.type, p.created_at,
    (SELECT COUNT(*) FROM public.post_likes l WHERE l.post_id = p.id),
    (SELECT COUNT(*) FROM public.comments c WHERE c.post_id = p.id),
    EXISTS (SELECT 1 FROM public.post_likes l WHERE l.post_id = p.id AND l.user_id = auth.uid())
  FROM public.posts p LEFT JOIN public.users u ON u.id = p.author_id
  WHERE p.course_id = p_course_id AND (p_only IS NULL OR p.id = p_only)
    AND (p_before_at IS NULL OR p_before_id IS NULL OR (p.created_at, p.id) < (p_before_at, p_before_id))
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT (LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50) + 1);
$$;
REVOKE ALL ON FUNCTION public.board_posts_page(UUID, TIMESTAMPTZ, UUID, INTEGER, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.board_posts_page(UUID, TIMESTAMPTZ, UUID, INTEGER, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.board_comments_page(
  p_post_id UUID, p_after_at TIMESTAMPTZ DEFAULT NULL, p_after_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 30, p_only UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID, author_id UUID, author_name TEXT, author_year TEXT, parent_id UUID,
  content TEXT, created_at TIMESTAMPTZ, likes BIGINT, is_liked BOOLEAN
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$
  SELECT c.id, c.author_id, u.name, u.year, c.parent_id, c.content, c.created_at,
    (SELECT COUNT(*) FROM public.comment_likes l WHERE l.comment_id = c.id),
    EXISTS (SELECT 1 FROM public.comment_likes l WHERE l.comment_id = c.id AND l.user_id = auth.uid())
  FROM public.comments c LEFT JOIN public.users u ON u.id = c.author_id
  WHERE c.post_id = p_post_id AND (p_only IS NULL OR c.id = p_only)
    AND (p_after_at IS NULL OR p_after_id IS NULL OR (c.created_at, c.id) > (p_after_at, p_after_id))
  ORDER BY c.created_at, c.id
  LIMIT (LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50) + 1);
$$;
REVOKE ALL ON FUNCTION public.board_comments_page(UUID, TIMESTAMPTZ, UUID, INTEGER, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.board_comments_page(UUID, TIMESTAMPTZ, UUID, INTEGER, UUID) TO authenticated;
