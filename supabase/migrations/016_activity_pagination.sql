CREATE INDEX idx_activities_user_cursor
  ON public.activities (user_id, created_at DESC, id DESC);
