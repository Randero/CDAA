
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

ALTER TABLE public.transcript_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own requests" ON public.transcript_requests
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own requests" ON public.transcript_requests
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage all transcript requests" ON public.transcript_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_transcript_requests_updated_at
  BEFORE UPDATE ON public.transcript_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
