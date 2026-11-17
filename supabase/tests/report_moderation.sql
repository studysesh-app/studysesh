-- Run after migration 020 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('db200000-0000-4000-8000-000000000001'),
  ('db200000-0000-4000-8000-000000000002'),
  ('db200000-0000-4000-8000-000000000003');
INSERT INTO public.users (id, email, name, gender) VALUES
  ('db200000-0000-4000-8000-000000000001', 'moderation-1@example.invalid', 'Reporter', 'Woman'),
  ('db200000-0000-4000-8000-000000000002', 'moderation-2@example.invalid', 'Reported', 'Woman'),
  ('db200000-0000-4000-8000-000000000003', 'moderation-3@example.invalid', 'Moderator', 'Woman');
INSERT INTO public.moderators (user_id) VALUES ('db200000-0000-4000-8000-000000000003');
INSERT INTO public.reports (id, reporter_id, reported_id, reason) VALUES
  ('db200000-0000-4000-8000-000000000010', 'db200000-0000-4000-8000-000000000001',
   'db200000-0000-4000-8000-000000000002', 'Review requested');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db200000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  IF public.is_moderator() THEN RAISE EXCEPTION 'Non-moderator was authorized'; END IF;
  BEGIN
    PERFORM * FROM public.report_queue();
    RAISE EXCEPTION 'Non-moderator accessed queue';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Non-moderator accessed queue' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.resolve_report('db200000-0000-4000-8000-000000000010', 'reviewed');
    RAISE EXCEPTION 'Non-moderator resolved report';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Non-moderator resolved report' THEN RAISE; END IF;
  END;
  BEGIN
    INSERT INTO public.reports (reporter_id, reported_id, status)
    VALUES (auth.uid(), 'db200000-0000-4000-8000-000000000002', 'reviewed');
    RAISE EXCEPTION 'Reporter supplied review status';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
SELECT set_config('request.jwt.claim.sub', 'db200000-0000-4000-8000-000000000003', true);
DO $$
BEGIN
  IF NOT public.is_moderator() OR NOT EXISTS (
    SELECT 1 FROM public.report_queue() WHERE id = 'db200000-0000-4000-8000-000000000010'
  ) THEN RAISE EXCEPTION 'Moderator could not review report'; END IF;
  PERFORM public.resolve_report('db200000-0000-4000-8000-000000000010', 'reviewed');
  IF EXISTS (SELECT 1 FROM public.report_queue() WHERE id = 'db200000-0000-4000-8000-000000000010') THEN
    RAISE EXCEPTION 'Resolved report remained in queue';
  END IF;
  BEGIN
    PERFORM public.resolve_report('db200000-0000-4000-8000-000000000010', 'dismissed');
    RAISE EXCEPTION 'Report was resolved twice';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Report was resolved twice' THEN RAISE; END IF;
  END;
END;
$$;
RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.report_reviews
    WHERE report_id = 'db200000-0000-4000-8000-000000000010'
      AND reviewer_id = 'db200000-0000-4000-8000-000000000003' AND decision = 'reviewed') THEN
    RAISE EXCEPTION 'Review audit record missing';
  END IF;
END;
$$;
ROLLBACK;
