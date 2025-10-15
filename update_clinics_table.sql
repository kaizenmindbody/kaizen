-- Migration: Add clinic_video and clinic_images columns to Clinics table
-- This migration adds support for uploading and storing clinic videos and images

-- Add clinic_video column (stores single video URL)
ALTER TABLE "Clinics"
ADD COLUMN IF NOT EXISTS "clinic_video" TEXT;

-- Add clinic_images column (stores array of image URLs)
ALTER TABLE "Clinics"
ADD COLUMN IF NOT EXISTS "clinic_images" TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN "Clinics"."clinic_video" IS 'URL of the clinic video stored in Supabase Storage';
COMMENT ON COLUMN "Clinics"."clinic_images" IS 'Array of URLs for clinic images stored in Supabase Storage';
