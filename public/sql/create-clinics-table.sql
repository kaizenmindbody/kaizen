-- =====================================================
-- CLINICS TABLE SCHEMA
-- =====================================================
-- This schema creates a separate Clinics table for storing
-- clinic/business profiles for practitioners
-- =====================================================

-- Create Clinics table (separate from Users)
CREATE TABLE IF NOT EXISTS "Clinics" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Clinic Information (matches UpdateClinicProfile fields exactly)
  clinic_name TEXT NOT NULL,
  clinic_website TEXT,
  clinic_phone TEXT,
  clinic_email TEXT,
  clinic_address TEXT,
  clinic_logo TEXT, -- URL to logo in storage (kaizen/clinic_logos/)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one clinic per practitioner
  CONSTRAINT clinics_practitioner_id_unique UNIQUE(practitioner_id)
);

-- Enable Row Level Security
ALTER TABLE "Clinics" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Practitioners can view their own clinic
CREATE POLICY "Practitioners can view own clinic" ON "Clinics"
  FOR SELECT USING (practitioner_id = auth.uid());

-- Practitioners can insert their own clinic
CREATE POLICY "Practitioners can insert own clinic" ON "Clinics"
  FOR INSERT WITH CHECK (practitioner_id = auth.uid());

-- Practitioners can update their own clinic
CREATE POLICY "Practitioners can update own clinic" ON "Clinics"
  FOR UPDATE USING (practitioner_id = auth.uid());

-- Practitioners can delete their own clinic
CREATE POLICY "Practitioners can delete own clinic" ON "Clinics"
  FOR DELETE USING (practitioner_id = auth.uid());

-- Public can view all clinics (for directory/search)
CREATE POLICY "Public can view clinics" ON "Clinics"
  FOR SELECT USING (true);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON "Clinics"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_clinics_practitioner_id ON "Clinics"(practitioner_id);
CREATE INDEX idx_clinics_name ON "Clinics"(clinic_name);
CREATE INDEX idx_clinics_address ON "Clinics" USING gin(to_tsvector('english', clinic_address));
CREATE INDEX idx_clinics_created_at ON "Clinics"(created_at);

-- Comments for documentation
COMMENT ON TABLE "Clinics" IS 'Stores clinic/business profiles for practitioners';
COMMENT ON COLUMN "Clinics".id IS 'Unique clinic identifier';
COMMENT ON COLUMN "Clinics".practitioner_id IS 'Reference to the practitioner who owns this clinic';
COMMENT ON COLUMN "Clinics".clinic_name IS 'Clinic or business name';
COMMENT ON COLUMN "Clinics".clinic_website IS 'Clinic website URL';
COMMENT ON COLUMN "Clinics".clinic_phone IS 'Business phone number';
COMMENT ON COLUMN "Clinics".clinic_email IS 'Business email address';
COMMENT ON COLUMN "Clinics".clinic_address IS 'Physical address with PlaceKit autocomplete';
COMMENT ON COLUMN "Clinics".clinic_logo IS 'URL to clinic logo stored in Supabase storage bucket (kaizen/clinic_logos/)';
COMMENT ON COLUMN "Clinics".created_at IS 'When the clinic profile was created';
COMMENT ON COLUMN "Clinics".updated_at IS 'When the clinic profile was last updated (auto-updated by trigger)';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this query to verify the table was created correctly
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Clinics'
ORDER BY ordinal_position;
