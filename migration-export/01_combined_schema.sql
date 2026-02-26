-- ============================================================
-- CYBER DEFEND AFRICA ACADEMY - COMBINED MIGRATION SCRIPT
-- Run this entire script in your new Supabase SQL Editor
-- ============================================================

-- ========================================
-- MIGRATION 1: Core Schema
-- ========================================

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'instructor', 'student');

-- Create course_level enum
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create course_category enum
CREATE TYPE public.course_category AS ENUM ('penetration-testing', 'network-security', 'incident-response', 'cloud-security', 'security-fundamentals', 'malware-analysis');

-- Create course_status enum
CREATE TYPE public.course_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'archived');

-- Create quiz_question_type enum
CREATE TYPE public.quiz_question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');

-- ========================================
-- TABLES
-- ========================================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_suspended BOOLEAN DEFAULT false,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  thumbnail TEXT,
  category course_category NOT NULL,
  level course_level NOT NULL,
  duration TEXT,
  lessons_count INTEGER DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  instructor_name TEXT NOT NULL,
  instructor_title TEXT,
  instructor_avatar TEXT,
  instructor_id UUID REFERENCES public.profiles(user_id),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  status public.course_status DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  rejection_reason TEXT,
  certificate_enabled BOOLEAN DEFAULT false,
  certificate_template_id UUID,
  total_points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, course_id)
);

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  country TEXT,
  content TEXT NOT NULL,
  avatar TEXT,
  course_title TEXT,
  rating INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Course categories table
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Learning paths table
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Learning path courses junction table
CREATE TABLE public.learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(learning_path_id, course_id)
);

-- Certificate templates table
CREATE TABLE public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_html TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add FK for certificate_template_id on courses
ALTER TABLE public.courses ADD CONSTRAINT courses_certificate_template_id_fkey
  FOREIGN KEY (certificate_template_id) REFERENCES public.certificate_templates(id);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.certificate_templates(id),
  verification_id TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID,
  revocation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Platform settings table
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_by UUID
);

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'pending', 'published', 'archived')) DEFAULT 'draft',
  is_pinned BOOLEAN DEFAULT false,
  is_alert BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  actor_id UUID NOT NULL,
  actor_name TEXT,
  actor_role TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INTEGER DEFAULT 100,
  weight INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assignment submissions table
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
  is_late BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resources table
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

-- Announcements table
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

-- Complaints table
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

-- Coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed', 'full')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_purchase_amount NUMERIC DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  applicable_courses UUID[] DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coupon usages table
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  discount_applied NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  original_amount NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  coupon_id UUID REFERENCES public.coupons(id),
  payment_gateway TEXT,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Instructors table
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

-- Team members table
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

-- FAQs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform stats table
CREATE TABLE public.platform_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_value TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course curriculum table
CREATE TABLE public.course_curriculum (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  section_title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Curriculum lessons table
CREATE TABLE public.curriculum_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID REFERENCES public.course_curriculum(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  lesson_type TEXT DEFAULT 'video',
  sort_order INTEGER DEFAULT 0,
  video_url TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course objectives table
CREATE TABLE public.course_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Course requirements table
CREATE TABLE public.course_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  requirement TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  curriculum_id UUID REFERENCES public.course_curriculum(id) ON DELETE SET NULL,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  shuffle_questions BOOLEAN DEFAULT false,
  show_correct_answers BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type quiz_question_type NOT NULL DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quiz answers table
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  score NUMERIC(5,2),
  total_points INTEGER DEFAULT 0,
  earned_points INTEGER DEFAULT 0,
  passed BOOLEAN,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quiz responses table
CREATE TABLE public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer_id UUID REFERENCES public.quiz_answers(id) ON DELETE SET NULL,
  text_response TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT quiz_responses_attempt_question_unique UNIQUE(attempt_id, question_id)
);

-- Lesson progress table
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Transcript requests table
CREATE TABLE public.transcript_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  transcript_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- FUNCTIONS
-- ========================================

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Audit log function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_name TEXT;
  v_actor_role TEXT;
  v_log_id UUID;
BEGIN
  v_actor_id := auth.uid();
  SELECT full_name INTO v_actor_name FROM public.profiles WHERE user_id = v_actor_id;
  SELECT role::TEXT INTO v_actor_role FROM public.user_roles WHERE user_id = v_actor_id LIMIT 1;
  INSERT INTO public.audit_logs (action, entity_type, entity_id, actor_id, actor_name, actor_role, details)
  VALUES (p_action, p_entity_type, p_entity_id, v_actor_id, v_actor_name, v_actor_role, p_details)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

-- Auto-create profile and assign student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- RLS POLICIES
-- ========================================

-- Profiles
CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Courses
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Instructors can insert their own courses" ON public.courses FOR INSERT WITH CHECK (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Instructors can update their own courses" ON public.courses FOR UPDATE USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Instructors can view their own courses" ON public.courses FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Instructors can delete their own draft courses" ON public.courses FOR DELETE USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid() AND status = 'draft'::course_status);

