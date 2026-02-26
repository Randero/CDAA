-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  submission_url TEXT,
  submission_text TEXT,
  score INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  response TEXT,
  responded_by UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Assignments policies
CREATE POLICY "Instructors can manage their assignments" ON public.assignments
  FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());

CREATE POLICY "Students can view assignments" ON public.assignments
  FOR SELECT USING (has_role(auth.uid(), 'student'::app_role));

CREATE POLICY "Admins can manage all assignments" ON public.assignments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Assignment submissions policies
CREATE POLICY "Students can manage their submissions" ON public.assignment_submissions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Instructors can view and grade submissions" ON public.assignment_submissions
  FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role));

CREATE POLICY "Admins can manage all submissions" ON public.assignment_submissions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Resources policies
CREATE POLICY "Instructors can manage their resources" ON public.resources
  FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());

CREATE POLICY "Students can view resources" ON public.resources
  FOR SELECT USING (has_role(auth.uid(), 'student'::app_role));

CREATE POLICY "Admins can manage all resources" ON public.resources
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Announcements policies
CREATE POLICY "Instructors can manage their announcements" ON public.announcements
  FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());

CREATE POLICY "Students can view announcements" ON public.announcements
  FOR SELECT USING (has_role(auth.uid(), 'student'::app_role));

CREATE POLICY "Admins can manage all announcements" ON public.announcements
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Complaints policies
CREATE POLICY "Students can manage their complaints" ON public.complaints
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all complaints" ON public.complaints
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Instructors can view complaints" ON public.complaints
  FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role));

-- Update triggers
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();