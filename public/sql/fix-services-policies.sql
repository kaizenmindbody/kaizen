-- Fix Row Level Security policies for Services table
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view services" ON Services;
DROP POLICY IF EXISTS "Authenticated users can insert services" ON Services;
DROP POLICY IF EXISTS "Authenticated users can update services" ON Services;
DROP POLICY IF EXISTS "Authenticated users can delete services" ON Services;

-- Recreate policies with correct authentication check
-- Policy: Everyone can view services
CREATE POLICY "Public can view services" ON Services
  FOR SELECT USING (true);

-- Policy: Only authenticated users can insert services
CREATE POLICY "Authenticated users can insert services" ON Services
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can update services
CREATE POLICY "Authenticated users can update services" ON Services
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can delete services
CREATE POLICY "Authenticated users can delete services" ON Services
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'Services'
ORDER BY policyname;
