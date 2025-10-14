-- Service Pricing table for managing practitioner service pricing configurations
CREATE TABLE ServicePricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES Services(id) ON DELETE SET NULL, -- Can be null if service is deleted
  service_name TEXT NOT NULL, -- Store service name for historical reference

  -- Pricing and duration for first-time patients
  first_time_price TEXT, -- Text to support sliding scale like "$85 to $100"
  first_time_duration INTEGER, -- Duration in minutes

  -- Pricing and duration for returning patients
  returning_price TEXT, -- Text to support sliding scale
  returning_duration INTEGER, -- Duration in minutes

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

-- Enable Row Level Security
ALTER TABLE ServicePricing ENABLE ROW LEVEL SECURITY;

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

-- Trigger to automatically update updated_at
CREATE TRIGGER update_service_pricing_updated_at
    BEFORE UPDATE ON ServicePricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_service_pricing_practitioner_id ON ServicePricing(practitioner_id);
CREATE INDEX idx_service_pricing_service_id ON ServicePricing(service_id);
CREATE INDEX idx_service_pricing_category ON ServicePricing(service_category);
CREATE INDEX idx_service_pricing_clinic_specific ON ServicePricing(practitioner_id, is_clinic_specific);
