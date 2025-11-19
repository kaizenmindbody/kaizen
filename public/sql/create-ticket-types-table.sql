-- Create TicketTypes table for event ticketing
CREATE TABLE IF NOT EXISTS public."TicketTypes" (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public."Events"(id) ON DELETE CASCADE,
    ticket_name VARCHAR(255) NOT NULL,
    description TEXT,
    max_quantity INTEGER NOT NULL DEFAULT 50,
    sales_start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    sales_end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    requires_approval BOOLEAN DEFAULT FALSE,
    suggested_pricing BOOLEAN DEFAULT FALSE,
    is_sold_out BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on event_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public."TicketTypes"(event_id);

-- Create index on display_order
CREATE INDEX IF NOT EXISTS idx_ticket_types_display_order ON public."TicketTypes"(display_order);

-- Add RLS policies for TicketTypes
ALTER TABLE public."TicketTypes" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ticket types
CREATE POLICY "Anyone can view ticket types"
ON public."TicketTypes"
FOR SELECT
USING (true);

-- Policy: Event hosts can insert ticket types for their own events
CREATE POLICY "Event hosts can insert ticket types for their events"
ON public."TicketTypes"
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public."Events"
        WHERE id = event_id
        AND host_id = auth.uid()
    )
);

-- Policy: Event hosts can update ticket types for their own events
CREATE POLICY "Event hosts can update ticket types for their events"
ON public."TicketTypes"
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public."Events"
        WHERE id = event_id
        AND host_id = auth.uid()
    )
);

-- Policy: Event hosts can delete ticket types for their own events
CREATE POLICY "Event hosts can delete ticket types for their events"
ON public."TicketTypes"
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public."Events"
        WHERE id = event_id
        AND host_id = auth.uid()
    )
);

-- Add comment to table
COMMENT ON TABLE public."TicketTypes" IS 'Stores different ticket types and pricing for events';
