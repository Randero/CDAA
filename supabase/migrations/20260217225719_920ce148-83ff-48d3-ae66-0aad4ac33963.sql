
-- Add content fields to curriculum_lessons
ALTER TABLE public.curriculum_lessons 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS content text;

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Students can view their own progress
CREATE POLICY "Users can view their own lesson progress"
ON public.lesson_progress FOR SELECT
USING (auth.uid() = user_id);

-- Students can insert their own progress
CREATE POLICY "Users can insert their own lesson progress"
ON public.lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can update their own progress
CREATE POLICY "Users can update their own lesson progress"
ON public.lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all progress
CREATE POLICY "Admins can manage all lesson progress"
ON public.lesson_progress FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Instructors can view progress for their courses
CREATE POLICY "Instructors can view lesson progress"
ON public.lesson_progress FOR SELECT
USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (
  SELECT 1 FROM courses WHERE courses.id = lesson_progress.course_id AND courses.instructor_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
