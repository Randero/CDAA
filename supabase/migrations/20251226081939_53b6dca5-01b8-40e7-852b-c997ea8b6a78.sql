-- Create instructors table
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  avatar TEXT,
  expertise TEXT[],
  courses_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on instructors
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

-- RLS policies for instructors
CREATE POLICY "Instructors viewable by everyone"
ON public.instructors FOR SELECT
USING (true);

CREATE POLICY "Admins can manage instructors"
ON public.instructors FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  linkedin TEXT,
  twitter TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_members
CREATE POLICY "Team members viewable by everyone"
ON public.team_members FOR SELECT
USING (true);

CREATE POLICY "Admins can manage team members"
ON public.team_members FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS policies for faqs
CREATE POLICY "FAQs viewable by everyone"
ON public.faqs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
ON public.faqs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create stats table for platform statistics
CREATE TABLE public.platform_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_value TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on platform_stats
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_stats
CREATE POLICY "Stats viewable by everyone"
ON public.platform_stats FOR SELECT
USING (true);

CREATE POLICY "Admins can manage stats"
ON public.platform_stats FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create course_curriculum table
CREATE TABLE public.course_curriculum (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  section_title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course_curriculum
ALTER TABLE public.course_curriculum ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_curriculum
CREATE POLICY "Curriculum viewable by everyone"
ON public.course_curriculum FOR SELECT
USING (true);

CREATE POLICY "Admins can manage curriculum"
ON public.course_curriculum FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Instructors can manage their curriculum"
ON public.course_curriculum FOR ALL
USING (
  has_role(auth.uid(), 'instructor'::app_role) AND
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);

-- Create curriculum_lessons table
CREATE TABLE public.curriculum_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID REFERENCES public.course_curriculum(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  lesson_type TEXT DEFAULT 'video',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on curriculum_lessons
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;

-- RLS policies for curriculum_lessons
CREATE POLICY "Lessons viewable by everyone"
ON public.curriculum_lessons FOR SELECT
USING (true);

CREATE POLICY "Admins can manage lessons"
ON public.curriculum_lessons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Instructors can manage their lessons"
ON public.curriculum_lessons FOR ALL
USING (
  has_role(auth.uid(), 'instructor'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_curriculum cc
    JOIN public.courses c ON cc.course_id = c.id
    WHERE cc.id = curriculum_id AND c.instructor_id = auth.uid()
  )
);

-- Create course_objectives table
CREATE TABLE public.course_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS on course_objectives
ALTER TABLE public.course_objectives ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_objectives
CREATE POLICY "Objectives viewable by everyone"
ON public.course_objectives FOR SELECT
USING (true);

CREATE POLICY "Admins can manage objectives"
ON public.course_objectives FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create course_requirements table
CREATE TABLE public.course_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  requirement TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS on course_requirements
ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_requirements
CREATE POLICY "Requirements viewable by everyone"
ON public.course_requirements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage requirements"
ON public.course_requirements FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add instructor_id foreign key reference to courses table (already exists, just updating courses to link properly)
-- Add original_price if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'original_price') THEN
    ALTER TABLE public.courses ADD COLUMN original_price NUMERIC;
  END IF;
END $$;

-- Create triggers for updated_at
CREATE TRIGGER update_instructors_updated_at
BEFORE UPDATE ON public.instructors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();