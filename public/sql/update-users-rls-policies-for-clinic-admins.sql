-- =====================================================
-- UPDATE RLS POLICIES FOR USERS TABLE
-- Allow Clinic Admins to Create and Manage Practitioners
-- =====================================================

-- This policy allows clinic admins (clinic owners) to insert new practitioner records
-- when managing their clinic members via CSV upload

-- First, drop the existing overly restrictive policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON "Users";

-- New policy: Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON "Users"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- New policy: Allow clinic admins to insert new practitioners for their clinic
-- This enables CSV upload functionality for clinic member management
DROP POLICY IF EXISTS "Clinic admins can create practitioners" ON "Users";
CREATE POLICY "Clinic admins can create practitioners" ON "Users"
  FOR INSERT WITH CHECK (
    -- Check if the current user is a clinic owner
    auth.uid() IN (
      SELECT practitioner_id FROM "Clinics"
    )
  );

-- Update policy: Allow clinic admins to update practitioners in their clinic
DROP POLICY IF EXISTS "Clinic admins can update clinic practitioners" ON "Users";
CREATE POLICY "Clinic admins can update clinic practitioners" ON "Users"
  FOR UPDATE USING (
    -- Clinic admins can update practitioners who are members of their clinic
    id IN (
      SELECT cm.practitioner_id
      FROM "ClinicMembers" cm
      WHERE cm.clinic_id IN (
        SELECT id FROM "Clinics" WHERE practitioner_id = auth.uid()
      )
    )
  );

-- Select policy: Allow clinic admins to read practitioners in their clinic
DROP POLICY IF EXISTS "Clinic admins can view clinic practitioners" ON "Users";
CREATE POLICY "Clinic admins can view clinic practitioners" ON "Users"
  FOR SELECT USING (
    -- Clinic admins can view their own profile + practitioners in their clinic
    auth.uid() = id OR
    id IN (
      SELECT cm.practitioner_id
      FROM "ClinicMembers" cm
      WHERE cm.clinic_id IN (
        SELECT id FROM "Clinics" WHERE practitioner_id = auth.uid()
      )
    )
  );

-- Existing policies remain unchanged:
-- "Users can view own profile" - users can read their own profile
-- "Users can update own profile" - users can update their own profile
-- "Public can view practitioners" - anyone can view public practitioner info (if exists)

COMMIT;
