-- Promote a user to admin by their email address
-- Replace 'your-email@example.com' with your actual email

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Verify the update
SELECT id, full_name, email, role 
FROM public.profiles 
WHERE role = 'admin';
