-- Migration script to add type column to existing Services table
-- This script handles the case where the Services table already exists without the type column

-- First, check if the type column exists, and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Services'
        AND column_name = 'type'
    ) THEN
        -- Add the type column with a default value
        ALTER TABLE Services
        ADD COLUMN type TEXT NOT NULL DEFAULT 'real'
        CHECK (type IN ('real', 'virtual'));

        RAISE NOTICE 'Type column added to Services table with default value "real"';
    ELSE
        RAISE NOTICE 'Type column already exists in Services table';
    END IF;
END $$;

-- Update any NULL values to 'real' (in case column exists but has NULL values)
UPDATE Services
SET type = 'real'
WHERE type IS NULL;

-- Create index for better performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_services_type ON Services(type);

-- Verify the migration
SELECT
    id,
    title,
    type,
    created_at
FROM Services
ORDER BY created_at DESC
LIMIT 10;
