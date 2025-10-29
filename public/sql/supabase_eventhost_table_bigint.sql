-- Create EventHosts table (BIGINT VERSION)
-- Use this version if your Users table uses BIGINT for id

CREATE TABLE IF NOT EXISTS "EventHosts" (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  business_name TEXT,
  website TEXT,
  bio TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  linkedin TEXT,
  host_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Add foreign key constraint if Users table exists
  CONSTRAINT fk_eventhost_user_id FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE
);

-- Create updated_at trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for EventHosts
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

-- Create policies
CREATE POLICY "Users can view their own event host profile"
  ON "EventHosts" FOR SELECT
  USING (user_id::BIGINT = (SELECT id FROM "Users" WHERE id::TEXT = auth.uid()::TEXT));

CREATE POLICY "Users can insert their own event host profile"
  ON "EventHosts" FOR INSERT
  WITH CHECK (user_id::BIGINT = (SELECT id FROM "Users" WHERE id::TEXT = auth.uid()::TEXT));

CREATE POLICY "Users can update their own event host profile"
  ON "EventHosts" FOR UPDATE
  USING (user_id::BIGINT = (SELECT id FROM "Users" WHERE id::TEXT = auth.uid()::TEXT));

CREATE POLICY "Anyone can view event host profiles"
  ON "EventHosts" FOR SELECT
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_eventhosts_user_id ON "EventHosts"(user_id);
