# Database Migration Instructions

## Issue: Missing Invitation Columns in ClinicMembers Table

If you're seeing this error:
```
Could not find the 'invitation_expires_at' column of 'ClinicMembers' in the schema cache
```

This means the database migration hasn't been run yet.

## Solution: Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)

### Step 2: Run the Migration
1. Copy the contents of `public/sql/add-invitation-tracking-to-clinic-members.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify
After running, verify the columns were added by running:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ClinicMembers' 
AND column_name LIKE 'invitation%';
```

You should see:
- `invitation_token`
- `invitation_status`
- `invitation_sent_at`
- `invitation_expires_at`
- `user_id`

## What This Migration Does

Adds the following columns to `ClinicMembers` table:
- `invitation_token` (TEXT) - Unique token for invitation links
- `invitation_status` (TEXT) - Status: 'pending', 'accepted', 'registered'
- `invitation_sent_at` (TIMESTAMP) - When invitation was sent
- `invitation_expires_at` (TIMESTAMP) - When invitation expires (7 days)
- `user_id` (UUID) - Links to auth.users after signup

These columns are required for the CSV invitation system to work.

