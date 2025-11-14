-- =====================================================
-- DIAGNOSE AND FIX CLINIC_ID TYPE MISMATCH
-- =====================================================

-- STEP 1: Check if clinic_id column exists in ServicePricing
DO $$
DECLARE
  column_exists boolean;
  current_type text;
BEGIN
  -- Check if clinic_id exists
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

    -- If it's bigint, we need to change it to UUID
    IF current_type = 'bigint' THEN
      RAISE NOTICE 'Converting clinic_id from bigint to UUID...';

      -- Drop the column and recreate with correct type
      ALTER TABLE "ServicePricing" DROP COLUMN IF EXISTS clinic_id;

      -- Add it back as UUID if needed (optional - only if you actually need this column)
      -- ALTER TABLE "ServicePricing" ADD COLUMN clinic_id UUID REFERENCES "Clinics"(id) ON DELETE SET NULL;

      RAISE NOTICE 'clinic_id column dropped. If needed, add it back as UUID type.';
    ELSIF current_type = 'uuid' THEN
      RAISE NOTICE 'clinic_id is already UUID type - no change needed';
    ELSE
      RAISE NOTICE 'clinic_id has unexpected type: %. Manual review needed.', current_type;
    END IF;
  ELSE
    RAISE NOTICE 'clinic_id column does not exist in ServicePricing - this is normal';
  END IF;
END $$;

-- STEP 2: Verify ServicePricing table schema
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ServicePricing'
ORDER BY ordinal_position;
