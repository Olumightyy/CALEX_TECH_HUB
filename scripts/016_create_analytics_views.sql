-- Analytics views for dashboards

-- Monthly revenue summary view
CREATE OR REPLACE VIEW public.monthly_revenue AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as total_revenue,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT student_id) as unique_students
FROM public.payments
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Course performance view
CREATE OR REPLACE VIEW public.course_performance AS
SELECT 
  c.id as course_id,
  c.title,
  c.teacher_id,
  p.full_name as teacher_name,
  c.enrollment_count,
  c.average_rating,
  c.review_count,
  COALESCE(SUM(pay.amount), 0) as total_revenue,
  COUNT(DISTINCT e.student_id) as active_students,
  AVG(e.progress) as avg_progress
FROM public.courses c
LEFT JOIN public.profiles p ON c.teacher_id = p.id
LEFT JOIN public.enrollments e ON c.id = e.course_id
LEFT JOIN public.payments pay ON c.id = pay.course_id AND pay.status = 'completed'
WHERE c.status = 'published'
GROUP BY c.id, c.title, c.teacher_id, p.full_name, c.enrollment_count, c.average_rating, c.review_count;

-- Teacher performance view
CREATE OR REPLACE VIEW public.teacher_performance AS
SELECT 
  p.id as teacher_id,
  p.full_name,
  p.email,
  COUNT(DISTINCT c.id) as total_courses,
  SUM(c.enrollment_count) as total_enrollments,
  AVG(c.average_rating) as avg_rating,
  SUM(c.review_count) as total_reviews
FROM public.profiles p
LEFT JOIN public.courses c ON p.id = c.teacher_id AND c.status = 'published'
WHERE p.role = 'teacher' AND p.is_verified = TRUE
GROUP BY p.id, p.full_name, p.email;

-- Platform statistics view
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher' AND is_verified = TRUE) as total_teachers,
  (SELECT COUNT(*) FROM public.courses WHERE status = 'published') as total_courses,
  (SELECT COUNT(*) FROM public.enrollments WHERE status = 'active') as active_enrollments,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM public.certificates) as certificates_issued;
