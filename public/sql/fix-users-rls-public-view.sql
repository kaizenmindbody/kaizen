-- =====================================================
-- FIX USERS TABLE RLS POLICIES
-- Add missing policy to allow public viewing of practitioners
-- =====================================================

-- This policy allows anyone (authenticated or not) to view practitioner profiles
-- This is necessary for the find-practitioner and practitioner-details pages

DROP POLICY IF EXISTS "Public can view practitioners" ON "Users";

CREATE POLICY "Public can view practitioners" ON "Users"
  FOR SELECT USING (
    -- Allow viewing of all practitioner profiles (type = 'Practitioner')
    -- This enables the find-practitioner page and practitioner-details page
    type = 'Practitioner' OR ptype IS NOT NULL
  );

-- Note: This policy complements existing policies:
-- 1. "Users can view own profile" - users can view their own profile regardless of type
-- 2. "Clinic admins can view clinic practitioners" - clinic admins can view their clinic members
-- 3. "Public can view practitioners" (this new policy) - anyone can view practitioners

COMMIT;
