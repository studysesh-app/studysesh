-- Fix "infinite recursion detected in policy for relation users" (42P17).
-- The users_select policy queried public.users from within its own USING
-- clause, which re-triggers RLS evaluation recursively. Move that lookup
-- into a SECURITY DEFINER function so it bypasses RLS instead.

CREATE OR REPLACE FUNCTION public.my_gender()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT gender FROM public.users WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "users_select" ON public.users;

CREATE POLICY "users_select" ON public.users FOR SELECT USING (
  id = auth.uid()
  OR profile_visibility = 'everyone'
  OR (
    profile_visibility = 'women-nb-only'
    AND public.my_gender() IN ('Woman', 'Non-Binary')
  )
);
