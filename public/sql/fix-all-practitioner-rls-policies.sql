-- =====================================================
-- COMPREHENSIVE FIX FOR PRACTITIONER VIEWING RLS POLICIES
-- Fixes RLS policies on Users, UserMedia, and Descriptions tables
-- to allow public viewing of practitioner profiles
-- =====================================================

-- ========== USERS TABLE ==========

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view practitioners" ON "Users";

-- Create policy to allow public viewing of practitioners
CREATE POLICY "Public can view practitioners" ON "Users"
  FOR SELECT USING (
    -- Allow viewing of all practitioner profiles
    -- This enables the find-practitioner page and practitioner-details page
    -- Check if type column contains 'practitioner' (case-insensitive) OR ptype is not null
    LOWER(type::text) = 'practitioner' OR ptype IS NOT NULL
  );

-- Note: This complements existing policies:
-- 1. "Users can view own profile" - users can view their own profile
-- 2. "Clinic admins can view clinic practitioners" - clinic admins can view their clinic members
-- 3. "Public can view practitioners" (this policy) - anyone can view practitioners


-- ========== USERMEDIA TABLE ==========

-- Ensure UserMedia table has RLS enabled
ALTER TABLE "UserMedia" ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the public read policy to ensure it exists
DROP POLICY IF EXISTS "Allow public read access to all media" ON "UserMedia";
DROP POLICY IF EXISTS "Public can view all media" ON "UserMedia";

-- Allow public read access to all media (for profile viewing)
-- This is necessary for viewing practitioner videos and images
CREATE POLICY "Public can view all media" ON "UserMedia"
  FOR SELECT
  USING (true);

-- Keep existing policies for users to manage their own media
-- (These should already exist from create-usermedia-table.sql)


-- ========== DESCRIPTIONS TABLE ==========

-- Ensure Descriptions table has RLS enabled
ALTER TABLE "Descriptions" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own descriptions" ON "Descriptions";
DROP POLICY IF EXISTS "Users can insert own descriptions" ON "Descriptions";
DROP POLICY IF EXISTS "Users can update own descriptions" ON "Descriptions";
DROP POLICY IF EXISTS "Users can delete own descriptions" ON "Descriptions";
DROP POLICY IF EXISTS "Public can view practitioner descriptions" ON "Descriptions";

-- Allow users to view their own descriptions
CREATE POLICY "Users can view own descriptions" ON "Descriptions"
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own descriptions
CREATE POLICY "Users can insert own descriptions" ON "Descriptions"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own descriptions
CREATE POLICY "Users can update own descriptions" ON "Descriptions"
  FOR UPDATE
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to delete their own descriptions
CREATE POLICY "Users can delete own descriptions" ON "Descriptions"
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Allow public read access to all descriptions (for profile viewing)
-- This is necessary for viewing practitioner background, education, treatment info, etc.
CREATE POLICY "Public can view practitioner descriptions" ON "Descriptions"
  FOR SELECT
  USING (true);


-- ========== VERIFICATION QUERIES ==========

-- Uncomment these to verify policies were created successfully:

-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('Users', 'UserMedia', 'Descriptions')
-- ORDER BY tablename, policyname;

COMMIT;
