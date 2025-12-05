-- Categories for courses
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (TRUE);

-- Only admins can manage categories
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed initial categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Web Development', 'web-development', 'Learn to build modern web applications', 'code'),
  ('Data Science', 'data-science', 'Master data analysis and machine learning', 'bar-chart'),
  ('Mobile Development', 'mobile-development', 'Build iOS and Android applications', 'smartphone'),
  ('Design', 'design', 'UI/UX design and graphic design courses', 'palette'),
  ('Business', 'business', 'Business strategy and entrepreneurship', 'briefcase'),
  ('Marketing', 'marketing', 'Digital marketing and growth strategies', 'trending-up')
ON CONFLICT (slug) DO NOTHING;
