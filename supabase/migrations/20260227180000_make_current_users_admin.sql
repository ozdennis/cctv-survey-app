-- Elevate all currently existing test users to 'admin'
UPDATE public.users
SET role = 'admin';