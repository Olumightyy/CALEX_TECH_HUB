-- Teacher verification applications
CREATE TABLE IF NOT EXISTS public.teacher_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  expertise TEXT NOT NULL,
  experience_years INTEGER,
  qualifications TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  bio TEXT NOT NULL,
  reason TEXT NOT NULL, -- Why they want to teach
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  documents_url TEXT[], -- Array of document URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own application
CREATE POLICY "Users can view their application"
  ON public.teacher_applications FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their application
CREATE POLICY "Users can create their application"
  ON public.teacher_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their pending application
CREATE POLICY "Users can update pending application"
  ON public.teacher_applications FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.teacher_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON public.teacher_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_teacher_applications_user ON public.teacher_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_applications_status ON public.teacher_applications(status);
