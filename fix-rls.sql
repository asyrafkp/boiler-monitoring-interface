-- Disable RLS on boiler_readings table to allow manual uploads from browser
-- Run this in Supabase SQL Editor

ALTER TABLE boiler_readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_uploads DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('boiler_readings', 'admin_settings', 'admin_uploads');

-- Expected result: All should show rowsecurity = false
