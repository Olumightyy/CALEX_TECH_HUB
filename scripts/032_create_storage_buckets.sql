-- Create storage buckets for the platform
-- Note: This needs to be run with service_role permissions

-- Course thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lesson resources bucket (videos, PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-resources',
  'lesson-resources',
  false,
  524288000, -- 500MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Teacher uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teacher-uploads',
  'teacher-uploads',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Certificate exports bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificate-exports',
  'certificate-exports',
  true,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for course-thumbnails (public bucket)
CREATE POLICY "Anyone can view course thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Teachers can upload course thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-thumbnails' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Teachers can update their thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'course-thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Teachers can delete their thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for lesson-resources (private bucket)
CREATE POLICY "Authenticated users can view lesson resources"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lesson-resources' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Teachers can upload lesson resources"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-resources' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Teachers can update their lesson resources"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'lesson-resources' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Teachers can delete their lesson resources"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lesson-resources' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for teacher-uploads
CREATE POLICY "Teachers can view their uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'teacher-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Teachers can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'teacher-uploads' AND
    auth.uid() IS NOT NULL
  );

-- Storage policies for certificate-exports (public)
CREATE POLICY "Anyone can view certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificate-exports');

CREATE POLICY "System can create certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certificate-exports' AND
    auth.uid() IS NOT NULL
  );
