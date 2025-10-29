-- Create tables for clinic practitioner invitations and memberships

-- Table for clinic invitations
CREATE TABLE IF NOT EXISTS "ClinicInvitations" (
  id BIGSERIAL PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES "Clinics"(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,

  -- Ensure unique invitation per clinic and invitee
  CONSTRAINT unique_clinic_invitee UNIQUE(clinic_id, invitee_id)
);

-- Table for clinic members (accepted practitioners)
CREATE TABLE IF NOT EXISTS "ClinicMembers" (
  id BIGSERIAL PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES "Clinics"(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique membership per clinic and practitioner
  CONSTRAINT unique_clinic_member UNIQUE(clinic_id, practitioner_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clinic_invitations_clinic_id ON "ClinicInvitations"(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_invitations_invitee_id ON "ClinicInvitations"(invitee_id);
CREATE INDEX IF NOT EXISTS idx_clinic_invitations_status ON "ClinicInvitations"(status);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON "ClinicMembers"(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_practitioner_id ON "ClinicMembers"(practitioner_id);

-- Enable Row Level Security
ALTER TABLE "ClinicInvitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicMembers" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ClinicInvitations

-- Clinic owners can view invitations for their clinic
CREATE POLICY "Clinic owners can view own invitations" ON "ClinicInvitations"
  FOR SELECT USING (
    inviter_id = auth.uid() OR
    invitee_id = auth.uid()
  );

-- Clinic owners can create invitations
CREATE POLICY "Clinic owners can create invitations" ON "ClinicInvitations"
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

-- Invitees can update invitation status (accept/decline)
CREATE POLICY "Invitees can update invitation status" ON "ClinicInvitations"
  FOR UPDATE USING (invitee_id = auth.uid());

-- Clinic owners can delete their invitations
CREATE POLICY "Clinic owners can delete invitations" ON "ClinicInvitations"
  FOR DELETE USING (inviter_id = auth.uid());

-- RLS Policies for ClinicMembers

-- Anyone can view clinic members
CREATE POLICY "Anyone can view clinic members" ON "ClinicMembers"
  FOR SELECT USING (true);

-- Only system can create clinic members (via trigger or function)
CREATE POLICY "System can create clinic members" ON "ClinicMembers"
  FOR INSERT WITH CHECK (true);

-- Clinic owners can remove members
CREATE POLICY "Clinic owners can remove members" ON "ClinicMembers"
  FOR DELETE USING (
    clinic_id IN (
      SELECT id FROM "Clinics" WHERE practitioner_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE "ClinicInvitations" IS 'Stores invitations sent by clinic owners to practitioners';
COMMENT ON TABLE "ClinicMembers" IS 'Stores practitioners who are members of a clinic';

COMMENT ON COLUMN "ClinicInvitations".status IS 'Status of invitation: pending, accepted, or declined';
COMMENT ON COLUMN "ClinicInvitations".inviter_id IS 'ID of the clinic owner who sent the invitation';
COMMENT ON COLUMN "ClinicInvitations".invitee_id IS 'ID of the practitioner who received the invitation';

COMMENT ON COLUMN "ClinicMembers".role IS 'Role of the member in the clinic: owner, member, or admin';
COMMENT ON COLUMN "ClinicMembers".practitioner_id IS 'ID of the practitioner who is a member';

-- Function to automatically add clinic owner as a member when clinic is created
CREATE OR REPLACE FUNCTION add_clinic_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "ClinicMembers" (clinic_id, practitioner_id, role)
  VALUES (NEW.id, NEW.practitioner_id, 'owner')
  ON CONFLICT (clinic_id, practitioner_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-add clinic owner as member
DROP TRIGGER IF EXISTS trigger_add_clinic_owner ON "Clinics";
CREATE TRIGGER trigger_add_clinic_owner
  AFTER INSERT ON "Clinics"
  FOR EACH ROW
  EXECUTE FUNCTION add_clinic_owner_as_member();

-- Function to auto-create clinic member when invitation is accepted
CREATE OR REPLACE FUNCTION create_member_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create member if status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO "ClinicMembers" (clinic_id, practitioner_id, role)
    VALUES (NEW.clinic_id, NEW.invitee_id, 'member')
    ON CONFLICT (clinic_id, practitioner_id) DO NOTHING;

    -- Update responded_at timestamp
    NEW.responded_at = NOW();
  END IF;

  -- Update responded_at for declined invitations too
  IF NEW.status = 'declined' AND OLD.status != 'declined' THEN
    NEW.responded_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create member on acceptance
DROP TRIGGER IF EXISTS trigger_create_member_on_accept ON "ClinicInvitations";
CREATE TRIGGER trigger_create_member_on_accept
  BEFORE UPDATE ON "ClinicInvitations"
  FOR EACH ROW
  EXECUTE FUNCTION create_member_on_accept();
