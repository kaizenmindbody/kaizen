-- Books table for booking system
CREATE TABLE Books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Patient must exist
  date DATE NOT NULL,
  time TEXT NOT NULL, -- Time slot in format '08:00', '09:00', etc.
  service_type TEXT NOT NULL, -- e.g., 'Acupuncture - Initial Visit'
  price DECIMAL(10,2) NOT NULL,
  reason TEXT, -- Reason for visit (optional)
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no-show')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one booking per practitioner, date, and time slot
  UNIQUE(practitioner_id, date, time)
);

-- Enable Row Level Security
ALTER TABLE Books ENABLE ROW LEVEL SECURITY;

-- Policy: Practitioners can view their own bookings
CREATE POLICY "Practitioners can view own bookings" ON Books
  FOR SELECT USING (practitioner_id = auth.uid());

-- Policy: Practitioners can update their own bookings (for status changes)
CREATE POLICY "Practitioners can update own bookings" ON Books
  FOR UPDATE USING (practitioner_id = auth.uid());

-- Policy: Patients can view their own bookings
CREATE POLICY "Patients can view own bookings" ON Books
  FOR SELECT USING (patient_id = auth.uid());

-- Policy: Patients can insert bookings (for themselves)
CREATE POLICY "Patients can insert bookings" ON Books
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Policy: Patients can update their own bookings (for cancellations)
CREATE POLICY "Patients can update own bookings" ON Books
  FOR UPDATE USING (patient_id = auth.uid());

-- Trigger to automatically update updated_at
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON Books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_books_practitioner_date ON Books(practitioner_id, date);
CREATE INDEX idx_books_patient_id ON Books(patient_id);
CREATE INDEX idx_books_date_time ON Books(date, time);
CREATE INDEX idx_books_status ON Books(status);

-- Add a view for easier querying of active bookings with patient and practitioner info
CREATE VIEW active_bookings AS
SELECT
  b.*,
  p.full_name as practitioner_name,
  p.address as practitioner_address,
  pt.full_name as patient_name,
  pt.email as patient_email,
  pt.phone as patient_phone
FROM Books b
JOIN users p ON b.practitioner_id = p.id
JOIN users pt ON b.patient_id = pt.id
WHERE b.status IN ('confirmed', 'completed');

-- Grant access to the view
GRANT SELECT ON active_bookings TO authenticated;