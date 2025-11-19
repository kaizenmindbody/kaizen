-- =====================================================
-- ADD INVITATION TRACKING TO CLINICMEMBERS TABLE
-- =====================================================
-- Adds fields to track invitation status for CSV-uploaded members

-- Add invitation tracking columns
ALTER TABLE "ClinicMembers"
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'registered')),
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_id UUID; -- Links to auth.users after signup

-- Add index for invitation token lookups
CREATE INDEX IF NOT EXISTS idx_clinic_members_invitation_token ON "ClinicMembers"(invitation_token);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON "ClinicMembers"(user_id);

-- Add comments for documentation
COMMENT ON COLUMN "ClinicMembers".invitation_token IS 'Unique token for invitation link (used before user registers)';
COMMENT ON COLUMN "ClinicMembers".invitation_status IS 'Status of invitation: pending (invited), accepted (clicked link), registered (completed signup)';
COMMENT ON COLUMN "ClinicMembers".invitation_sent_at IS 'Timestamp when invitation was sent';
COMMENT ON COLUMN "ClinicMembers".invitation_expires_at IS 'Timestamp when invitation expires';
COMMENT ON COLUMN "ClinicMembers".user_id IS 'UUID of the authenticated user (after they complete signup)';

COMMIT;
