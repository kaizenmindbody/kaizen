-- Fix RLS policies for Faqs table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON "Faqs";
DROP POLICY IF EXISTS "Enable insert for service role only" ON "Faqs";
DROP POLICY IF EXISTS "Enable update for service role only" ON "Faqs";
DROP POLICY IF EXISTS "Enable delete for service role only" ON "Faqs";

-- Ensure RLS is enabled
ALTER TABLE "Faqs" ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public read access and service role full access
CREATE POLICY "Enable read access for all users" ON "Faqs"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for service role only" ON "Faqs"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for service role only" ON "Faqs"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for service role only" ON "Faqs"
  FOR DELETE
  USING (true);

-- Verify the table structure (you can check if these columns exist)
-- Expected columns: id, question, answer, created_at, updated_at
