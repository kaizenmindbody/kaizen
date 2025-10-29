# EventHost Table Setup Guide

## Problem: UUID vs BIGINT Type Mismatch

The error `operator does not exist: uuid = bigint` means your Users table uses a different ID type than expected.

## Solution: Follow These Steps

### Step 1: Check Your Users Table Structure

Run this SQL in your Supabase SQL Editor:

```sql
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'Users'
  AND column_name = 'id';
```

**Result will show:**
- `bigint` or `integer` → Use **OPTION A** below
- `uuid` → Use **OPTION B** below

---

### Step 2: Create EventHosts Table

## OPTION A: If Users.id is BIGINT/INTEGER ✅ (RECOMMENDED)

Use the file `CHECK_AND_CREATE_EVENTHOSTS.sql` - it's already set up for BIGINT.

**Or run this SQL directly:**

```sql
CREATE TABLE IF NOT EXISTS "EventHosts" (
  id TEXT PRIMARY KEY,  -- Store auth.uid() as TEXT to avoid type conflicts
  user_id BIGINT,  -- Reference to Users table (BIGINT)
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

-- Add foreign key if Users table exists
ALTER TABLE "EventHosts"
ADD CONSTRAINT fk_eventhost_user_id
FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE;

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_eventhosts_updated_at
  BEFORE UPDATE ON "EventHosts"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE "EventHosts" ENABLE ROW LEVEL SECURITY;

-- Create policies
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

## OPTION B: If Users.id is UUID

```sql
CREATE TABLE IF NOT EXISTS "EventHosts" (
  id UUID PRIMARY KEY,
  user_id UUID,
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

-- Add foreign keys
ALTER TABLE "EventHosts"
ADD CONSTRAINT fk_eventhost_user_id
FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE;

ALTER TABLE "EventHosts"
ADD CONSTRAINT fk_eventhost_auth_user
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- (Add the same trigger, RLS, and policies as Option A, but use UUID instead of TEXT)
```

---

### Step 3: Verify Table Created Successfully

Run this to confirm:

```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'EventHosts'
ORDER BY ordinal_position;
```

You should see all the columns listed.

---

## Table Structure

| Column         | Type      | Description                    |
|----------------|-----------|--------------------------------|
| id             | TEXT/UUID | Auth user ID (primary key)     |
| user_id        | BIGINT/UUID | Users table reference        |
| business_name  | TEXT      | Event host or business name    |
| website        | TEXT      | Host website URL               |
| bio            | TEXT      | Host biography                 |
| instagram      | TEXT      | Instagram profile URL          |
| facebook       | TEXT      | Facebook profile URL           |
| tiktok         | TEXT      | TikTok profile URL             |
| linkedin       | TEXT      | LinkedIn profile URL           |
| host_image     | TEXT      | Host profile image URL         |
| created_at     | TIMESTAMP | Record creation time           |
| updated_at     | TIMESTAMP | Last update time               |

---

## Files Available

1. **CHECK_AND_CREATE_EVENTHOSTS.sql** - Comprehensive script with both options
2. **supabase_eventhost_table.sql** - Original UUID version
3. **supabase_eventhost_table_bigint.sql** - BIGINT version

---

## TypeScript Code

The TypeScript code has been updated to handle both types automatically by using `auth.uid()` directly, which works regardless of your Users table structure.

---

## Troubleshooting

**Still getting errors?**

1. Check if "Users" table exists (capital U):
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'Users';
   ```

2. If it doesn't exist, check for lowercase "users":
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'users';
   ```

3. Update the foreign key constraint to match your actual table name.

---

## Next Steps

After creating the table, test the functionality:
1. Go to Event Host page
2. Click "Manage Host Profile"
3. Fill in the form
4. Click "Save Changes"
5. Verify data appears in "View Host Profile"
