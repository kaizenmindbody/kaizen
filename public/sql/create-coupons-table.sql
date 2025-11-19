-- Create Coupons table for event discount coupons
CREATE TABLE IF NOT EXISTS public."Coupons" (
    id BIGSERIAL PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 100,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_coupon_code UNIQUE (host_id, code)
);

-- Create index on host_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_host_id ON public."Coupons"(host_id);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public."Coupons"(code);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public."Coupons"(is_active);

-- Add RLS policies for Coupons
ALTER TABLE public."Coupons" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active coupons
CREATE POLICY "Anyone can view active coupons"
ON public."Coupons"
FOR SELECT
USING (is_active = true);

-- Policy: Hosts can view their own coupons (active or inactive)
CREATE POLICY "Hosts can view their own coupons"
ON public."Coupons"
FOR SELECT
USING (host_id = auth.uid());

-- Policy: Hosts can insert their own coupons
CREATE POLICY "Hosts can insert their own coupons"
ON public."Coupons"
FOR INSERT
WITH CHECK (host_id = auth.uid());

-- Policy: Hosts can update their own coupons
CREATE POLICY "Hosts can update their own coupons"
ON public."Coupons"
FOR UPDATE
USING (host_id = auth.uid());

-- Policy: Hosts can delete their own coupons
CREATE POLICY "Hosts can delete their own coupons"
ON public."Coupons"
FOR DELETE
USING (host_id = auth.uid());

-- Add comment to table
COMMENT ON TABLE public."Coupons" IS 'Stores discount coupons created by event hosts';
