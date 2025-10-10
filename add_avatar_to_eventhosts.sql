-- Add avatar column to EventHosts table if it doesn't exist
-- Run this if you need to add the column

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'EventHosts' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE "EventHosts" ADD COLUMN avatar TEXT;
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'EventHosts'
  AND column_name IN ('avatar', 'host_image')
ORDER BY column_name;
