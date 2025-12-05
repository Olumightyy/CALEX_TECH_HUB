-- Fix courses RLS policies to use the is_admin() function and relax teacher verification
-- This fixes infinite recursion and allows teachers to create courses

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update all courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete any course" ON public.courses;
DROP POLICY IF EXISTS "Teachers can create courses" ON public.courses;

-- Recreate admin policies using the is_admin() function (avoids recursion)
CREATE POLICY "Admins can view all courses"
  ON public.courses FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all courses"
  ON public.courses FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete any course"
  ON public.courses FOR DELETE
  USING (public.is_admin());

-- Allow teachers to create courses even without verification for now
-- Verification can be enforced at the application level
CREATE POLICY "Teachers can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );
