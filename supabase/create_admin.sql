-- ============================================
-- FIRST ADMIN USER SETUP
-- ============================================
-- Run this in Supabase SQL Editor to create your first admin user
-- 
-- Steps:
-- 1. Go to https://app.supabase.com/project/_/sql/new
-- 2. Paste this script
-- 3. Replace 'admin@pantauannusantara.com' with your email
-- 4. Replace 'YourSecurePassword123!' with your password
-- 5. Run the script
-- 6. Use these credentials to login at /login
-- ============================================

-- Step 1: Create auth user (replace email and password)
-- Note: You can also create the user via the signup flow at /login
-- Then come here to assign admin role

-- Step 2: Find your user ID after signing up
-- Run this to find your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'admin@pantauannusantara.com';

-- Step 3: Assign admin role (replace YOUR_USER_ID with actual UUID from step 2)
-- Example:
-- INSERT INTO core.user_roles (user_id, role_code) VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'admin');

-- Step 4: Set user status to active
-- UPDATE core.users SET status = 'active' WHERE id = 'YOUR_USER_ID';

-- ============================================
-- QUICK SETUP (if you already have a user):
-- ============================================
-- Replace 'YOUR_USER_ID' with your actual user UUID:

-- Grant admin role
INSERT INTO core.user_roles (user_id, role_code) 
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'admin@pantauannusantara.com'
ON CONFLICT (user_id, role_code) DO NOTHING;

-- Activate user
UPDATE core.users 
SET status = 'active' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@pantauannusantara.com');

-- ============================================
-- VERIFY SETUP:
-- ============================================
SELECT 
    u.id,
    u.email,
    u.status,
    r.role_code
FROM auth.users u
LEFT JOIN core.user_roles r ON u.id = r.user_id
WHERE u.email = 'admin@pantauannusantara.com';
