-- Create EventHosts table
-- Note: Adjust the id and user_id types to match your actual Users table structure
-- If your Users.id is BIGINT, change both to BIGINT
-- If your Users.id is UUID, keep as UUID

CREATE TABLE IF NOT EXISTS "EventHosts" (
  id UUID PRIMARY KEY,
  user_id UUID,
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

  -- Add foreign key constraint separately to handle different table structures
  CONSTRAINT fk_eventhost_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_eventhosts_updated_at
  BEFORE UPDATE ON "EventHosts"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "EventHosts" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own event host profile"
  ON "EventHosts" FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own event host profile"
  ON "EventHosts" FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own event host profile"
  ON "EventHosts" FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view event host profiles"
  ON "EventHosts" FOR SELECT
  USING (true);
