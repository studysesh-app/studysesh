CREATE TABLE public.moderators (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reports
  ADD COLUMN status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT report_reason_limit CHECK (reason IS NULL OR char_length(reason) <= 1000) NOT VALID,
  ADD CONSTRAINT report_not_self CHECK (reporter_id <> reported_id) NOT VALID;
REVOKE INSERT ON public.reports FROM PUBLIC, anon, authenticated;
GRANT INSERT (reporter_id, reported_id, reason) ON public.reports TO authenticated;

CREATE TABLE public.report_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  decision TEXT NOT NULL CHECK (decision IN ('reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.report_reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_reports_open_cursor ON public.reports (created_at DESC, id DESC) WHERE status = 'open';

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.moderators WHERE user_id = auth.uid()); $$;
REVOKE ALL ON FUNCTION public.is_moderator() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_moderator() TO authenticated;

CREATE OR REPLACE FUNCTION public.report_queue(
  p_before_at TIMESTAMPTZ DEFAULT NULL, p_before_id UUID DEFAULT NULL, p_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID, reporter_id UUID, reporter_name TEXT, reported_id UUID,
  reported_name TEXT, reason TEXT, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_moderator() THEN RAISE EXCEPTION 'Moderator access required'; END IF;
  RETURN QUERY
  SELECT r.id, r.reporter_id, reporter.name, r.reported_id, reported.name, r.reason,
    COALESCE(r.created_at, '1970-01-01'::TIMESTAMPTZ)
  FROM public.reports r
  LEFT JOIN public.users reporter ON reporter.id = r.reporter_id
  LEFT JOIN public.users reported ON reported.id = r.reported_id
  WHERE r.status = 'open'
    AND (p_before_at IS NULL OR p_before_id IS NULL
      OR (COALESCE(r.created_at, '1970-01-01'::TIMESTAMPTZ), r.id) < (p_before_at, p_before_id))
  ORDER BY COALESCE(r.created_at, '1970-01-01'::TIMESTAMPTZ) DESC, r.id DESC
  LIMIT (LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50) + 1);
END;
$$;
REVOKE ALL ON FUNCTION public.report_queue(TIMESTAMPTZ, UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_queue(TIMESTAMPTZ, UUID, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.resolve_report(p_report_id UUID, p_decision TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_moderator() THEN RAISE EXCEPTION 'Moderator access required'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('reviewed', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid review decision';
  END IF;
  UPDATE public.reports
  SET status = p_decision, reviewed_at = pg_catalog.now(), reviewed_by = auth.uid()
  WHERE id = p_report_id AND status = 'open';
  IF NOT FOUND THEN RAISE EXCEPTION 'Report is no longer open'; END IF;
  INSERT INTO public.report_reviews (report_id, reviewer_id, decision)
  VALUES (p_report_id, auth.uid(), p_decision);
END;
$$;
REVOKE ALL ON FUNCTION public.resolve_report(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_report(UUID, TEXT) TO authenticated;
