-- Enable Row Level Security on the courses table if not already enabled
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policy to allow teachers to delete their own courses
-- This assumes 'teacher_id' is a column in 'courses' table linking to 'auth.users.id'
CREATE POLICY "Teachers can delete their own courses"
ON public.courses
FOR DELETE
TO authenticated
USING (
  auth.uid() = teacher_id
);
