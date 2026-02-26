-- Add RLS policies for instructors to manage their own courses

-- Instructors can insert their own courses
CREATE POLICY "Instructors can insert their own courses"
ON public.courses FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
);

-- Instructors can update their own courses
CREATE POLICY "Instructors can update their own courses"
ON public.courses FOR UPDATE
USING (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
);

-- Instructors can view their own courses (including drafts)
CREATE POLICY "Instructors can view their own courses"
ON public.courses FOR SELECT
USING (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
);

-- Instructors can delete their own draft courses only
CREATE POLICY "Instructors can delete their own draft courses"
ON public.courses FOR DELETE
USING (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
  AND status = 'draft'::course_status
);