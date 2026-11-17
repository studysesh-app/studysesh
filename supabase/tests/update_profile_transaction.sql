-- Run after migration 028 in a disposable Supabase database. Everything is rolled back.
BEGIN;
INSERT INTO auth.users (id) VALUES ('db280000-0000-4000-8000-000000000001');
INSERT INTO public.users (id, email, name, gender)
VALUES ('db280000-0000-4000-8000-000000000001', 'atomic-profile@example.invalid', 'Original', 'Woman');
INSERT INTO public.user_prompts (user_id, prompt, answer, sort_order) VALUES
  ('db280000-0000-4000-8000-000000000001', 'Original prompt', 'Original answer', 0);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'db280000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  BEGIN
    PERFORM public.update_profile('{"name":"Changed"}'::JSONB,
      jsonb_build_array(jsonb_build_object('prompt', 'Question', 'answer', repeat('x', 151))));
    RAISE EXCEPTION 'Invalid prompt was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND name = 'Original')
     OR NOT EXISTS (SELECT 1 FROM public.user_prompts WHERE user_id = auth.uid() AND answer = 'Original answer') THEN
    RAISE EXCEPTION 'Failed update did not roll back profile and prompts';
  END IF;
  PERFORM public.update_profile('{"name":"Changed"}'::JSONB,
    '[{"prompt":"First","answer":"A"},{"prompt":"Second","answer":"B"}]'::JSONB);
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND name = 'Changed')
     OR NOT EXISTS (SELECT 1 FROM public.user_prompts WHERE user_id = auth.uid() AND prompt = 'Second' AND sort_order = 1) THEN
    RAISE EXCEPTION 'Valid profile update failed';
  END IF;
  BEGIN
    PERFORM public.update_profile('{"email":"forged@example.invalid"}'::JSONB);
    RAISE EXCEPTION 'Protected field was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Protected field was accepted' THEN RAISE; END IF;
  END;
END;
$$;
ROLLBACK;
