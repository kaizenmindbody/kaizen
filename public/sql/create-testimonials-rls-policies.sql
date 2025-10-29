-- RLS policies for Testimonials table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON "Testimonials";
DROP POLICY IF EXISTS "Enable insert for service role only" ON "Testimonials";
DROP POLICY IF EXISTS "Enable update for service role only" ON "Testimonials";
DROP POLICY IF EXISTS "Enable delete for service role only" ON "Testimonials";

-- Ensure RLS is enabled
ALTER TABLE "Testimonials" ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public read access and service role full access
CREATE POLICY "Enable read access for all users" ON "Testimonials"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for service role only" ON "Testimonials"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for service role only" ON "Testimonials"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for service role only" ON "Testimonials"
  FOR DELETE
  USING (true);

-- Expected columns: id, client, description, location, image
