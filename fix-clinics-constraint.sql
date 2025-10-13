-- =====================================================
-- MIGRATION: Fix Clinics table constraint name
-- =====================================================
-- This migration adds a proper name to the unique constraint
-- on practitioner_id in the Clinics table
-- =====================================================

-- First, drop the existing unnamed unique constraint
ALTER TABLE "Clinics" DROP CONSTRAINT IF EXISTS "Clinics_practitioner_id_key";

-- Add the constraint with a proper name
ALTER TABLE "Clinics" ADD CONSTRAINT clinics_practitioner_id_unique UNIQUE (practitioner_id);

-- Verify the constraint was created
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'Clinics'::regclass 
AND contype = 'u';
