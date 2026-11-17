-- Private per-viewer broadcasts carry only IDs the viewer was allowed to see.
CREATE OR REPLACE FUNCTION public.board_viewer_can_see(p_viewer UUID, p_target UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users target
    WHERE target.id = p_target AND (
      target.id = p_viewer OR (
        NOT EXISTS (SELECT 1 FROM public.blocked_users b
          WHERE (b.blocker_id = p_viewer AND b.blocked_id = target.id)
             OR (b.blocker_id = target.id AND b.blocked_id = p_viewer))
        AND (target.profile_visibility = 'everyone' OR (
          target.profile_visibility = 'women-nb-only'
          AND EXISTS (SELECT 1 FROM public.users viewer
            WHERE viewer.id = p_viewer AND viewer.gender IN ('Woman', 'Non-Binary'))
        ))
      )
    )
  );
$$;
REVOKE ALL ON FUNCTION public.board_viewer_can_see(UUID, UUID) FROM PUBLIC, anon, authenticated;

CREATE POLICY "board_broadcast_read" ON realtime.messages FOR SELECT TO authenticated
USING (
  extension = 'broadcast' AND realtime.messages.topic = realtime.topic() AND (
    EXISTS (SELECT 1 FROM public.user_courses c
      WHERE c.user_id = auth.uid()
        AND realtime.topic() = 'board:' || c.course_id::TEXT || ':' || auth.uid()::TEXT)
    OR EXISTS (SELECT 1 FROM public.tutor_courses t
      WHERE t.user_id = auth.uid()
        AND realtime.topic() = 'board:' || t.course_id::TEXT || ':' || auth.uid()::TEXT)
  )
);

CREATE OR REPLACE FUNCTION public.broadcast_board_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_post_id UUID;
  v_comment_id UUID;
  v_course_id UUID;
  v_post_author UUID;
  v_comment_author UUID;
  v_actor_id UUID;
  v_event_kind TEXT;
  v_viewer UUID;
BEGIN
  IF TG_TABLE_NAME = 'posts' THEN
    v_post_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
    v_course_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.course_id ELSE NEW.course_id END;
    v_post_author := CASE WHEN TG_OP = 'DELETE' THEN OLD.author_id ELSE NEW.author_id END;
    v_actor_id := v_post_author;
    v_event_kind := CASE WHEN TG_OP = 'DELETE' THEN 'post_remove' ELSE 'post_insert' END;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    v_post_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.post_id ELSE NEW.post_id END;
    v_comment_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
    v_actor_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.author_id ELSE NEW.author_id END;
    v_comment_author := v_actor_id;
    v_event_kind := CASE WHEN TG_OP = 'DELETE' THEN 'comment_remove' ELSE 'comment_insert' END;
  ELSIF TG_TABLE_NAME = 'post_likes' THEN
    v_post_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.post_id ELSE NEW.post_id END;
    v_actor_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END;
    v_event_kind := 'post_change';
  ELSE
    v_comment_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.comment_id ELSE NEW.comment_id END;
    v_actor_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END;
    SELECT c.post_id, c.author_id INTO v_post_id, v_comment_author FROM public.comments c WHERE c.id = v_comment_id;
    v_event_kind := 'comment_change';
  END IF;

  IF v_course_id IS NULL THEN
    SELECT p.course_id, p.author_id INTO v_course_id, v_post_author FROM public.posts p WHERE p.id = v_post_id;
  END IF;
  IF v_course_id IS NOT NULL AND v_post_author IS NOT NULL AND v_actor_id IS NOT NULL THEN
    FOR v_viewer IN
      SELECT c.user_id FROM public.user_courses c WHERE c.course_id = v_course_id
      UNION
      SELECT t.user_id FROM public.tutor_courses t WHERE t.course_id = v_course_id
    LOOP
      IF public.board_viewer_can_see(v_viewer, v_post_author)
         AND public.board_viewer_can_see(v_viewer, v_actor_id)
         AND (v_comment_author IS NULL OR public.board_viewer_can_see(v_viewer, v_comment_author)) THEN
        PERFORM realtime.send(
          pg_catalog.jsonb_build_object('post_id', v_post_id, 'comment_id', v_comment_id, 'kind', v_event_kind),
          'board_change', 'board:' || v_course_id::TEXT || ':' || v_viewer::TEXT, TRUE
        );
      END IF;
    END LOOP;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER broadcast_post_change AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_board_change();
CREATE TRIGGER broadcast_comment_change AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_board_change();
CREATE TRIGGER broadcast_post_like_change AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_board_change();
CREATE TRIGGER broadcast_comment_like_change AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_board_change();
