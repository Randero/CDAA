-- Add total_points column to courses table for course weight
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 100;

-- Add weight column to assignments for weighted scoring
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS weight integer DEFAULT 10;

-- Add is_submitted and is_late columns to track submission status
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS is_late boolean DEFAULT false;

-- Create index for faster assignment queries
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_assignment ON public.assignment_submissions(student_id, assignment_id);