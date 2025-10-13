-- =====================================================
-- MIGRATION: Fix Availabilities table constraint
-- =====================================================
-- This migration ensures the unique constraint on
-- (practitioner_id, date) has a proper name
-- =====================================================

-- First, check if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'availabilities') THEN
        -- Drop the existing unnamed constraint if it exists
        -- PostgreSQL auto-generates names like: availabilities_practitioner_id_date_key
        ALTER TABLE "Availabilities" DROP CONSTRAINT IF EXISTS "availabilities_practitioner_id_date_key";
        ALTER TABLE "Availabilities" DROP CONSTRAINT IF EXISTS "Availabilities_practitioner_id_date_key";

        -- Add the constraint with a proper name
        ALTER TABLE "Availabilities" ADD CONSTRAINT availabilities_practitioner_date_unique
            UNIQUE (practitioner_id, date);

        RAISE NOTICE 'Constraint availabilities_practitioner_date_unique has been added successfully';
    ELSE
        RAISE NOTICE 'Availabilities table does not exist yet. Please run the main schema first.';
    END IF;
END $$;

-- Verify the constraint was created
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'Availabilities'::regclass
AND contype = 'u';
