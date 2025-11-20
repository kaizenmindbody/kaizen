-- =====================================================
-- FIX CLINICMEMBERS RLS POLICIES
-- =====================================================
-- This script fixes RLS policies for ClinicMembers table
-- to allow clinic owners to insert members via CSV upload
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clinic owners can view clinic members" ON "ClinicMembers";
DROP POLICY IF EXISTS "Clinic owners can insert clinic members" ON "ClinicMembers";
DROP POLICY IF EXISTS "Clinic owners can update clinic members" ON "ClinicMembers";
DROP POLICY IF EXISTS "Clinic owners can delete clinic members" ON "ClinicMembers";
DROP POLICY IF EXISTS "System can create clinic members" ON "ClinicMembers";
DROP POLICY IF EXISTS "Anyone can view clinic members" ON "ClinicMembers";

-- Enable Row Level Security (if not already enabled)
ALTER TABLE "ClinicMembers" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR CLINICMEMBERS
-- =====================================================

-- Policy 1: Clinic owners can view members of their clinic
-- Checks if the authenticated user is the clinic owner via Clinics table
CREATE POLICY "Clinic owners can view clinic members" ON "ClinicMembers"
  FOR SELECT 
  USING (
    clinic_id IN (
      SELECT practitioner_id 
      FROM "Clinics" 
      WHERE practitioner_id = auth.uid()
    )
    OR
    clinic_id = auth.uid() -- Direct match (if clinic_id is practitioner_id)
  );

-- Policy 2: Clinic owners can insert members to their clinic
-- This is the key policy for CSV upload functionality
-- clinic_id should match the authenticated user's ID (clinic owner's practitioner_id)
CREATE POLICY "Clinic owners can insert clinic members" ON "ClinicMembers"
  FOR INSERT 
  WITH CHECK (
    -- Primary check: clinic_id matches authenticated user (clinic owner)
    clinic_id = auth.uid()
    OR
    -- Fallback: check via Clinics table relationship
    clinic_id IN (
      SELECT practitioner_id 
      FROM "Clinics" 
      WHERE practitioner_id = auth.uid()
    )
  );

-- Policy 3: Clinic owners can update members of their clinic
CREATE POLICY "Clinic owners can update clinic members" ON "ClinicMembers"
  FOR UPDATE 
  USING (
    clinic_id IN (
      SELECT practitioner_id 
      FROM "Clinics" 
      WHERE practitioner_id = auth.uid()
    )
    OR
    clinic_id = auth.uid() -- Direct match (if clinic_id is practitioner_id)
  )
  WITH CHECK (
    clinic_id IN (
      SELECT practitioner_id 
      FROM "Clinics" 
      WHERE practitioner_id = auth.uid()
    )
    OR
    clinic_id = auth.uid() -- Direct match (if clinic_id is practitioner_id)
  );

-- Policy 4: Clinic owners can delete members from their clinic
CREATE POLICY "Clinic owners can delete clinic members" ON "ClinicMembers"
  FOR DELETE 
  USING (
    clinic_id IN (
      SELECT practitioner_id 
      FROM "Clinics" 
      WHERE practitioner_id = auth.uid()
    )
    OR
    clinic_id = auth.uid() -- Direct match (if clinic_id is practitioner_id)
  );

-- Policy 5: Members can view their own membership
-- Allows clinic members to see their own membership record
-- Uses email to match with authenticated user
CREATE POLICY "Members can view own membership" ON "ClinicMembers"
  FOR SELECT 
  USING (
    email IN (
      SELECT email 
      FROM "Users" 
      WHERE id = auth.uid()
    )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ClinicMembers'
ORDER BY policyname;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. The policies check if the authenticated user (auth.uid()) is a clinic owner
--    by verifying they have a record in the Clinics table with matching practitioner_id
-- 
-- 2. The policies also allow direct matching (clinic_id = auth.uid()) as a fallback
--    in case clinic_id directly stores the practitioner_id
--
-- 3. If you're using service role key in API routes, those bypass RLS automatically
--    but frontend calls using regular supabase client will be subject to these policies
--
-- 4. To test the policies:
--    - Login as a clinic owner
--    - Try to insert a clinic member via the CSV upload feature
--    - Should work if the clinic_id matches the authenticated user's ID or their clinic's practitioner_id

