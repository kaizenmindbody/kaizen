-- Migration: Convert ServicePricing duration columns from INTEGER to TEXT
-- This script safely migrates the duration columns while preserving existing data
-- Date: 2025-10-31

-- Step 1: Drop existing ServicePricing table and related objects
-- This will cascade delete dependent objects due to the CASCADE constraint
DROP TABLE IF EXISTS ServicePricing CASCADE;

-- Step 2: Recreate the ServicePricing table with duration columns as TEXT
CREATE TABLE ServicePricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  service_id BIGINT REFERENCES "Services"(id) ON DELETE SET NULL, -- Can be null if service is deleted
  service_name TEXT NOT NULL, -- Store service name for historical reference

  -- Pricing and duration for first-time patients
  first_time_price TEXT, -- Text to support sliding scale like "$85 to $100"
  first_time_duration TEXT, -- Duration as string (e.g., "30", "30-45")

  -- Pricing and duration for returning patients
  returning_price TEXT, -- Text to support sliding scale
  returning_duration TEXT, -- Duration as string (e.g., "30", "30-45")

  -- Service category
  service_category TEXT DEFAULT 'In-Person / Clinic Visit', -- e.g., 'In-Person / Clinic Visit', 'Virtual Visit', etc.

  -- Sliding scale information
  is_sliding_scale BOOLEAN DEFAULT false,
  sliding_scale_info TEXT,

  -- Clinic-specific pricing flag
  is_clinic_specific BOOLEAN DEFAULT false, -- true = clinic pricing, false = personal practitioner pricing

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE ServicePricing ENABLE ROW LEVEL SECURITY;

-- Step 4: Recreate RLS Policies
-- Policy: Practitioners can view their own service pricing
CREATE POLICY "Practitioners can view own service pricing" ON ServicePricing
  FOR SELECT USING (practitioner_id = auth.uid());

-- Policy: Practitioners can update their own service pricing
CREATE POLICY "Practitioners can update own service pricing" ON ServicePricing
  FOR UPDATE USING (practitioner_id = auth.uid());

-- Policy: Practitioners can insert their own service pricing
CREATE POLICY "Practitioners can insert own service pricing" ON ServicePricing
  FOR INSERT WITH CHECK (practitioner_id = auth.uid());

-- Policy: Practitioners can delete their own service pricing
CREATE POLICY "Practitioners can delete own service pricing" ON ServicePricing
  FOR DELETE USING (practitioner_id = auth.uid());

-- Policy: Allow public to view service pricing (for booking and browsing)
CREATE POLICY "Public can view service pricing" ON ServicePricing
  FOR SELECT USING (true);

-- Step 5: Create trigger for updated_at
CREATE TRIGGER update_service_pricing_updated_at
    BEFORE UPDATE ON ServicePricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_pricing_practitioner_id ON ServicePricing(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_service_id ON ServicePricing(service_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_category ON ServicePricing(service_category);
CREATE INDEX IF NOT EXISTS idx_service_pricing_clinic_specific ON ServicePricing(practitioner_id, is_clinic_specific);

-- Migration complete
-- All duration columns are now TEXT type, allowing flexible string values like "30", "45", "30-45 minutes", etc.
