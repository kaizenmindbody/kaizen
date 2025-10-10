-- =====================================================
-- EVENTS AND TICKETS TABLE SCHEMA
-- =====================================================
-- This schema creates tables for event management system
-- including Events, TicketTypes, and TicketPurchases
-- =====================================================

-- =====================================================
-- 1. EVENTS TABLE
-- =====================================================
-- Stores all event information created by EventHosts

DROP TABLE IF EXISTS "Events" CASCADE;

CREATE TABLE "Events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,                              -- Reference to EventHosts table

  -- Basic Event Information
  event_name TEXT NOT NULL,
  event_summary TEXT NOT NULL,                        -- Brief 2-3 sentence summary
  event_description TEXT NOT NULL,                    -- Detailed description
  what_to_bring TEXT,                                 -- Optional: What to bring or not bring

  -- Date and Time
  event_start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Location Information
  address TEXT NOT NULL,                              -- Full event address
  hide_address BOOLEAN DEFAULT FALSE,                 -- Hide address until user registers

  -- Event Image
  event_image TEXT,                                   -- URL to event image in storage

  -- Ticketing Settings
  enable_ticketing BOOLEAN DEFAULT FALSE,             -- Enable Kaizen ticketing
  non_refundable BOOLEAN DEFAULT FALSE,               -- Non-refundable event

  -- Event Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_event_host FOREIGN KEY (host_id) REFERENCES "EventHosts"(id) ON DELETE CASCADE,
  CONSTRAINT check_event_dates CHECK (event_end_datetime >= event_start_datetime)
);

-- Create indexes for better query performance
CREATE INDEX idx_events_host_id ON "Events"(host_id);
CREATE INDEX idx_events_status ON "Events"(status);
CREATE INDEX idx_events_start_date ON "Events"(event_start_datetime);
CREATE INDEX idx_events_created_at ON "Events"(created_at);
CREATE INDEX idx_events_address ON "Events" USING gin(to_tsvector('english', address));  -- For address search

-- Enable Row Level Security
ALTER TABLE "Events" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Events
-- Event hosts can view their own events
CREATE POLICY "Event hosts can view own events"
  ON "Events" FOR SELECT
  USING (host_id IN (SELECT id FROM "EventHosts" WHERE id = auth.uid()));

-- Event hosts can insert their own events
CREATE POLICY "Event hosts can insert own events"
  ON "Events" FOR INSERT
  WITH CHECK (host_id IN (SELECT id FROM "EventHosts" WHERE id = auth.uid()));

-- Event hosts can update their own events
CREATE POLICY "Event hosts can update own events"
  ON "Events" FOR UPDATE
  USING (host_id IN (SELECT id FROM "EventHosts" WHERE id = auth.uid()));

-- Event hosts can delete their own events
CREATE POLICY "Event hosts can delete own events"
  ON "Events" FOR DELETE
  USING (host_id IN (SELECT id FROM "EventHosts" WHERE id = auth.uid()));

-- Anyone can view published events
CREATE POLICY "Anyone can view published events"
  ON "Events" FOR SELECT
  USING (status = 'published');

-- Trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON "Events"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 2. TICKET TYPES TABLE
-- =====================================================
-- Stores different ticket types for each event

DROP TABLE IF EXISTS "TicketTypes" CASCADE;

CREATE TABLE "TicketTypes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,                             -- Reference to Events table

  -- Ticket Information
  ticket_name TEXT NOT NULL,
  description TEXT,                                   -- Optional description

  -- Quantity and Availability
  max_quantity INTEGER NOT NULL DEFAULT 50,           -- Maximum tickets available
  sold_quantity INTEGER DEFAULT 0,                    -- Number of tickets sold
  available_quantity INTEGER GENERATED ALWAYS AS (max_quantity - sold_quantity) STORED,

  -- Sales Period
  sales_start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  sales_end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  requires_approval BOOLEAN DEFAULT FALSE,            -- Requires host approval
  suggested_pricing BOOLEAN DEFAULT FALSE,            -- Allow pay-what-you-want

  -- Status
  is_sold_out BOOLEAN DEFAULT FALSE,                  -- Manually marked as sold out
  is_active BOOLEAN DEFAULT TRUE,                     -- Ticket type is active

  -- Display Order
  display_order INTEGER DEFAULT 0,                    -- For sorting ticket types

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_ticket_event FOREIGN KEY (event_id) REFERENCES "Events"(id) ON DELETE CASCADE,
  CONSTRAINT check_max_quantity CHECK (max_quantity > 0),
  CONSTRAINT check_sold_quantity CHECK (sold_quantity >= 0 AND sold_quantity <= max_quantity),
  CONSTRAINT check_price CHECK (price >= 0),
  CONSTRAINT check_sales_dates CHECK (sales_end_datetime >= sales_start_datetime)
);

