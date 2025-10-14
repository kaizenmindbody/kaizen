-- =====================================================
-- MIGRATION: Add is_clinic_specific column to ServicePricing
-- =====================================================
-- This migration adds the is_clinic_specific column to distinguish
-- between personal practitioner pricing and clinic-specific pricing
-- =====================================================

-- Add the is_clinic_specific column
ALTER TABLE "ServicePricing"
ADD COLUMN IF NOT EXISTS is_clinic_specific BOOLEAN DEFAULT false;

-- Create index for better performance on clinic-specific queries
CREATE INDEX IF NOT EXISTS idx_service_pricing_clinic_specific
ON "ServicePricing"(practitioner_id, is_clinic_specific);

-- Add comment for documentation
COMMENT ON COLUMN "ServicePricing".is_clinic_specific IS
'Indicates if this pricing is specific to a clinic (true) or personal practitioner pricing (false)';

-- Verify the column was added
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ServicePricing'
AND column_name = 'is_clinic_specific';

-- Show sample data structure
SELECT
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'ServicePricing'
ORDER BY ordinal_position;
