-- Create Quiz System Tables

-- Quiz question types enum
CREATE TYPE public.quiz_question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  curriculum_id UUID REFERENCES public.course_curriculum(id) ON DELETE SET NULL,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER, -- in minutes, null means no limit
  passing_score INTEGER DEFAULT 70, -- percentage
  max_attempts INTEGER DEFAULT 3, -- null means unlimited
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
  explanation TEXT, -- shown after answering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quiz answers table (for multiple choice and true/false)
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quiz attempts table (tracks each student attempt)
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  score NUMERIC(5,2), -- percentage score
  total_points INTEGER DEFAULT 0,
  earned_points INTEGER DEFAULT 0,
  passed BOOLEAN,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quiz responses table (individual question responses)
CREATE TABLE public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer_id UUID REFERENCES public.quiz_answers(id) ON DELETE SET NULL,
  text_response TEXT, -- for short answer questions
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(attempt_id, question_id)
);

-- Enable RLS on all quiz tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- ========================
-- QUIZZES RLS POLICIES
-- ========================

-- Admins can manage all quizzes
CREATE POLICY "Admins can manage all quizzes"
ON public.quizzes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Instructors can manage their own quizzes
CREATE POLICY "Instructors can insert their own quizzes"
ON public.quizzes FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
);

CREATE POLICY "Instructors can update their own quizzes"
ON public.quizzes FOR UPDATE
USING (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
);

CREATE POLICY "Instructors can view their own quizzes"
ON public.quizzes FOR SELECT
USING (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
);

CREATE POLICY "Instructors can delete their own quizzes"
ON public.quizzes FOR DELETE
USING (
  has_role(auth.uid(), 'instructor'::app_role) 
  AND instructor_id = auth.uid()
);

-- Students can view published quizzes for enrolled courses
CREATE POLICY "Students can view published quizzes"
ON public.quizzes FOR SELECT
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = quizzes.course_id
    AND enrollments.user_id = auth.uid()
  )
);

-- ========================
-- QUIZ QUESTIONS RLS POLICIES
-- ========================

-- Admins can manage all questions
CREATE POLICY "Admins can manage all quiz questions"
ON public.quiz_questions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Instructors can manage questions for their quizzes
CREATE POLICY "Instructors can manage their quiz questions"
ON public.quiz_questions FOR ALL
USING (
  has_role(auth.uid(), 'instructor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_questions.quiz_id
    AND quizzes.instructor_id = auth.uid()
  )
);

-- Students can view questions for quizzes they can access
CREATE POLICY "Students can view quiz questions"
ON public.quiz_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.enrollments e ON e.course_id = q.course_id
    WHERE q.id = quiz_questions.quiz_id
    AND q.is_published = true
    AND e.user_id = auth.uid()
  )
);

-- ========================
-- QUIZ ANSWERS RLS POLICIES
-- ========================

-- Admins can manage all answers
CREATE POLICY "Admins can manage all quiz answers"
ON public.quiz_answers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Instructors can manage answers for their quizzes
CREATE POLICY "Instructors can manage their quiz answers"
ON public.quiz_answers FOR ALL
USING (
  has_role(auth.uid(), 'instructor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    WHERE qq.id = quiz_answers.question_id
    AND q.instructor_id = auth.uid()
  )
);

-- Students can view answers for quizzes they can access
CREATE POLICY "Students can view quiz answers"
ON public.quiz_answers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    JOIN public.enrollments e ON e.course_id = q.course_id
    WHERE qq.id = quiz_answers.question_id
    AND q.is_published = true
    AND e.user_id = auth.uid()
  )
);

-- ========================
-- QUIZ ATTEMPTS RLS POLICIES
-- ========================

-- Admins can manage all attempts
CREATE POLICY "Admins can manage all quiz attempts"
ON public.quiz_attempts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Instructors can view attempts for their quizzes
CREATE POLICY "Instructors can view quiz attempts"
ON public.quiz_attempts FOR SELECT
USING (
  has_role(auth.uid(), 'instructor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_attempts.quiz_id
    AND quizzes.instructor_id = auth.uid()
  )
);

-- Students can manage their own attempts
CREATE POLICY "Students can insert their own attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own attempts"
ON public.quiz_attempts FOR UPDATE
USING (student_id = auth.uid());

CREATE POLICY "Students can view their own attempts"
ON public.quiz_attempts FOR SELECT
USING (student_id = auth.uid());

-- ========================
-- QUIZ RESPONSES RLS POLICIES
-- ========================

-- Admins can manage all responses
CREATE POLICY "Admins can manage all quiz responses"
ON public.quiz_responses FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Instructors can view responses for their quizzes
CREATE POLICY "Instructors can view quiz responses"
ON public.quiz_responses FOR SELECT
USING (
  has_role(auth.uid(), 'instructor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.quiz_attempts qa
    JOIN public.quizzes q ON q.id = qa.quiz_id
    WHERE qa.id = quiz_responses.attempt_id
    AND q.instructor_id = auth.uid()
  )
);

-- Students can manage their own responses
CREATE POLICY "Students can insert their own responses"
ON public.quiz_responses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE quiz_attempts.id = quiz_responses.attempt_id
    AND quiz_attempts.student_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own responses"
ON public.quiz_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE quiz_attempts.id = quiz_responses.attempt_id
    AND quiz_attempts.student_id = auth.uid()
  )
);

-- Create updated_at trigger for quizzes
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX idx_quizzes_instructor_id ON public.quizzes(instructor_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_responses_attempt_id ON public.quiz_responses(attempt_id);