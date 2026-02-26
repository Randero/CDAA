-- Fix: Restrict profile viewing to authenticated users only
-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new policy: Only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Also allow admins to view all profiles (already have management capabilities)
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));