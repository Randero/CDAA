-- ========================================
-- 1. Update app_role enum to include instructor and student
-- ========================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'instructor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';

-- ========================================
-- 2. Create course_status enum for approval workflow
-- ========================================
CREATE TYPE public.course_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'archived');

-- Add status column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status public.course_status DEFAULT 'draft';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES public.profiles(user_id);

-- ========================================
-- 3. Create course_categories table
-- ========================================
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

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.course_categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- 4. Create learning_paths table
-- ========================================
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

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learning paths viewable by everyone" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Admins can manage learning paths" ON public.learning_paths FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Junction table for courses in learning paths
CREATE TABLE public.learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(learning_path_id, course_id)
);

ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learning path courses viewable by everyone" ON public.learning_path_courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage learning path courses" ON public.learning_path_courses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- 5. Create certificate_templates table
-- ========================================
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

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage certificate templates" ON public.certificate_templates FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Templates viewable by authenticated users" ON public.certificate_templates FOR SELECT TO authenticated USING (true);

-- ========================================
-- 6. Create certificates table
-- ========================================
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

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all certificates" ON public.certificates FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public certificate verification" ON public.certificates FOR SELECT USING (revoked_at IS NULL);

-- Add certificate eligibility to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_template_id UUID REFERENCES public.certificate_templates(id);

-- ========================================
-- 7. Create platform_settings table
-- ========================================
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_by UUID
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default settings
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

-- ========================================
-- 8. Create blog_posts table
-- ========================================
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

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts viewable by everyone" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own posts" ON public.blog_posts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors can create posts" ON public.blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON public.blog_posts FOR UPDATE USING (auth.uid() = author_id);

-- ========================================
-- 9. Create audit_logs table
-- ========================================
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

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ========================================
-- 10. Add last_login to profiles
-- ========================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- ========================================
-- 11. Create function to log audit events
-- ========================================
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

-- ========================================
-- 12. Update triggers
-- ========================================
CREATE TRIGGER update_course_categories_updated_at
BEFORE UPDATE ON public.course_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at
BEFORE UPDATE ON public.learning_paths
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at
BEFORE UPDATE ON public.certificate_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();