-- Enrollments
CREATE POLICY "Users can view their own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enrollments" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert enrollments" ON public.enrollments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Contact submissions
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Testimonials
CREATE POLICY "Testimonials are viewable by everyone" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Course categories
CREATE POLICY "Categories viewable by everyone" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.course_categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Learning paths
CREATE POLICY "Learning paths viewable by everyone" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Admins can manage learning paths" ON public.learning_paths FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Learning path courses viewable by everyone" ON public.learning_path_courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage learning path courses" ON public.learning_path_courses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Certificate templates
CREATE POLICY "Admins can manage certificate templates" ON public.certificate_templates FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Templates viewable by authenticated users" ON public.certificate_templates FOR SELECT TO authenticated USING (true);

-- Certificates
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all certificates" ON public.certificates FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public certificate verification" ON public.certificates FOR SELECT USING (revoked_at IS NULL);

-- Platform settings
CREATE POLICY "Settings viewable by everyone" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Blog posts
CREATE POLICY "Published posts viewable by everyone" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own posts" ON public.blog_posts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors can create posts" ON public.blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON public.blog_posts FOR UPDATE USING (auth.uid() = author_id);

-- Audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Assignments
CREATE POLICY "Instructors can manage their assignments" ON public.assignments FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Students can view assignments" ON public.assignments FOR SELECT USING (has_role(auth.uid(), 'student'::app_role));
CREATE POLICY "Admins can manage all assignments" ON public.assignments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Assignment submissions
CREATE POLICY "Students can manage their submissions" ON public.assignment_submissions FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Instructors view own course submissions" ON public.assignment_submissions FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.instructor_id = auth.uid()));
CREATE POLICY "Instructors grade own course submissions" ON public.assignment_submissions FOR UPDATE USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.instructor_id = auth.uid())) WITH CHECK (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.instructor_id = auth.uid()));
CREATE POLICY "Admins can manage all submissions" ON public.assignment_submissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Resources
CREATE POLICY "Instructors can manage their resources" ON public.resources FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Students can view resources" ON public.resources FOR SELECT USING (has_role(auth.uid(), 'student'::app_role));
CREATE POLICY "Admins can manage all resources" ON public.resources FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Announcements
CREATE POLICY "Instructors can manage their announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Students can view announcements" ON public.announcements FOR SELECT USING (has_role(auth.uid(), 'student'::app_role));
CREATE POLICY "Admins can manage all announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Complaints
CREATE POLICY "Students can manage their complaints" ON public.complaints FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Admins can manage all complaints" ON public.complaints FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can view complaints" ON public.complaints FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role));

-- Coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Active coupons viewable by authenticated" ON public.coupons FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Coupon usages
CREATE POLICY "Admins can view all usages" ON public.coupon_usages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own usages" ON public.coupon_usages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usages" ON public.coupon_usages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Instructors
CREATE POLICY "Instructors viewable by everyone" ON public.instructors FOR SELECT USING (true);
CREATE POLICY "Admins can manage instructors" ON public.instructors FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Team members
CREATE POLICY "Team members viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- FAQs
CREATE POLICY "FAQs viewable by everyone" ON public.faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage FAQs" ON public.faqs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Platform stats
CREATE POLICY "Stats viewable by everyone" ON public.platform_stats FOR SELECT USING (true);
CREATE POLICY "Admins can manage stats" ON public.platform_stats FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Course curriculum
CREATE POLICY "Curriculum viewable by everyone" ON public.course_curriculum FOR SELECT USING (true);
CREATE POLICY "Admins can manage curriculum" ON public.course_curriculum FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can manage their curriculum" ON public.course_curriculum FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()));

-- Curriculum lessons
CREATE POLICY "Lessons viewable by everyone" ON public.curriculum_lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON public.curriculum_lessons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can manage their lessons" ON public.curriculum_lessons FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.course_curriculum cc JOIN public.courses c ON cc.course_id = c.id WHERE cc.id = curriculum_id AND c.instructor_id = auth.uid()));

-- Course objectives
CREATE POLICY "Objectives viewable by everyone" ON public.course_objectives FOR SELECT USING (true);
CREATE POLICY "Admins can manage objectives" ON public.course_objectives FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Course requirements
CREATE POLICY "Requirements viewable by everyone" ON public.course_requirements FOR SELECT USING (true);
CREATE POLICY "Admins can manage requirements" ON public.course_requirements FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Quizzes
CREATE POLICY "Admins can manage all quizzes" ON public.quizzes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can insert their own quizzes" ON public.quizzes FOR INSERT WITH CHECK (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Instructors can update their own quizzes" ON public.quizzes FOR UPDATE USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Instructors can view their own quizzes" ON public.quizzes FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Instructors can delete their own quizzes" ON public.quizzes FOR DELETE USING (has_role(auth.uid(), 'instructor'::app_role) AND instructor_id = auth.uid());
CREATE POLICY "Students can view published quizzes" ON public.quizzes FOR SELECT USING (is_published = true AND EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = quizzes.course_id AND enrollments.user_id = auth.uid()));

