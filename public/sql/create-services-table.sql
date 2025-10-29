-- Create function to automatically update updated_at column (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Services table for managing available services (like Specialties)
CREATE TABLE IF NOT EXISTS Services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- Service title (e.g., 'Acupuncture', 'Consultation', 'Massage Therapy')
  type TEXT NOT NULL DEFAULT 'real' CHECK (type IN ('real', 'virtual')), -- Service type: 'real' for in-person visits, 'virtual' for online visits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE Services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view services" ON Services;
DROP POLICY IF EXISTS "Authenticated users can insert services" ON Services;
DROP POLICY IF EXISTS "Authenticated users can update services" ON Services;
DROP POLICY IF EXISTS "Authenticated users can delete services" ON Services;

-- Policy: Everyone can view services
CREATE POLICY "Public can view services" ON Services
  FOR SELECT USING (true);

-- Policy: Only authenticated users can insert services
CREATE POLICY "Authenticated users can insert services" ON Services
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can update services
CREATE POLICY "Authenticated users can update services" ON Services
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can delete services
CREATE POLICY "Authenticated users can delete services" ON Services
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_services_updated_at ON Services;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON Services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_services_title ON Services(title);
CREATE INDEX IF NOT EXISTS idx_services_type ON Services(type);
