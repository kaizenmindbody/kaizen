-- Create UserMedia table if it doesn't exist
CREATE TABLE IF NOT EXISTS "UserMedia" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('image', 'video')),
  mime_type TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usermedia_user_id ON "UserMedia"(user_id);
CREATE INDEX IF NOT EXISTS idx_usermedia_file_type ON "UserMedia"(file_type);
CREATE INDEX IF NOT EXISTS idx_usermedia_display_order ON "UserMedia"(display_order);

-- Enable Row Level Security
ALTER TABLE "UserMedia" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own media" ON "UserMedia";
DROP POLICY IF EXISTS "Users can insert their own media" ON "UserMedia";
DROP POLICY IF EXISTS "Users can update their own media" ON "UserMedia";
DROP POLICY IF EXISTS "Users can delete their own media" ON "UserMedia";
DROP POLICY IF EXISTS "Allow public read access to all media" ON "UserMedia";

-- Allow users to view their own media
CREATE POLICY "Users can view their own media" ON "UserMedia"
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own media
CREATE POLICY "Users can insert their own media" ON "UserMedia"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own media
CREATE POLICY "Users can update their own media" ON "UserMedia"
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media" ON "UserMedia"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public read access to all media (for profile viewing)
CREATE POLICY "Allow public read access to all media" ON "UserMedia"
  FOR SELECT
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_usermedia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_usermedia_timestamp ON "UserMedia";
CREATE TRIGGER update_usermedia_timestamp
  BEFORE UPDATE ON "UserMedia"
  FOR EACH ROW
  EXECUTE FUNCTION update_usermedia_updated_at();
