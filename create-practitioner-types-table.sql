-- Create PractitionerTypes table
CREATE TABLE IF NOT EXISTS "PractitionerTypes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "PractitionerTypes" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read practitioner types
CREATE POLICY "Anyone can view practitioner types" ON "PractitionerTypes"
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert practitioner types
CREATE POLICY "Authenticated users can insert practitioner types" ON "PractitionerTypes"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can update practitioner types
CREATE POLICY "Authenticated users can update practitioner types" ON "PractitionerTypes"
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can delete practitioner types
CREATE POLICY "Authenticated users can delete practitioner types" ON "PractitionerTypes"
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_practitioner_types_updated_at
    BEFORE UPDATE ON "PractitionerTypes"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
