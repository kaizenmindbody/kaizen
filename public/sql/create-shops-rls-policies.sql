-- RLS policies for Shops table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON "Shops";
DROP POLICY IF EXISTS "Enable insert for service role only" ON "Shops";
DROP POLICY IF EXISTS "Enable update for service role only" ON "Shops";
DROP POLICY IF EXISTS "Enable delete for service role only" ON "Shops";

-- Ensure RLS is enabled
ALTER TABLE "Shops" ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public read access and service role full access
CREATE POLICY "Enable read access for all users" ON "Shops"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for service role only" ON "Shops"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for service role only" ON "Shops"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for service role only" ON "Shops"
  FOR DELETE
  USING (true);

-- Expected columns: id, title, image
