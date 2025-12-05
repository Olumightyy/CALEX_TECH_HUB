-- Ensure categories exist (safe to run multiple times)
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Web Development', 'web-development', 'Learn to build modern web applications', 'code'),
  ('Data Science', 'data-science', 'Master data analysis and machine learning', 'bar-chart'),
  ('Mobile Development', 'mobile-development', 'Build iOS and Android applications', 'smartphone'),
  ('Design', 'design', 'UI/UX design and graphic design courses', 'palette'),
  ('Business', 'business', 'Business strategy and entrepreneurship', 'briefcase'),
  ('Marketing', 'marketing', 'Digital marketing and growth strategies', 'trending-up'),
  ('Programming', 'programming', 'Core programming concepts and languages', 'terminal'),
  ('Cloud Computing', 'cloud-computing', 'AWS, Azure, and cloud infrastructure', 'cloud'),
  ('Cybersecurity', 'cybersecurity', 'Security fundamentals and ethical hacking', 'shield'),
  ('AI & Machine Learning', 'ai-machine-learning', 'Artificial intelligence and ML fundamentals', 'brain')
ON CONFLICT (slug) DO NOTHING;
