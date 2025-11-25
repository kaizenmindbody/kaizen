-- Migrate specialty column from TEXT to TEXT[] to support multiple specialties
-- This allows practitioners to have multiple specialties, similar to degrees and practitioner types

DO $$
BEGIN
  -- Check if column exists and is not already TEXT[]
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Users' AND column_name = 'specialty'
  ) THEN
    -- First, convert existing TEXT values to TEXT[] format
    -- Handle comma-separated strings and single values
    UPDATE "Users"
    SET specialty = CASE
      WHEN specialty IS NULL OR specialty = '' THEN NULL
      WHEN specialty LIKE '%,%' THEN 
        -- Convert comma-separated string to array format
        ARRAY(SELECT TRIM(unnest(string_to_array(specialty, ','))))
      ELSE 
        -- Single value becomes array with one element
        ARRAY[TRIM(specialty)]
    END::TEXT[]
    WHERE specialty IS NOT NULL AND specialty != '';

    -- Alter column type to TEXT[]
    ALTER TABLE "Users" 
    ALTER COLUMN specialty TYPE TEXT[] 
    USING specialty::TEXT[];

    -- Add comment to document the change
    COMMENT ON COLUMN "Users".specialty IS 'Array of specialty titles. Can contain multiple specialties for a practitioner.';
  ELSE
    -- If column doesn't exist, create it as TEXT[]
    ALTER TABLE "Users" ADD COLUMN specialty TEXT[] DEFAULT NULL;
    COMMENT ON COLUMN "Users".specialty IS 'Array of specialty titles. Can contain multiple specialties for a practitioner.';
  END IF;
END $$;

-- Verify the changes
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Users' AND column_name = 'specialty';

