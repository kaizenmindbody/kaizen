-- Create Degrees table
CREATE TABLE IF NOT EXISTS "Degrees" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Degrees" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow service role to manage degrees
CREATE POLICY "Enable read access for all users" ON "Degrees"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for service role only" ON "Degrees"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for service role only" ON "Degrees"
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for service role only" ON "Degrees"
  FOR DELETE
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_degrees_title ON "Degrees"(title);

-- Insert some sample degrees (optional)
INSERT INTO "Degrees" (title) VALUES
  ('MD - Doctor of Medicine'),
  ('DO - Doctor of Osteopathic Medicine'),
  ('PhD - Doctor of Philosophy'),
  ('DPM - Doctor of Podiatric Medicine'),
  ('DDS - Doctor of Dental Surgery'),
  ('DMD - Doctor of Dental Medicine'),
  ('PharmD - Doctor of Pharmacy'),
  ('PsyD - Doctor of Psychology'),
  ('DVM - Doctor of Veterinary Medicine'),
  ('OD - Doctor of Optometry'),
  ('DC - Doctor of Chiropractic'),
  ('ND - Doctor of Naturopathic Medicine'),
  ('MSN - Master of Science in Nursing'),
  ('NP - Nurse Practitioner'),
  ('PA - Physician Assistant'),
  ('RN - Registered Nurse'),
  ('MPH - Master of Public Health'),
  ('MS - Master of Science'),
  ('MA - Master of Arts'),
  ('BS - Bachelor of Science'),
  ('BA - Bachelor of Arts')
ON CONFLICT DO NOTHING;
