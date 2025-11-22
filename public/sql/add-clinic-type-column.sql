-- =====================================================
-- ADD CLINIC_TYPE COLUMN TO CLINICS TABLE
-- =====================================================
-- This migration adds a clinic_type column to allow
-- practitioners to customize the clinic type badge
-- displayed on their clinic page
-- =====================================================

-- Add clinic_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Clinics' AND column_name = 'clinic_type'
  ) THEN
    ALTER TABLE "Clinics" ADD COLUMN clinic_type TEXT DEFAULT 'Healthcare Clinic';
    COMMENT ON COLUMN "Clinics".clinic_type IS 'Type of clinic (e.g., Healthcare Clinic, Medical Center, Hospital) - displayed as badge on clinic page';
  END IF;
END $$;

-- Update existing records to have default value if null
UPDATE "Clinics"
SET clinic_type = 'Healthcare Clinic'
WHERE clinic_type IS NULL;

-- Verify the changes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Clinics' AND column_name = 'clinic_type';

