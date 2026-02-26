-- Allow admins to insert enrollments for any user
CREATE POLICY "Admins can insert enrollments" 
  ON public.enrollments 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage all enrollments
CREATE POLICY "Admins can manage enrollments" 
  ON public.enrollments 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));