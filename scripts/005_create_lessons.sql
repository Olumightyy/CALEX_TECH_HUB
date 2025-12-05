-- Lessons within modules
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'video' CHECK (content_type IN ('video', 'text', 'pdf', 'quiz')),
  video_url TEXT,
  content TEXT, -- For text lessons
  pdf_url TEXT,
  duration INTEGER DEFAULT 0, -- in minutes
  position INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE, -- Free preview lesson
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can view preview lessons of published courses
CREATE POLICY "Anyone can view preview lessons"
  ON public.lessons FOR SELECT
  USING (
    is_preview = TRUE AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.status = 'published'
    )
  );

-- Enrolled students can view all lessons
CREATE POLICY "Enrolled students can view lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = lessons.course_id 
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Teachers can view their own course lessons
CREATE POLICY "Teachers can view their own lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.teacher_id = auth.uid()
    )
  );

-- Teachers can create lessons
CREATE POLICY "Teachers can create lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.teacher_id = auth.uid()
    )
  );

-- Teachers can update their lessons
CREATE POLICY "Teachers can update their lessons"
  ON public.lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.teacher_id = auth.uid()
    )
  );

-- Teachers can delete their lessons
CREATE POLICY "Teachers can delete their lessons"
  ON public.lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.teacher_id = auth.uid()
    )
  );

-- Admins can manage all lessons
CREATE POLICY "Admins can view all lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all lessons"
  ON public.lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
