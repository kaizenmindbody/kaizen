-- =====================================================
-- CORRECT CLINICMEMBERS TABLE SCHEMA
-- =====================================================
-- ClinicMembers table to store practitioners in a clinic
-- id: UUID primary key
-- clinic_id: UUID of clinic owner (practitioner who created the clinic)
-- practitioner_id: UUID for each member (randomly generated)
-- Stores all practitioner details directly

DROP TABLE IF EXISTS "ClinicMembers" CASCADE;

CREATE TABLE IF NOT EXISTS "ClinicMembers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL, -- FK to practitioner_id of clinic owner (from Users table)
  practitioner_id UUID NOT NULL DEFAULT gen_random_uuid(), -- Unique ID for each member

  -- Practitioner details stored directly
  firstname TEXT,
  lastname TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  degree TEXT,
  website TEXT,
  address TEXT,
  avatar TEXT, -- URL to avatar image

  -- Member metadata
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_clinic_practitioner UNIQUE(clinic_id, email), -- One email per clinic
  CONSTRAINT unique_practitioner_id UNIQUE(practitioner_id) -- Each practitioner ID is unique
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON "ClinicMembers"(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_practitioner_id ON "ClinicMembers"(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_email ON "ClinicMembers"(clinic_id, email);

-- Enable Row Level Security
ALTER TABLE "ClinicMembers" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Clinic owners can view members of their clinic
CREATE POLICY "Clinic owners can view clinic members" ON "ClinicMembers"
  FOR SELECT USING (clinic_id = auth.uid());

-- Clinic owners can insert members to their clinic
CREATE POLICY "Clinic owners can insert clinic members" ON "ClinicMembers"
  FOR INSERT WITH CHECK (clinic_id = auth.uid());

-- Clinic owners can update members of their clinic
CREATE POLICY "Clinic owners can update clinic members" ON "ClinicMembers"
  FOR UPDATE USING (clinic_id = auth.uid());

-- Clinic owners can delete members from their clinic
CREATE POLICY "Clinic owners can delete clinic members" ON "ClinicMembers"
  FOR DELETE USING (clinic_id = auth.uid());

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_clinic_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clinic_members_updated_at ON "ClinicMembers";
CREATE TRIGGER update_clinic_members_updated_at
    BEFORE UPDATE ON "ClinicMembers"
    FOR EACH ROW
    EXECUTE FUNCTION update_clinic_members_updated_at();

-- Add comments for documentation
COMMENT ON TABLE "ClinicMembers" IS 'Stores practitioners who are members of a clinic';
COMMENT ON COLUMN "ClinicMembers".id IS 'Unique member record identifier';
COMMENT ON COLUMN "ClinicMembers".clinic_id IS 'UUID of the clinic owner (practitioner who created the clinic)';
COMMENT ON COLUMN "ClinicMembers".practitioner_id IS 'Unique ID for this practitioner member';
COMMENT ON COLUMN "ClinicMembers".firstname IS 'First name of the practitioner';
COMMENT ON COLUMN "ClinicMembers".lastname IS 'Last name of the practitioner';
COMMENT ON COLUMN "ClinicMembers".email IS 'Email of the practitioner';
COMMENT ON COLUMN "ClinicMembers".phone IS 'Phone number of the practitioner';
COMMENT ON COLUMN "ClinicMembers".degree IS 'Professional degree/credentials';
COMMENT ON COLUMN "ClinicMembers".website IS 'Website URL';
COMMENT ON COLUMN "ClinicMembers".address IS 'Physical address';
COMMENT ON COLUMN "ClinicMembers".avatar IS 'URL to avatar image';
COMMENT ON COLUMN "ClinicMembers".role IS 'Role in the clinic: owner, member, or admin';

COMMIT;
