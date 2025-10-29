-- ============================================
-- STEP 1: CHECK YOUR USERS TABLE STRUCTURE
-- ============================================
-- Run this query first to check what type your Users.id column is:

SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'Users'
  AND column_name = 'id';

-- If data_type is 'bigint' or 'integer', use OPTION A below
-- If data_type is 'uuid', use OPTION B below

-- ============================================
-- OPTION A: For BIGINT/INTEGER Users Table
-- ============================================

-- DROP TABLE IF EXISTS "EventHosts"; -- Uncomment if recreating

CREATE TABLE IF NOT EXISTS "EventHosts" (
  id TEXT PRIMARY KEY,  -- Store auth.uid() as TEXT
  user_id BIGINT,  -- Reference to Users table
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

-- Add foreign key constraint (only if Users table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Users') THEN
    ALTER TABLE "EventHosts"
    DROP CONSTRAINT IF EXISTS fk_eventhost_user_id;

    ALTER TABLE "EventHosts"
    ADD CONSTRAINT fk_eventhost_user_id
    FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- OPTION B: For UUID Users Table
-- ============================================

/*
-- DROP TABLE IF EXISTS "EventHosts"; -- Uncomment if recreating

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Users') THEN
    ALTER TABLE "EventHosts"
    DROP CONSTRAINT IF EXISTS fk_eventhost_user_id;

    ALTER TABLE "EventHosts"
    ADD CONSTRAINT fk_eventhost_user_id
    FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE tablename = 'users' AND schemaname = 'auth') THEN
    ALTER TABLE "EventHosts"
    DROP CONSTRAINT IF EXISTS fk_eventhost_auth_user;

    ALTER TABLE "EventHosts"
    ADD CONSTRAINT fk_eventhost_auth_user
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
*/

-- ============================================
-- COMMON: Trigger and RLS (for both options)
-- ============================================

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_eventhosts_updated_at ON "EventHosts";

-- Create trigger
CREATE TRIGGER update_eventhosts_updated_at
  BEFORE UPDATE ON "EventHosts"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "EventHosts" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own event host profile" ON "EventHosts";
DROP POLICY IF EXISTS "Users can insert their own event host profile" ON "EventHosts";
DROP POLICY IF EXISTS "Users can update their own event host profile" ON "EventHosts";
DROP POLICY IF EXISTS "Anyone can view event host profiles" ON "EventHosts";

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
CREATE INDEX IF NOT EXISTS idx_eventhosts_user_id ON "EventHosts"(user_id);
CREATE INDEX IF NOT EXISTS idx_eventhosts_id ON "EventHosts"(id);

-- ============================================
-- VERIFY THE TABLE WAS CREATED
-- ============================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'EventHosts'
ORDER BY ordinal_position;
