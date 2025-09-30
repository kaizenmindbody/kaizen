-- Add media columns to Users table
-- This migration adds video and images columns for practitioner media management

-- Add video column to store the URL of the practitioner's video
ALTER TABLE users ADD COLUMN video TEXT;

-- Add images column to store JSON array of image URLs
ALTER TABLE users ADD COLUMN images TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN users.video IS 'URL to practitioner spotlight video (max 1)';
COMMENT ON COLUMN users.images IS 'JSON array of practitioner image URLs with ordering';

-- Update the updated_at trigger to ensure it still works with new columns
-- (No changes needed as the trigger works with any column updates)

-- Optional: Add indexes for better performance if needed
-- CREATE INDEX idx_users_video ON users(video) WHERE video IS NOT NULL;
-- CREATE INDEX idx_users_images ON users USING gin(images) WHERE images IS NOT NULL;