-- =====================================================
-- CHECK CURRENT RLS POLICIES
-- Run this to see what RLS policies currently exist
-- =====================================================

-- Check if RLS is enabled on each table
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename IN ('Users', 'UserMedia', 'Descriptions')
ORDER BY tablename;

-- Show all policies for Users, UserMedia, and Descriptions tables
SELECT
  schemaname,
  tablename,
  policyname as "Policy Name",
  permissive as "Type",
  roles as "Roles",
  cmd as "Command",
  qual as "USING Expression",
  with_check as "WITH CHECK Expression"
FROM pg_policies
WHERE tablename IN ('Users', 'UserMedia', 'Descriptions')
ORDER BY tablename, policyname;
