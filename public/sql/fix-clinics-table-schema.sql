-- =====================================================
-- FIX CLINICS TABLE SCHEMA
-- =====================================================
-- This script adds any missing columns to the Clinics table

-- Add clinic_video column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Clinics' AND column_name = 'clinic_video'
  ) THEN
    ALTER TABLE "Clinics" ADD COLUMN clinic_video TEXT;
    COMMENT ON COLUMN "Clinics".clinic_video IS 'URL to clinic video stored in Supabase storage bucket (kaizen/clinic_videos/)';
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
  END IF;
END $$;

-- Verify the changes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Clinics'
ORDER BY ordinal_position;
