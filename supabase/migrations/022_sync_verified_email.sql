-- Auth updates email only after its configured confirmation flow completes.
CREATE OR REPLACE FUNCTION public.sync_verified_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL THEN
    IF pg_catalog.lower(NEW.email) !~ '^[^[:space:]@]+@cmail[.]carleton[.]ca$' THEN
      RAISE EXCEPTION 'A Carleton student email address is required';
    END IF;
    UPDATE public.users SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER sync_verified_profile_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_verified_profile_email();

REVOKE UPDATE ON public.users FROM PUBLIC, anon, authenticated;
GRANT UPDATE (
  name, pronouns, gender, year, degree_level, major, bio, photo_url,
  status, profile_visibility, is_tutor, theme
) ON public.users TO authenticated;

-- Profile creation goes through complete_profile, which derives the email from Auth.
DROP POLICY IF EXISTS "users_insert" ON public.users;
REVOKE INSERT ON public.users FROM PUBLIC, anon, authenticated;
