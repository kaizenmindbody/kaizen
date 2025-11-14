-- =====================================================
-- COMPLETE FIX FOR CLINIC UPDATE ISSUES
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- STEP 1: CHECK CURRENT CLINICS TABLE SCHEMA
-- =====================================================
SELECT '=== STEP 1: CURRENT CLINICS TABLE SCHEMA ===' AS step;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Clinics'
ORDER BY ordinal_position;

-- STEP 2: CHECK FOR clinic_id COLUMNS ANYWHERE
-- =====================================================
SELECT '=== STEP 2: ALL clinic_id COLUMNS IN DATABASE ===' AS step;

SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'clinic_id'
ORDER BY table_name;

-- STEP 3: CHECK SERVICE PRICING TABLE SCHEMA
-- =====================================================
SELECT '=== STEP 3: CURRENT SERVICE PRICING TABLE SCHEMA ===' AS step;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ServicePricing'
ORDER BY ordinal_position;

-- STEP 4: FIX clinic_id TYPE MISMATCH
-- =====================================================
SELECT '=== STEP 4: FIXING clinic_id TYPE MISMATCH ===' AS step;

DO $$
DECLARE
  column_exists boolean;
  current_type text;
BEGIN
  -- Check if clinic_id exists in ServicePricing
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ServicePricing' AND column_name = 'clinic_id'
  ) INTO column_exists;

  IF column_exists THEN
    -- Get the current data type
    SELECT data_type INTO current_type
    FROM information_schema.columns
    WHERE table_name = 'ServicePricing' AND column_name = 'clinic_id';

    RAISE NOTICE 'clinic_id column exists in ServicePricing with type: %', current_type;

    -- If it's bigint, drop it
    IF current_type = 'bigint' THEN
      RAISE NOTICE 'Dropping clinic_id column (bigint type causing errors)...';
      ALTER TABLE "ServicePricing" DROP COLUMN clinic_id;
      RAISE NOTICE 'clinic_id column dropped successfully';
    ELSIF current_type = 'uuid' THEN
      RAISE NOTICE 'clinic_id is UUID type - checking if it should be removed...';
      -- You can uncomment the next line if you want to remove it anyway
      -- ALTER TABLE "ServicePricing" DROP COLUMN clinic_id;
      RAISE NOTICE 'Keeping clinic_id as UUID. If issues persist, drop it manually.';
    ELSE
      RAISE NOTICE 'clinic_id has unexpected type: %. Dropping it...', current_type;
      ALTER TABLE "ServicePricing" DROP COLUMN clinic_id;
    END IF;
  ELSE
    RAISE NOTICE 'clinic_id column does not exist in ServicePricing - this is good!';
  END IF;
END $$;

-- STEP 5: ADD MISSING COLUMNS TO CLINICS TABLE
-- =====================================================
SELECT '=== STEP 5: ADDING MISSING COLUMNS TO CLINICS ===' AS step;

-- Add clinic_video column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Clinics' AND column_name = 'clinic_video'
  ) THEN
    ALTER TABLE "Clinics" ADD COLUMN clinic_video TEXT;
    COMMENT ON COLUMN "Clinics".clinic_video IS 'URL to clinic video stored in Supabase storage bucket (kaizen/clinic_videos/)';
    RAISE NOTICE 'Added clinic_video column';
  ELSE
    RAISE NOTICE 'clinic_video column already exists';
  END IF;
END $$;

-- Add clinic_images column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Clinics' AND column_name = 'clinic_images'
  ) THEN
    ALTER TABLE "Clinics" ADD COLUMN clinic_images TEXT[];
    COMMENT ON COLUMN "Clinics".clinic_images IS 'Array of URLs to clinic images stored in Supabase storage bucket (kaizen/clinic_images/)';
    RAISE NOTICE 'Added clinic_images column';
  ELSE
    RAISE NOTICE 'clinic_images column already exists';
  END IF;
END $$;

-- STEP 6: VERIFY FINAL SCHEMAS
-- =====================================================
SELECT '=== STEP 6: FINAL CLINICS TABLE SCHEMA ===' AS step;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Clinics'
ORDER BY ordinal_position;

SELECT '=== STEP 7: FINAL SERVICE PRICING TABLE SCHEMA ===' AS step;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ServicePricing'
ORDER BY ordinal_position;

-- STEP 8: CHECK FOREIGN KEYS
-- =====================================================
SELECT '=== STEP 8: FOREIGN KEYS ON SERVICE PRICING ===' AS step;

SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name='ServicePricing';

-- DONE!
SELECT '=== ✅ COMPLETE! ALL FIXES APPLIED ===' AS step;