-- Create indexes
CREATE INDEX idx_ticket_types_event_id ON "TicketTypes"(event_id);
CREATE INDEX idx_ticket_types_active ON "TicketTypes"(is_active);
CREATE INDEX idx_ticket_types_display_order ON "TicketTypes"(event_id, display_order);

-- Enable Row Level Security
ALTER TABLE "TicketTypes" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for TicketTypes
-- Event hosts can view tickets for their events
CREATE POLICY "Event hosts can view own event tickets"
  ON "TicketTypes" FOR SELECT
  USING (event_id IN (
    SELECT id FROM "Events" WHERE host_id IN (
      SELECT id FROM "EventHosts" WHERE id = auth.uid()
    )
  ));

-- Event hosts can insert tickets for their events
CREATE POLICY "Event hosts can insert own event tickets"
  ON "TicketTypes" FOR INSERT
  WITH CHECK (event_id IN (
    SELECT id FROM "Events" WHERE host_id IN (
      SELECT id FROM "EventHosts" WHERE id = auth.uid()
    )
  ));

-- Event hosts can update tickets for their events
CREATE POLICY "Event hosts can update own event tickets"
  ON "TicketTypes" FOR UPDATE
  USING (event_id IN (
    SELECT id FROM "Events" WHERE host_id IN (
      SELECT id FROM "EventHosts" WHERE id = auth.uid()
    )
  ));

-- Event hosts can delete tickets for their events
CREATE POLICY "Event hosts can delete own event tickets"
  ON "TicketTypes" FOR DELETE
  USING (event_id IN (
    SELECT id FROM "Events" WHERE host_id IN (
      SELECT id FROM "EventHosts" WHERE id = auth.uid()
    )
  ));

-- Anyone can view active tickets for published events
CREATE POLICY "Anyone can view published event tickets"
  ON "TicketTypes" FOR SELECT
  USING (
    is_active = TRUE AND
    event_id IN (SELECT id FROM "Events" WHERE status = 'published')
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ticket_types_updated_at
  BEFORE UPDATE ON "TicketTypes"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 3. TICKET PURCHASES TABLE
-- =====================================================
-- Tracks ticket purchases/registrations by users

DROP TABLE IF EXISTS "TicketPurchases" CASCADE;

CREATE TABLE "TicketPurchases" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id UUID NOT NULL,                      -- Reference to TicketTypes
  event_id UUID NOT NULL,                            -- Reference to Events (denormalized for queries)
  user_id UUID NOT NULL,                             -- Reference to Users table

  -- Purchase Information
  quantity INTEGER NOT NULL DEFAULT 1,
  price_paid DECIMAL(10,2) NOT NULL,                 -- Price paid (may differ if suggested pricing)
  total_amount DECIMAL(10,2) NOT NULL,               -- Total amount paid (quantity * price_paid)

  -- Attendee Information
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,

  -- Purchase Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Payment Information
  payment_intent_id TEXT,                            -- Stripe payment intent ID
  payment_method TEXT,                               -- Payment method used

  -- Approval (for tickets that require approval)
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,                                  -- Reference to EventHost user_id
  rejection_reason TEXT,

  -- Check-in
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_purchase_ticket_type FOREIGN KEY (ticket_type_id) REFERENCES "TicketTypes"(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_event FOREIGN KEY (event_id) REFERENCES "Events"(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_user FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE,
  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT check_price_paid CHECK (price_paid >= 0),
  CONSTRAINT check_total_amount CHECK (total_amount >= 0)
);

-- Create indexes
CREATE INDEX idx_ticket_purchases_ticket_type_id ON "TicketPurchases"(ticket_type_id);
CREATE INDEX idx_ticket_purchases_event_id ON "TicketPurchases"(event_id);
CREATE INDEX idx_ticket_purchases_user_id ON "TicketPurchases"(user_id);
CREATE INDEX idx_ticket_purchases_status ON "TicketPurchases"(status);
CREATE INDEX idx_ticket_purchases_payment_status ON "TicketPurchases"(payment_status);
CREATE INDEX idx_ticket_purchases_purchased_at ON "TicketPurchases"(purchased_at);

-- Enable Row Level Security
ALTER TABLE "TicketPurchases" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for TicketPurchases
-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON "TicketPurchases" FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own purchases
CREATE POLICY "Users can insert own purchases"
  ON "TicketPurchases" FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Event hosts can view purchases for their events
CREATE POLICY "Event hosts can view event purchases"
  ON "TicketPurchases" FOR SELECT
  USING (event_id IN (
    SELECT id FROM "Events" WHERE host_id IN (
      SELECT id FROM "EventHosts" WHERE id = auth.uid()
    )
  ));

-- Event hosts can update purchases for their events (for approval/check-in)
CREATE POLICY "Event hosts can update event purchases"
  ON "TicketPurchases" FOR UPDATE
  USING (event_id IN (
    SELECT id FROM "Events" WHERE host_id IN (
      SELECT id FROM "EventHosts" WHERE id = auth.uid()
    )
  ));

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ticket_purchases_updated_at
  BEFORE UPDATE ON "TicketPurchases"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to update sold_quantity when a purchase is made
CREATE OR REPLACE FUNCTION update_ticket_sold_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'paid') OR
     (TG_OP = 'UPDATE' AND OLD.payment_status != 'paid' AND NEW.payment_status = 'paid') THEN
    -- Increment sold quantity
    UPDATE "TicketTypes"
    SET sold_quantity = sold_quantity + NEW.quantity
    WHERE id = NEW.ticket_type_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' AND NEW.payment_status IN ('cancelled', 'refunded')) THEN
    -- Decrement sold quantity
    UPDATE "TicketTypes"
    SET sold_quantity = GREATEST(0, sold_quantity - OLD.quantity)
    WHERE id = OLD.ticket_type_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update sold quantity
DROP TRIGGER IF EXISTS update_sold_quantity_trigger ON "TicketPurchases";
CREATE TRIGGER update_sold_quantity_trigger
  AFTER INSERT OR UPDATE OF payment_status ON "TicketPurchases"
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_sold_quantity();


-- =====================================================
-- 5. EVENT WAIVERS TABLE (OPTIONAL - FOR FUTURE)
-- =====================================================

DROP TABLE IF EXISTS "EventWaivers" CASCADE;

CREATE TABLE "EventWaivers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,

  waiver_title TEXT NOT NULL,
  waiver_content TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_waiver_event FOREIGN KEY (event_id) REFERENCES "Events"(id) ON DELETE CASCADE
);

