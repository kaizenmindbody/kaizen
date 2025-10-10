-- =====================================================
-- DROP EVENTTICKETS TABLE
-- =====================================================
-- This script drops the old EventTickets table
-- Use this if you need to remove the old structure
-- =====================================================

-- Drop the table with CASCADE to remove dependent objects
DROP TABLE IF EXISTS "EventTickets" CASCADE;

-- Verify the table was dropped
SELECT tablename
FROM pg_tables
WHERE tablename = 'EventTickets';

-- =====================================================
-- EVENTTICKETS TABLE STRUCTURE (FOR REFERENCE)
-- =====================================================
-- This shows what the old EventTickets table looked like
-- before it was replaced by the new Events/TicketTypes structure
-- =====================================================

/*
CREATE TABLE "EventTickets" (
  -- Primary Key
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event Information
  event_id              UUID NOT NULL,                    -- FK to Events table

  -- Ticket Information
  ticket_name           TEXT NOT NULL,                    -- e.g., "General Admission", "VIP"
  description           TEXT,                             -- Optional description

  -- Quantity Management
  max_quantity          INTEGER NOT NULL DEFAULT 50,      -- Maximum tickets available
  sold_quantity         INTEGER DEFAULT 0,                -- Number sold
  available_quantity    INTEGER,                          -- Computed: max - sold

  -- Sales Period
  sales_start_datetime  TIMESTAMP WITH TIME ZONE NOT NULL,
  sales_end_datetime    TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Pricing
  price                 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  requires_approval     BOOLEAN DEFAULT FALSE,
  suggested_pricing     BOOLEAN DEFAULT FALSE,

  -- Status
  is_sold_out           BOOLEAN DEFAULT FALSE,
  is_active             BOOLEAN DEFAULT TRUE,

  -- Display
  display_order         INTEGER DEFAULT 0,

  -- Timestamps
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- =====================================================
-- COLUMN TYPES SUMMARY
-- =====================================================
/*
┌──────────────────────────┬─────────────────────────────┐
│ Column Name              │ Data Type                   │
├──────────────────────────┼─────────────────────────────┤
│ id                       │ UUID                        │
│ event_id                 │ UUID                        │
│ ticket_name              │ TEXT                        │
│ description              │ TEXT                        │
│ max_quantity             │ INTEGER                     │
│ sold_quantity            │ INTEGER                     │
│ available_quantity       │ INTEGER (GENERATED)         │
│ sales_start_datetime     │ TIMESTAMP WITH TIME ZONE    │
│ sales_end_datetime       │ TIMESTAMP WITH TIME ZONE    │
│ price                    │ DECIMAL(10,2)               │
│ requires_approval        │ BOOLEAN                     │
│ suggested_pricing        │ BOOLEAN                     │
│ is_sold_out              │ BOOLEAN                     │
│ is_active                │ BOOLEAN                     │
│ display_order            │ INTEGER                     │
│ created_at               │ TIMESTAMP WITH TIME ZONE    │
│ updated_at               │ TIMESTAMP WITH TIME ZONE    │
└──────────────────────────┴─────────────────────────────┘
*/

-- =====================================================
-- NEW STRUCTURE (TicketTypes)
-- =====================================================
-- The new system uses "TicketTypes" instead of "EventTickets"
-- See create-events-tickets-tables.sql for the new schema
-- =====================================================
