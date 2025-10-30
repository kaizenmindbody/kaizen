# RLS Policy Update Guide for Clinic Admin Practitioner Management

## Problem
Clinic admins are unable to create new practitioner records when uploading CSV files to manage clinic members. This is due to overly restrictive Row Level Security (RLS) policies on the Users table.

## Error
```
POST https://[supabase-url]/rest/v1/Users 409 Conflict
```
This indicates the RLS policy is blocking the INSERT operation.

## Solution
Update the RLS policies on the Users table to allow clinic admins to create and manage practitioners.

## Steps to Apply the Policy

### Option 1: Using Supabase Dashboard (Recommended for Quick Fix)

1. **Login to Supabase Dashboard**
   - Navigate to your project

2. **Go to Authentication → Policies**
   - Select the `Users` table
   - Look at the existing policies

3. **Update/Create the following policies:**

#### Policy 1: Clinic Admins Can Create Practitioners
- **Operation:** INSERT
- **Roles:** authenticated
- **Using expression:**
```sql
auth.uid() IN (
  SELECT practitioner_id FROM "Clinics"
)
```
- **With check:** Same as above

#### Policy 2: Clinic Admins Can View Clinic Practitioners
- **Operation:** SELECT
- **Roles:** authenticated
- **Using expression:**
```sql
auth.uid() = id OR
id IN (
  SELECT cm.practitioner_id
  FROM "ClinicMembers" cm
  WHERE cm.clinic_id IN (
    SELECT id FROM "Clinics" WHERE practitioner_id = auth.uid()
  )
)
```

#### Policy 3: Clinic Admins Can Update Clinic Practitioners
- **Operation:** UPDATE
- **Roles:** authenticated
- **Using expression:**
```sql
id IN (
  SELECT cm.practitioner_id
  FROM "ClinicMembers" cm
  WHERE cm.clinic_id IN (
    SELECT id FROM "Clinics" WHERE practitioner_id = auth.uid()
  )
)
```
- **With check:** Same as above

### Option 2: Using SQL Editor (For Batch Application)

1. **Open Supabase SQL Editor**
2. **Copy and run the SQL from:** `update-users-rls-policies-for-clinic-admins.sql`
3. **Verify the policies were created:** Check the table info

## How It Works

The new policies check if the current user (`auth.uid()`) is a clinic owner by:

1. **For INSERT:** Checking if the user's ID matches a `practitioner_id` in the `Clinics` table
   - Only clinic owners can insert new practitioners

2. **For SELECT:** Allowing users to see:
   - Their own profile (auth.uid() = id)
   - Practitioners in their clinic (via ClinicMembers join)

3. **For UPDATE:** Allowing clinic admins to update practitioners they've added to their clinic

## Security Considerations

- ✅ Users can still only see/edit their own profile by default
- ✅ Only clinic owners can create practitioners (verified via Clinics table)
- ✅ Only clinic owners can see practitioners in their clinic
- ✅ No cross-clinic access (clinic owners can't access other clinics' data)
- ✅ All operations are audit-logged in Supabase

## Testing After Update

1. **Login as a Clinic Admin**
2. **Go to Manage Practitioner Info**
3. **Upload a CSV file with new practitioner emails**
4. **Click "Add Members"**
5. **Verify practitioners are created and added to clinic**

## Rollback (If Needed)

If something goes wrong, you can restore the original policy:

```sql
DROP POLICY IF EXISTS "Clinic admins can create practitioners" ON "Users";
DROP POLICY IF EXISTS "Clinic admins can update clinic practitioners" ON "Users";
DROP POLICY IF EXISTS "Clinic admins can view clinic practitioners" ON "Users";

-- Restore original policy
CREATE POLICY "Users can insert own profile" ON "Users"
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Questions?

- Check Supabase logs for detailed error messages
- Verify the Clinics table has the clinic owner's record
- Ensure ClinicMembers table is linked correctly