-- Quiz questions
CREATE POLICY "Admins can manage all quiz questions" ON public.quiz_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can manage their quiz questions" ON public.quiz_questions FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.instructor_id = auth.uid()));
CREATE POLICY "Students can view quiz questions" ON public.quiz_questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.quizzes q JOIN public.enrollments e ON e.course_id = q.course_id WHERE q.id = quiz_questions.quiz_id AND q.is_published = true AND e.user_id = auth.uid()));

-- Quiz answers
CREATE POLICY "Admins can manage all quiz answers" ON public.quiz_answers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can manage their quiz answers" ON public.quiz_answers FOR ALL USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.quiz_questions qq JOIN public.quizzes q ON q.id = qq.quiz_id WHERE qq.id = quiz_answers.question_id AND q.instructor_id = auth.uid()));
CREATE POLICY "Students can view quiz answers" ON public.quiz_answers FOR SELECT USING (EXISTS (SELECT 1 FROM public.quiz_questions qq JOIN public.quizzes q ON q.id = qq.quiz_id JOIN public.enrollments e ON e.course_id = q.course_id WHERE qq.id = quiz_answers.question_id AND q.is_published = true AND e.user_id = auth.uid()));

-- Quiz attempts
CREATE POLICY "Admins can manage all quiz attempts" ON public.quiz_attempts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can view quiz attempts" ON public.quiz_attempts FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_attempts.quiz_id AND quizzes.instructor_id = auth.uid()));
CREATE POLICY "Students can insert their own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own attempts" ON public.quiz_attempts FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Students can view their own attempts" ON public.quiz_attempts FOR SELECT USING (student_id = auth.uid());

-- Quiz responses
CREATE POLICY "Admins can manage all quiz responses" ON public.quiz_responses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can view quiz responses" ON public.quiz_responses FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM public.quiz_attempts qa JOIN public.quizzes q ON q.id = qa.quiz_id WHERE qa.id = quiz_responses.attempt_id AND q.instructor_id = auth.uid()));
CREATE POLICY "Students can insert their own responses" ON public.quiz_responses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE quiz_attempts.id = quiz_responses.attempt_id AND quiz_attempts.student_id = auth.uid()));
CREATE POLICY "Students can view their own responses" ON public.quiz_responses FOR SELECT USING (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE quiz_attempts.id = quiz_responses.attempt_id AND quiz_attempts.student_id = auth.uid()));

-- Lesson progress
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lesson progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all lesson progress" ON public.lesson_progress FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Instructors can view lesson progress" ON public.lesson_progress FOR SELECT USING (has_role(auth.uid(), 'instructor'::app_role) AND EXISTS (SELECT 1 FROM courses WHERE courses.id = lesson_progress.course_id AND courses.instructor_id = auth.uid()));

-- Transcript requests
CREATE POLICY "Students can view their own requests" ON public.transcript_requests FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can insert their own requests" ON public.transcript_requests FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins can manage all transcript requests" ON public.transcript_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX idx_assignment_submissions_student_assignment ON public.assignment_submissions(student_id, assignment_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX idx_quizzes_instructor_id ON public.quizzes(instructor_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_responses_attempt_id ON public.quiz_responses(attempt_id);

-- ========================================
-- TRIGGERS
-- ========================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_course_categories_updated_at BEFORE UPDATE ON public.course_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON public.certificate_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON public.instructors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transcript_requests_updated_at BEFORE UPDATE ON public.transcript_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- STORAGE BUCKETS
-- ========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('avatars', 'avatars', true, 2097152) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('academy-assets', 'academy-assets', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'avatars');
CREATE POLICY "Avatars are publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Academy assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'academy-assets');
CREATE POLICY "Admins can upload academy assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'academy-assets' AND (SELECT has_role(auth.uid(), 'admin'::app_role)));

-- ========================================
-- DEFAULT DATA
-- ========================================

INSERT INTO public.platform_settings (key, value) VALUES
  ('academy_name', '"Cyber Defend Africa Academy"'),
  ('tagline', '"Your Gateway to Cybersecurity Excellence"'),
  ('contact_email', '"info@cyberdefendafrica.com"'),
  ('maintenance_mode', 'false'),
  ('seo_title', '"Cyber Defend Africa Academy - Cybersecurity Training"'),
  ('seo_description', '"Premier cybersecurity training platform in Africa"'),
  ('show_featured_courses', 'true'),
  ('show_stats', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- MIGRATION COMPLETE! 
-- Next: Run 02_data_import.sql to import your existing data
-- ============================================================
