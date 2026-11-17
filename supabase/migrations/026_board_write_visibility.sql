-- A guessed UUID must not allow interacting with an invisible post or comment.
CREATE OR REPLACE FUNCTION public.valid_comment_parent(p_parent UUID, p_post UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.comments c
    JOIN public.posts p ON p.id = c.post_id
    WHERE c.id = p_parent AND c.post_id = p_post AND c.parent_id IS NULL
      AND public.can_view_profile(c.author_id) AND public.can_view_profile(p.author_id)
  );
$$;
REVOKE ALL ON FUNCTION public.valid_comment_parent(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.valid_comment_parent(UUID, UUID) TO authenticated;

DROP POLICY IF EXISTS "post_likes_insert" ON public.post_likes;
CREATE POLICY "post_likes_insert" ON public.post_likes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_likes.post_id)
  );

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id)
    AND (
      parent_id IS NULL OR public.valid_comment_parent(parent_id, post_id)
    )
  );

DROP POLICY IF EXISTS "comment_likes_insert" ON public.comment_likes;
CREATE POLICY "comment_likes_insert" ON public.comment_likes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.comments c WHERE c.id = comment_likes.comment_id)
  );
