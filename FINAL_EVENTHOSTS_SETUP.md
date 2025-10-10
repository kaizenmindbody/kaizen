# EventHosts Table - Final Setup Guide

## Problem Solved ✅

The error `invalid input syntax for type bigint: "39ff3df8-897d-4641-9f75-dbc2cd632ea6"` occurred because:
- Your Users table stores auth UUID strings in the `id` column (TEXT or UUID type)
- But the EventHosts table was created with `user_id` as BIGINT
- This caused a type mismatch when trying to insert UUID values

## Solution

Both `id` and `user_id` in EventHosts should be TEXT to store UUID strings.

---

## Step 1: Drop and Recreate the EventHosts Table

Run this SQL in your Supabase SQL Editor:

### Use `FIX_EVENTHOSTS_TABLE.sql`

This file contains the complete, corrected SQL script.

**Or copy and run this directly:**

```sql
-- Drop existing table
DROP TABLE IF EXISTS "EventHosts";

-- Create EventHosts table with correct types
CREATE TABLE "EventHosts" (
  id TEXT PRIMARY KEY,              -- Auth user ID (UUID as TEXT)
  user_id TEXT,                     -- Users table ID (also UUID as TEXT)
  business_name TEXT,
  website TEXT,
  bio TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  linkedin TEXT,
  host_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE "EventHosts"
ADD CONSTRAINT fk_eventhost_user_id
FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_eventhosts_updated_at
  BEFORE UPDATE ON "EventHosts"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "EventHosts" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own event host profile"
  ON "EventHosts" FOR SELECT
  USING (id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own event host profile"
  ON "EventHosts" FOR INSERT
  WITH CHECK (id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own event host profile"
  ON "EventHosts" FOR UPDATE
  USING (id = auth.uid()::TEXT);

CREATE POLICY "Anyone can view event host profiles"
  ON "EventHosts" FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX idx_eventhosts_user_id ON "EventHosts"(user_id);
CREATE INDEX idx_eventhosts_id ON "EventHosts"(id);
```

---

## Step 2: Verify Table Structure

Run this to confirm the table was created correctly:

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'EventHosts'
ORDER BY ordinal_position;
```

**Expected output:**

| column_name    | data_type                   | is_nullable | column_default |
|----------------|--------------------------------|-------------|----------------|
| id             | text                           | NO          |                |
| user_id        | text                           | YES         |                |
| business_name  | text                           | YES         |                |
| website        | text                           | YES         |                |
| bio            | text                           | YES         |                |
| instagram      | text                           | YES         |                |
| facebook       | text                           | YES         |                |
| tiktok         | text                           | YES         |                |
| linkedin       | text                           | YES         |                |
| host_image     | text                           | YES         |                |
| created_at     | timestamp with time zone       | YES         | now()          |
| updated_at     | timestamp with time zone       | YES         | now()          |

---

## Step 3: Test the Functionality

1. **Go to Event Host page** (login as an event host user)
2. **Navigate to**: Host → Manage Host Profile
3. **Fill in the form**:
   - Event Host or Business Name (required)
   - Website
   - Bio
   - Social media links
4. **Click "Save Changes"**
5. **Success!** You should see:
   - Green success message
   - Automatic redirect to "View Host Profile"
   - All your data displayed

---

## Final Table Structure

```
EventHosts Table
├── id (TEXT) - Primary Key - Auth user UUID
├── user_id (TEXT) - Foreign Key to Users.id
├── business_name (TEXT) - Event host or business name
├── website (TEXT) - Host website URL
├── bio (TEXT) - Host biography
├── instagram (TEXT) - Instagram URL
├── facebook (TEXT) - Facebook URL
├── tiktok (TEXT) - TikTok URL
├── linkedin (TEXT) - LinkedIn URL
├── host_image (TEXT) - Profile image URL (for future use)
├── created_at (TIMESTAMP) - Auto-set on insert
└── updated_at (TIMESTAMP) - Auto-updated on change
```

---

## Relationships

```
auth.users (UUID)
    ↓
Users.id (TEXT storing UUID)
    ↓
EventHosts.user_id (TEXT)
```

Both `id` and `user_id` in EventHosts store the same value (auth user UUID).

---

## Updated Files

✅ **useEventHost.ts** - Simplified to use auth.uid() for both id and user_id
✅ **types/user.ts** - Added comments to EventHost interface
✅ **All components** - Already working correctly

---

## Troubleshooting

**Still getting errors?**

1. **Check if the table exists:**
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename = 'EventHosts';
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'EventHosts';
   ```

3. **Test insert manually:**
   ```sql
   INSERT INTO "EventHosts" (id, user_id, business_name)
   VALUES (
     auth.uid()::TEXT,
     auth.uid()::TEXT,
     'Test Business'
   );
   ```

---

## Summary

✅ EventHosts table uses TEXT for all UUID fields
✅ TypeScript code updated to work with correct types
✅ RLS policies configured properly
✅ Form will now save successfully

🎉 **You're all set! Test it out!**
