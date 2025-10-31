# Service Pricing Duration Migration Guide

## Overview
This guide walks you through migrating the ServicePricing table to change duration columns from `INTEGER` to `TEXT` type. This allows durations to be stored as flexible strings (e.g., "30", "45", "30-45 minutes").

## What Changed
- `first_time_duration`: Changed from INTEGER → TEXT
- `returning_duration`: Changed from INTEGER → TEXT
- All duration data will be stored as strings instead of numbers
- Prices remain as TEXT (unchanged)

## Code Changes Summary
✅ Database schema updated
✅ API route handler updated (no more parseFloat conversion)
✅ Redux types already correct (strings)

## Step-by-Step Migration Instructions

### Option 1: Safe Migration (Recommended - Preserves Data Structure)

If you have existing ServicePricing records and want to preserve them as-is:

1. **Backup your data** (optional but recommended):
   ```sql
   -- Create a backup table
   CREATE TABLE ServicePricing_backup AS SELECT * FROM ServicePricing;
   ```

2. **Create a temporary table with new schema**:
   ```sql
   CREATE TABLE ServicePricing_new (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     service_id UUID REFERENCES Services(id) ON DELETE SET NULL,
     service_name TEXT NOT NULL,
     first_time_price TEXT,
     first_time_duration TEXT,
     returning_price TEXT,
     returning_duration TEXT,
     service_category TEXT DEFAULT 'In-Person / Clinic Visit',
     is_sliding_scale BOOLEAN DEFAULT false,
     sliding_scale_info TEXT,
     is_clinic_specific BOOLEAN DEFAULT false,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Copy data from old table to new table**:
   ```sql
   -- Convert INTEGER durations to TEXT
   INSERT INTO ServicePricing_new
   SELECT
     id,
     practitioner_id,
     service_id,
     service_name,
     first_time_price,
     first_time_duration::TEXT,  -- Convert INTEGER to TEXT
     returning_price,
     returning_duration::TEXT,   -- Convert INTEGER to TEXT
     service_category,
     is_sliding_scale,
     sliding_scale_info,
     is_clinic_specific,
     created_at,
     updated_at
   FROM ServicePricing;
   ```

4. **Drop old table and rename new one**:
   ```sql
   DROP TABLE ServicePricing CASCADE;
   ALTER TABLE ServicePricing_new RENAME TO ServicePricing;
   ```

5. **Recreate RLS Policies**:
   ```sql
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
   ```

6. **Recreate trigger**:
   ```sql
   CREATE TRIGGER update_service_pricing_updated_at
       BEFORE UPDATE ON ServicePricing
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();
   ```

7. **Recreate indexes**:
   ```sql
   CREATE INDEX idx_service_pricing_practitioner_id ON ServicePricing(practitioner_id);
   CREATE INDEX idx_service_pricing_service_id ON ServicePricing(service_id);
   CREATE INDEX idx_service_pricing_category ON ServicePricing(service_category);
   CREATE INDEX idx_service_pricing_clinic_specific ON ServicePricing(practitioner_id, is_clinic_specific);
   ```

### Option 2: Quick Migration (If Table is Empty or Data Loss Acceptable)

If the ServicePricing table is empty or doesn't exist yet:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire content of `migrate-service-pricing-duration-to-string.sql`
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Verify success (see verification section below)

## Applying in Supabase Dashboard

1. **Login to Supabase**: https://app.supabase.com

2. **Navigate to SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy and Paste SQL**:
   - Copy the appropriate migration SQL from above
   - Paste into the query editor

4. **Run the Migration**:
   - Click the blue "Run" button or press `Ctrl+Enter`
   - Wait for the query to complete

5. **Check for Errors**:
   - Look for any error messages in the results panel
   - If successful, you should see "Success" or similar message

## Verification

After running the migration, verify the changes:

```sql
-- Check the table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ServicePricing'
ORDER BY ordinal_position;
```

You should see:
- `first_time_duration` → `character varying` (TEXT type)
- `returning_duration` → `character varying` (TEXT type)

```sql
-- Check existing records (if any)
SELECT id, service_name, first_time_duration, returning_duration
FROM ServicePricing
LIMIT 5;
```

## Rollback (If Something Goes Wrong)

If you created a backup table, you can restore:

```sql
DROP TABLE ServicePricing CASCADE;
CREATE TABLE ServicePricing AS SELECT * FROM ServicePricing_backup;

-- Then recreate RLS, trigger, and indexes (see steps 5-7 above)
```

## Testing the Application

After migration:

1. Go to your profile page
2. Navigate to "Manage Services & Pricing"
3. Add a new service with:
   - First Time Patient Price: "85" or "$85-100"
   - First Time Patient Duration: "30" or "30-45"
   - Returning Patient Price: "75"
   - Returning Patient Duration: "45"
4. Click Save
5. Refresh and verify the data is saved correctly

## Support

If you encounter any issues:
1. Check the error message in Supabase SQL Editor
2. Verify the `users` and `Services` tables exist
3. Ensure you have proper permissions in Supabase
4. Check if the backup table exists and restore if needed

## Related Files Updated

- `/src/app/api/service-pricing/route.ts` - API handler updated
- `/src/store/slices/servicePricingSlice.ts` - Redux slice updated
- `/public/sql/create-service-pricing-table.sql` - Original schema updated
- `/public/sql/migrate-service-pricing-duration-to-string.sql` - New migration script created