CREATE INDEX idx_event_waivers_event_id ON "EventWaivers"(event_id);

ALTER TABLE "EventWaivers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event hosts can manage event waivers"
  ON "EventWaivers" FOR ALL
  USING (event_id IN (
    SELECT id FROM "Events" WHERE host_id IN (
      SELECT id FROM "EventHosts" WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Anyone can view waivers for published events"
  ON "EventWaivers" FOR SELECT
  USING (event_id IN (SELECT id FROM "Events" WHERE status = 'published'));

CREATE TRIGGER update_event_waivers_updated_at
  BEFORE UPDATE ON "EventWaivers"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 6. WAIVER SIGNATURES TABLE (OPTIONAL - FOR FUTURE)
-- =====================================================

DROP TABLE IF EXISTS "WaiverSignatures" CASCADE;

CREATE TABLE "WaiverSignatures" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waiver_id UUID NOT NULL,
  user_id UUID NOT NULL,
  ticket_purchase_id UUID NOT NULL,

  agreed BOOLEAN DEFAULT FALSE,
  signature_data TEXT,                               -- Can store digital signature
  ip_address TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_signature_waiver FOREIGN KEY (waiver_id) REFERENCES "EventWaivers"(id) ON DELETE CASCADE,
  CONSTRAINT fk_signature_user FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE,
  CONSTRAINT fk_signature_purchase FOREIGN KEY (ticket_purchase_id) REFERENCES "TicketPurchases"(id) ON DELETE CASCADE,
  UNIQUE(waiver_id, ticket_purchase_id)
);

CREATE INDEX idx_waiver_signatures_user_id ON "WaiverSignatures"(user_id);
CREATE INDEX idx_waiver_signatures_purchase_id ON "WaiverSignatures"(ticket_purchase_id);

ALTER TABLE "WaiverSignatures" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signatures"
  ON "WaiverSignatures" FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own signatures"
  ON "WaiverSignatures" FOR INSERT
  WITH CHECK (user_id = auth.uid());


-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Verify Events table structure
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('Events', 'TicketTypes', 'TicketPurchases', 'EventWaivers', 'WaiverSignatures')
ORDER BY table_name, ordinal_position;

-- Check if all tables were created successfully
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN ('Events', 'TicketTypes', 'TicketPurchases', 'EventWaivers', 'WaiverSignatures')
ORDER BY tablename;
