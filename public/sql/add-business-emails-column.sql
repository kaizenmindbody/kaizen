-- Add business_emails column to Users table
-- This allows practitioners to have multiple business email addresses
-- If no business emails are set, the login email will be used as fallback

DO $$
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Users' AND column_name = 'business_emails'
  ) THEN
    -- Add business_emails as TEXT array (can store multiple email addresses)
    ALTER TABLE "Users" ADD COLUMN business_emails TEXT[] DEFAULT NULL;
    
    -- Add comment to document the column
    COMMENT ON COLUMN "Users".business_emails IS 'Array of business email addresses for practitioners. If empty or null, the login email will be used.';
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
WHERE table_name = 'Users' AND column_name = 'business_emails';

