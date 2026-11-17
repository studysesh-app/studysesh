-- Apply the same profile visibility and bidirectional block rules to related rows.
-- SECURITY DEFINER is necessary because the blocker can only read their own block rows.
CREATE OR REPLACE FUNCTION public.can_view_profile(target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.users target
    WHERE target.id = target_id
      AND (
        target.id = auth.uid()
        OR (
          NOT EXISTS (
            SELECT 1 FROM public.blocked_users b
            WHERE (b.blocker_id = auth.uid() AND b.blocked_id = target.id)
               OR (b.blocker_id = target.id AND b.blocked_id = auth.uid())
          )
          AND (
            target.profile_visibility = 'everyone'
            OR (
              target.profile_visibility = 'women-nb-only'
              AND EXISTS (
                SELECT 1 FROM public.users viewer
                WHERE viewer.id = auth.uid() AND viewer.gender IN ('Woman', 'Non-Binary')
              )
            )
          )
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_view_profile(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_profile(UUID) TO authenticated;

-- Only names of users the caller has blocked are exposed for managing that list.
CREATE OR REPLACE FUNCTION public.my_blocked_profiles()
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.id, u.name
  FROM public.blocked_users b
  JOIN public.users u ON u.id = b.blocked_id
  WHERE b.blocker_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.my_blocked_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_blocked_profiles() TO authenticated;

DROP POLICY IF EXISTS "users_select" ON public.users;
CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated
  USING (public.can_view_profile(id));

DROP POLICY IF EXISTS "prompts_select" ON public.user_prompts;
CREATE POLICY "prompts_select" ON public.user_prompts FOR SELECT TO authenticated
  USING (public.can_view_profile(user_id));

DROP POLICY IF EXISTS "user_courses_select" ON public.user_courses;
CREATE POLICY "user_courses_select" ON public.user_courses FOR SELECT TO authenticated
  USING (public.can_view_profile(user_id));

DROP POLICY IF EXISTS "tutor_courses_select" ON public.tutor_courses;
CREATE POLICY "tutor_courses_select" ON public.tutor_courses FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Return listing fields only; proof paths remain visible only to their owner.
CREATE OR REPLACE FUNCTION public.course_tutors(p_course_id UUID)
RETURNS TABLE (
  user_id UUID, name TEXT, pronouns TEXT[], group_price NUMERIC,
  individual_price NUMERIC, session_type TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.user_id, u.name, u.pronouns, t.group_price, t.individual_price, t.session_type
  FROM public.tutor_courses t
  JOIN public.users u ON u.id = t.user_id
  WHERE t.course_id = p_course_id
    AND t.is_approved
    AND public.can_view_profile(t.user_id);
$$;

REVOKE ALL ON FUNCTION public.course_tutors(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.course_tutors(UUID) TO authenticated;

DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts FOR SELECT TO authenticated
  USING (public.can_view_profile(author_id));

DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated
  USING (
    public.can_view_profile(author_id)
    AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id)
  );

DROP POLICY IF EXISTS "post_likes_select" ON public.post_likes;
CREATE POLICY "post_likes_select" ON public.post_likes FOR SELECT TO authenticated
  USING (public.can_view_profile(user_id) AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_likes.post_id));

DROP POLICY IF EXISTS "comment_likes_select" ON public.comment_likes;
CREATE POLICY "comment_likes_select" ON public.comment_likes FOR SELECT TO authenticated
  USING (public.can_view_profile(user_id) AND EXISTS (SELECT 1 FROM public.comments c WHERE c.id = comment_likes.comment_id));
