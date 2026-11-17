CREATE OR REPLACE FUNCTION public.conversation_summary_page(
  p_before_at TIMESTAMPTZ DEFAULT NULL,
  p_before_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 30,
  p_only UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID, other_user_id UUID, other_name TEXT, other_is_tutor BOOLEAN,
  last_content TEXT, last_sender UUID, last_at TIMESTAMPTZ,
  sort_at TIMESTAMPTZ, unread_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH summaries AS (
    SELECT c.id, other.user_id AS other_user_id, u.name AS other_name,
      u.is_tutor AS other_is_tutor, last_message.content AS last_content,
      last_message.sender_id AS last_sender, last_message.created_at AS last_at,
      COALESCE(last_message.created_at, c.created_at, '1970-01-01'::TIMESTAMPTZ) AS sort_at,
      (SELECT COUNT(*) FROM public.messages unread
       WHERE unread.conversation_id = c.id AND unread.sender_id <> auth.uid()
         AND (mine.last_read_at IS NULL OR unread.created_at > mine.last_read_at)) AS unread_count
    FROM public.conversation_participants mine
    JOIN public.conversations c ON c.id = mine.conversation_id
    LEFT JOIN LATERAL (
      SELECT p.user_id FROM public.conversation_participants p
      WHERE p.conversation_id = c.id AND p.user_id <> auth.uid()
      ORDER BY p.user_id LIMIT 1
    ) other ON TRUE
    LEFT JOIN public.users u ON u.id = other.user_id
    LEFT JOIN LATERAL (
      SELECT m.content, m.sender_id, m.created_at FROM public.messages m
      WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1
    ) last_message ON TRUE
    WHERE mine.user_id = auth.uid() AND mine.left_at IS NULL
      AND (p_only IS NULL OR c.id = p_only)
  )
  SELECT * FROM summaries s
  WHERE p_before_at IS NULL OR p_before_id IS NULL
     OR (s.sort_at, s.id) < (p_before_at, p_before_id)
  ORDER BY s.sort_at DESC, s.id DESC
  LIMIT (LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50) + 1);
$$;
REVOKE ALL ON FUNCTION public.conversation_summary_page(TIMESTAMPTZ, UUID, INTEGER, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.conversation_summary_page(TIMESTAMPTZ, UUID, INTEGER, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.unread_message_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COUNT(*)
  FROM public.conversation_participants mine
  JOIN public.messages m ON m.conversation_id = mine.conversation_id
  WHERE mine.user_id = auth.uid() AND mine.left_at IS NULL
    AND m.sender_id <> auth.uid()
    AND (mine.last_read_at IS NULL OR m.created_at > mine.last_read_at);
$$;
REVOKE ALL ON FUNCTION public.unread_message_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unread_message_count() TO authenticated;
