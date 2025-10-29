-- Fix EventHosts table - Drop and recreate with correct types
-- Both id and user_id should be TEXT since Users.id is TEXT/UUID

-- Drop existing table if it exists
DROP TABLE IF EXISTS "EventHosts";

-- Create EventHosts table with correct types
CREATE TABLE "EventHosts" (
  id TEXT PRIMARY KEY,              -- Auth user ID (UUID as TEXT)
  user_id TEXT,                     -- Users table ID (also UUID as TEXT)
  business_name TEXT,
  website TEXT,
  bio TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  linkedin TEXT,
  host_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to Users table
ALTER TABLE "EventHosts"
ADD CONSTRAINT fk_eventhost_user_id
FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE;

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_eventhosts_updated_at
  BEFORE UPDATE ON "EventHosts"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "EventHosts" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own event host profile"
  ON "EventHosts" FOR SELECT
  USING (id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own event host profile"
  ON "EventHosts" FOR INSERT
  WITH CHECK (id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own event host profile"
  ON "EventHosts" FOR UPDATE
  USING (id = auth.uid()::TEXT);

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
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'EventHosts'
ORDER BY ordinal_position;
