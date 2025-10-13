-- Users table with all required columns
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  user_type TEXT DEFAULT 'practitioner' CHECK (user_type IN ('practitioner', 'patient')),
  
  -- Additional practitioner profile fields (nullable, filled later in profile page)
  address TEXT,
  degrees TEXT[], -- Array of degrees/certifications
  title TEXT, -- e.g., "Dr.", "MD", "PhD"
  specialty TEXT, -- Medical specialty
  clinic TEXT, -- Clinic/hospital name
  website TEXT,
  rate DECIMAL(10,2), -- Hourly rate
  languages TEXT[], -- Array of languages spoken
  avatar TEXT, -- URL to avatar image
  aboutme TEXT, -- About me/bio content
  years_of_experience INTEGER, -- Years of experience
  experience TEXT, -- Experience description (legacy field)
  gender TEXT, -- Gender
  
  -- Patient-specific fields
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT[], -- Array of medical conditions
  insurance_provider TEXT,
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow insert for authenticated users (for signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Availabilities table for practitioner availability management
CREATE TABLE Availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  unavailable_slots TEXT[] DEFAULT '{}', -- Array of time slots that are unavailable (e.g., ['08:00', '09:00'])
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one record per practitioner per date
  CONSTRAINT availabilities_practitioner_date_unique UNIQUE(practitioner_id, date)
);

-- Enable Row Level Security on Availabilities
ALTER TABLE Availabilities ENABLE ROW LEVEL SECURITY;

-- Policy: Practitioners can view their own availability
CREATE POLICY "Practitioners can view own availability" ON Availabilities
  FOR SELECT USING (practitioner_id = auth.uid());

-- Policy: Practitioners can update their own availability
CREATE POLICY "Practitioners can update own availability" ON Availabilities
  FOR UPDATE USING (practitioner_id = auth.uid());

-- Policy: Practitioners can insert their own availability
CREATE POLICY "Practitioners can insert own availability" ON Availabilities
  FOR INSERT WITH CHECK (practitioner_id = auth.uid());

-- Policy: Practitioners can delete their own availability
CREATE POLICY "Practitioners can delete own availability" ON Availabilities
  FOR DELETE USING (practitioner_id = auth.uid());

-- Policy: Allow patients to view practitioner availability (for booking)
CREATE POLICY "Patients can view practitioner availability" ON Availabilities
  FOR SELECT USING (true); -- All users can read availability for booking purposes

-- Trigger to automatically update updated_at for Availabilities
CREATE TRIGGER update_availability_updated_at 
    BEFORE UPDATE ON Availabilities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance on common queries
CREATE INDEX idx_availability_practitioner_date ON Availabilities(practitioner_id, date);
CREATE INDEX idx_availability_date ON Availabilities(date);