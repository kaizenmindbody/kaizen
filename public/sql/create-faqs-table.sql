-- Create Faqs table with proper structure
CREATE TABLE IF NOT EXISTS "Faqs" (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "Faqs" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON "Faqs";
DROP POLICY IF EXISTS "Enable insert for service role only" ON "Faqs";
DROP POLICY IF EXISTS "Enable update for service role only" ON "Faqs";
DROP POLICY IF EXISTS "Enable delete for service role only" ON "Faqs";

-- Create policies that allow public read access and service role full access
CREATE POLICY "Enable read access for all users" ON "Faqs"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for service role only" ON "Faqs"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for service role only" ON "Faqs"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for service role only" ON "Faqs"
  FOR DELETE
  USING (true);

-- Insert sample FAQs (optional - remove if not needed)
INSERT INTO "Faqs" (question, answer) VALUES
('What services do you offer?', 'We offer a wide range of healthcare services including general consultations, specialist referrals, diagnostic tests, and preventive care.'),
('How do I book an appointment?', 'You can book an appointment through our website by selecting a practitioner and choosing an available time slot, or by calling our office directly.'),
('What are your operating hours?', 'Our operating hours vary by practitioner. Please check the individual practitioner profiles for their specific availability.'),
('Do you accept insurance?', 'Yes, we accept most major insurance plans. Please contact us with your insurance provider details to confirm coverage.'),
('How do I cancel or reschedule an appointment?', 'You can cancel or reschedule your appointment through your patient dashboard or by contacting us at least 24 hours in advance.')
ON CONFLICT DO NOTHING;
