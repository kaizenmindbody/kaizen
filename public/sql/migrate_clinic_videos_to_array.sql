-- Migration: Update clinic_video to clinic_videos (array)
-- This migration changes the single video field to support multiple videos

-- Step 1: Add the new clinic_videos column (array)
ALTER TABLE "Clinics"
ADD COLUMN IF NOT EXISTS "clinic_videos" TEXT[];

-- Step 2: Migrate existing data from clinic_video to clinic_videos
-- If a clinic has a video, convert it to an array with one element
UPDATE "Clinics"
SET "clinic_videos" = ARRAY[clinic_video]::TEXT[]
WHERE clinic_video IS NOT NULL AND clinic_video != '';

-- Step 3: Drop the old clinic_video column
-- NOTE: Uncomment the line below after verifying the migration worked correctly
-- ALTER TABLE "Clinics" DROP COLUMN IF EXISTS "clinic_video";

-- Add comment for documentation
COMMENT ON COLUMN "Clinics"."clinic_videos" IS 'Array of URLs for clinic videos stored in Supabase Storage';

-- Verify the migration
SELECT id, clinic_name, clinic_videos
FROM "Clinics"
WHERE clinic_videos IS NOT NULL
LIMIT 10;
