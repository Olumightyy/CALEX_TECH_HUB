-- Platform announcements (public-only, no private messaging)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- NULL means platform-wide
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can view published platform-wide announcements
CREATE POLICY "Anyone can view published announcements"
  ON public.announcements FOR SELECT
  USING (is_published = TRUE AND course_id IS NULL);

-- Enrolled students can view course announcements
CREATE POLICY "Enrolled students can view course announcements"
  ON public.announcements FOR SELECT
  USING (
    is_published = TRUE AND
    course_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = announcements.course_id 
      AND enrollments.student_id = auth.uid()
    )
  );

-- Teachers can view their course announcements
CREATE POLICY "Teachers can view their announcements"
  ON public.announcements FOR SELECT
  USING (author_id = auth.uid());

-- Teachers can create course announcements
CREATE POLICY "Teachers can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    (
      course_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = announcements.course_id AND courses.teacher_id = auth.uid()
      )
    )
  );

-- Teachers can update their announcements
CREATE POLICY "Teachers can update their announcements"
  ON public.announcements FOR UPDATE
  USING (author_id = auth.uid());

-- Teachers can delete their announcements
CREATE POLICY "Teachers can delete their announcements"
  ON public.announcements FOR DELETE
  USING (author_id = auth.uid());

-- Admins can manage all announcements
CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_announcements_author ON public.announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_course ON public.announcements(course_id);
