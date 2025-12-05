-- Certificates for course completion
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  pdf_url TEXT,
  UNIQUE(student_id, course_id)
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Students can view their own certificates
CREATE POLICY "Students can view their certificates"
  ON public.certificates FOR SELECT
  USING (student_id = auth.uid());

-- Anyone can verify certificates by number (public verification)
CREATE POLICY "Anyone can verify certificates"
  ON public.certificates FOR SELECT
  USING (TRUE);

-- System creates certificates
CREATE POLICY "System can create certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Teachers can view certificates for their courses
CREATE POLICY "Teachers can view course certificates"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = certificates.course_id AND courses.teacher_id = auth.uid()
    )
  );

-- Admins can manage all certificates
CREATE POLICY "Admins can manage all certificates"
  ON public.certificates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
