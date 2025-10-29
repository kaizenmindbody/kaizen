-- EventHosts table with UUID types (matching Users table)
-- This is the CORRECT version based on your database structure

-- Drop existing table if it exists
DROP TABLE IF EXISTS "EventHosts";

-- Create EventHosts table with UUID types
CREATE TABLE "EventHosts" (
  id UUID PRIMARY KEY,              -- Auth user ID (UUID)
  user_id UUID,                     -- Users table ID (UUID)
  business_name TEXT,
  website TEXT,
  bio TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  linkedin TEXT,
  avatar TEXT,                      -- Avatar/profile image URL
  host_image TEXT,                  -- Alternative host image URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key constraint to Users table
  CONSTRAINT fk_eventhost_user_id FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE,

  -- Foreign key constraint to auth.users table
  CONSTRAINT fk_eventhost_auth_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_eventhosts_updated_at ON "EventHosts";
CREATE TRIGGER update_eventhosts_updated_at
  BEFORE UPDATE ON "EventHosts"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "EventHosts" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own event host profile" ON "EventHosts";
DROP POLICY IF EXISTS "Users can insert their own event host profile" ON "EventHosts";
DROP POLICY IF EXISTS "Users can update their own event host profile" ON "EventHosts";
DROP POLICY IF EXISTS "Anyone can view event host profiles" ON "EventHosts";

-- Create RLS policies
CREATE POLICY "Users can view their own event host profile"
  ON "EventHosts" FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own event host profile"
  ON "EventHosts" FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own event host profile"
  ON "EventHosts" FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Anyone can view event host profiles"
  ON "EventHosts" FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_eventhosts_user_id ON "EventHosts"(user_id);
CREATE INDEX idx_eventhosts_id ON "EventHosts"(id);

-- Verify table structure
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'EventHosts'
ORDER BY ordinal_position;
