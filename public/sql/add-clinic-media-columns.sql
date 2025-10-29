-- Add media columns to Clinics table
-- This migration adds clinic_images (array) and clinic_video (text) columns

-- Add clinic_video column for storing video URL
ALTER TABLE "Clinics"
ADD COLUMN IF NOT EXISTS clinic_video TEXT;

-- Add clinic_images column for storing array of image URLs
ALTER TABLE "Clinics"
ADD COLUMN IF NOT EXISTS clinic_images TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN "Clinics".clinic_video IS 'URL to clinic video in storage (kaizen/clinic_videos/)';
COMMENT ON COLUMN "Clinics".clinic_images IS 'Array of URLs to clinic images in storage (kaizen/clinic_images/)';
