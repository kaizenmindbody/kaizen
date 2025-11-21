-- =====================================================
-- FIX EVENTS TABLE RLS POLICIES
-- Allow public read access to events
-- =====================================================

-- First, check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'Events';

-- Enable RLS on Events table if not already enabled
ALTER TABLE "Events" ENABLE ROW LEVEL SECURITY;

-- Drop existing public read policy if it exists
DROP POLICY IF EXISTS "Public can view all events" ON "Events";
DROP POLICY IF EXISTS "Allow public read access to events" ON "Events";

-- Create policy to allow public read access to all events
CREATE POLICY "Public can view all events" ON "Events"
  FOR SELECT
  USING (true);

-- Optionally, you can also keep policies for event hosts to manage their events
DROP POLICY IF EXISTS "Event hosts can manage their own events" ON "Events";

CREATE POLICY "Event hosts can manage their own events" ON "Events"
  FOR ALL
  USING (auth.uid()::text = host_id::text)
  WITH CHECK (auth.uid()::text = host_id::text);

-- Verify the policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'Events'
ORDER BY policyname;

COMMIT;
