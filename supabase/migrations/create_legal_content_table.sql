-- Create LegalContent table to store Terms & Conditions and Privacy Policy
CREATE TABLE IF NOT EXISTS "LegalContent" (
  id SERIAL PRIMARY KEY,
  page_type VARCHAR(50) NOT NULL UNIQUE, -- 'terms-conditions' or 'privacy-policy'
  content JSONB NOT NULL, -- Store sections as JSON array
  updated_by UUID REFERENCES "Users"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on page_type for faster queries
CREATE INDEX IF NOT EXISTS idx_legal_content_page_type ON "LegalContent"(page_type);

-- Enable Row Level Security
ALTER TABLE "LegalContent" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to legal content" ON "LegalContent";
DROP POLICY IF EXISTS "Allow admin full access to legal content" ON "LegalContent";

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to legal content"
ON "LegalContent"
FOR SELECT
TO public
USING (true);

-- Create policy to allow only admins to insert/update/delete
CREATE POLICY "Allow admin full access to legal content"
ON "LegalContent"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Users"
    WHERE "Users".id = auth.uid()
    AND "Users".type = 'admin'
  )
);

-- Insert default content for Terms & Conditions
INSERT INTO "LegalContent" (page_type, content) VALUES (
  'terms-conditions',
  '[
    {
      "title": "Introduction",
      "content": "Welcome to Kaizen, a platform that allows you to book appointments with healthcare professionals. By using our services, you agree to these Terms & Conditions. Please read them carefully before proceeding.",
      "type": "text"
    },
    {
      "title": "User Responsibilities",
      "content": "You must be at least 18 years old to use this website or have parental/guardian consent.\nEnsure that all information provided is accurate and up-to-date.\nYou are responsible for maintaining the confidentiality of your account and password.",
      "type": "list"
    },
    {
      "title": "Booking Appointment",
      "content": "Appointments are booked in real-time, subject to availability.\nUsers are responsible for attending the scheduled appointments or canceling in a timely manner.\nCancellations should be made before the appointment to avoid any penalties.",
      "type": "list"
    },
    {
      "title": "Medical Disclaimer",
      "content": "Kaizen provides a platform for scheduling appointments and is not responsible for the medical services provided.\nHealthcare providers listed on the platform are independent practitioners, and Kaizen does not guarantee the quality or accuracy of medical advice provided.",
      "type": "list"
    },
    {
      "title": "Payment & Fees",
      "content": "Payment for appointments may be made through the specified payment methods and is subject to the terms disclosed at booking.\nAny additional fees, such as cancellation or no-show fees, will be disclosed at the time of booking.",
      "type": "list"
    },
    {
      "title": "Changes to Terms & Conditions",
      "content": "Kaizen may update these Terms & Conditions periodically. Any changes will be communicated through the website or via email.",
      "type": "text"
    }
  ]'::jsonb
)
ON CONFLICT (page_type) DO NOTHING;

-- Insert default content for Privacy Policy
INSERT INTO "LegalContent" (page_type, content) VALUES (
  'privacy-policy',
  '[
    {
      "title": "Introduction",
      "content": "Welcome to Kaizen. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this privacy policy carefully.",
      "type": "text"
    },
    {
      "title": "Information We Collect",
      "content": "We may collect information about you in a variety of ways:\nPersonal Information: Name, email address, phone number, and other contact details\nHealth Information: Medical history and health-related information you choose to share\nUsage Data: Information about how you interact with our website and services\nDevice Information: IP address, browser type, operating system, and device identifiers",
      "type": "mixed"
    },
    {
      "title": "How We Use Your Information",
      "content": "We use the information we collect to:\nProvide and maintain our services\nProcess and manage appointment bookings\nCommunicate with you about appointments and services\nImprove our website and services\nSend you relevant updates and promotional materials (with your consent)\nComply with legal obligations and protect our rights",
      "type": "mixed"
    },
    {
      "title": "Information Sharing",
      "content": "We may share your information in the following situations:\nWith healthcare providers when you book appointments through our platform\nWith service providers who assist us in operating our website and services\nWhen required by law or to protect our rights and safety\nWith your explicit consent for specific purposes",
      "type": "mixed"
    },
    {
      "title": "Data Security",
      "content": "We implement appropriate security measures to protect your personal information:\nEncryption of sensitive data in transit and at rest\nRegular security audits and updates\nLimited access to personal information on a need-to-know basis\nSecure data storage and backup procedures",
      "type": "mixed"
    },
    {
      "title": "Your Rights",
      "content": "You have certain rights regarding your personal information:\nAccess: Request a copy of the personal information we hold about you\nCorrection: Request correction of inaccurate or incomplete information\nDeletion: Request deletion of your personal information under certain circumstances\nPortability: Request transfer of your data to another service provider\nOpt-out: Unsubscribe from marketing communications at any time",
      "type": "mixed"
    },
    {
      "title": "Cookies and Tracking",
      "content": "We use cookies and similar tracking technologies to:\nRemember your preferences and settings\nAnalyze website traffic and usage patterns\nProvide personalized content and advertisements\nImprove website functionality and user experience",
      "type": "mixed"
    },
    {
      "title": "Third-Party Services",
      "content": "Our website may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.",
      "type": "text"
    },
    {
      "title": "Data Retention",
      "content": "We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.",
      "type": "text"
    },
    {
      "title": "Children''s Privacy",
      "content": "Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.",
      "type": "text"
    },
    {
      "title": "Changes to Privacy Policy",
      "content": "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date. We encourage you to review this Privacy Policy periodically.",
      "type": "text"
    },
    {
      "title": "Contact Us",
      "content": "If you have any questions about this Privacy Policy or our data practices, please contact us:\nEmail: privacy@kaizen.com\nPhone: +1 (555) 123-4567\nAddress: 123 Healthcare Ave, Medical District, City, State 12345",
      "type": "contact"
    }
  ]'::jsonb
)
ON CONFLICT (page_type) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_legal_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_legal_content_updated_at ON "LegalContent";

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_legal_content_updated_at
BEFORE UPDATE ON "LegalContent"
FOR EACH ROW
EXECUTE FUNCTION update_legal_content_updated_at();

COMMENT ON TABLE "LegalContent" IS 'Stores Terms & Conditions and Privacy Policy content';
COMMENT ON COLUMN "LegalContent".page_type IS 'Type of legal page: terms-conditions or privacy-policy';
COMMENT ON COLUMN "LegalContent".content IS 'Array of sections with title, content, and type';
