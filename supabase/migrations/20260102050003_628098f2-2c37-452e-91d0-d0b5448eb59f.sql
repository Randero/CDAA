-- Fix instructor RLS policy for assignment_submissions
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Instructors can view and grade submissions" ON public.assignment_submissions;

-- Create proper policy for instructors to view submissions for their own courses
CREATE POLICY "Instructors view own course submissions" 
  ON public.assignment_submissions
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'instructor'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.assignments
      WHERE assignments.id = assignment_submissions.assignment_id
      AND assignments.instructor_id = auth.uid()
    )
  );

-- Create proper policy for instructors to update/grade submissions for their own courses
CREATE POLICY "Instructors grade own course submissions" 
  ON public.assignment_submissions
  FOR UPDATE 
  USING (
    has_role(auth.uid(), 'instructor'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.assignments
      WHERE assignments.id = assignment_submissions.assignment_id
      AND assignments.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'instructor'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.assignments
      WHERE assignments.id = assignment_submissions.assignment_id
      AND assignments.instructor_id = auth.uid()
    )
  );

-- Add unique constraint for quiz_responses upsert
ALTER TABLE public.quiz_responses 
ADD CONSTRAINT quiz_responses_attempt_question_unique 
UNIQUE (attempt_id, question_id);

-- Add index for performance on assignment_submissions lookup
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id 
  ON public.assignment_submissions(assignment_id);