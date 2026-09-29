-- COMP 4801 was added to 002_seed_courses.sql after that migration had already
-- been applied to the remote database, so it never reached production.
-- Insert it here; ON CONFLICT keeps this safe to re-run on any environment.

INSERT INTO public.courses (code, name) VALUES
  ('COMP 4801', 'Algorithms for Data Mining, Web, and Social Networks')
ON CONFLICT (code) DO NOTHING;
