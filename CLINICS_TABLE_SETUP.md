# Clinics Table Setup - Complete Guide

## Summary

Created a **separate Clinics table** to store practitioner clinic/business profiles instead of storing clinic data directly in the Users table.

---

## What Was Changed

### 1. **New Database Table**
- Created `Clinics` table with all necessary fields
- File: `create-clinics-table.sql`

### 2. **Updated Code**
- Modified `UpdateClinicProfile.tsx` to use the Clinics table
- Changed data fetching from Users table to Clinics table
- Changed data saving to use `upsert` on Clinics table

---

## Clinics Table Structure

| Column Name | Type | Description |
|-------------|------|-------------|
| **id** | UUID | Unique clinic identifier |
| **practitioner_id** | UUID | References `users(id)` - who owns this clinic |
| **clinic_name** | TEXT | Clinic/business name |
| **clinic_website** | TEXT | Website URL |
| **clinic_phone** | TEXT | Business phone |
| **clinic_email** | TEXT | Business email |
| **clinic_address** | TEXT | Physical address (PlaceKit autocomplete) |
| **clinic_logo** | TEXT | Logo URL from storage |
| **created_at** | TIMESTAMP | When clinic profile was created |
| **updated_at** | TIMESTAMP | Last update (auto-updated) |

**Unique Constraint:** One clinic per practitioner (`practitioner_id`)

---

## Installation Steps

### Step 1: Create the Table
Run the SQL script in your Supabase SQL Editor:

```bash
# File to run:
create-clinics-table.sql
```

Or copy the SQL and run it in Supabase Dashboard → SQL Editor

### Step 2: Verify Creation
After running the script, verify the table was created:

```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Clinics'
ORDER BY ordinal_position;
```

### Step 3: Test the Updated Code
1. Login as a practitioner
2. Navigate to: Profile → Update Clinic Profile
3. Fill in clinic information
4. Click "Save All Changes"
5. Verify data is saved in the Clinics table

---

## Code Changes Made

### ✅ UpdateClinicProfile.tsx - Lines 101-124
**Changed:** Fetch clinic data from Clinics table instead of profile object

**Before:**
```typescript
useEffect(() => {
  if (profile) {
    setClinicInfo({
      clinic_name: profile.clinic || '',
      clinic_website: profile.clinic_website || '',
      // ... etc
    });
  }
}, [profile]);
```

**After:**
```typescript
useEffect(() => {
  const fetchClinicInfo = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('Clinics')
      .select('*')
      .eq('practitioner_id', profile.id)
      .single();

    if (data && !error) {
      setClinicInfo({
        clinic_name: data.clinic_name || '',
        clinic_website: data.clinic_website || '',
        // ... etc
      });
    }
  };

  fetchClinicInfo();
}, [profile]);
```

### ✅ UpdateClinicProfile.tsx - Lines 360-375
**Changed:** Save clinic data to Clinics table using upsert

**Before:**
```typescript
const { error: clinicError } = await supabase
  .from('Users')
  .update({
    clinic: clinicInfo.clinic_name,
    clinic_website: clinicInfo.clinic_website,
    // ... etc
  })
  .eq('id', profile.id);
```

**After:**
```typescript
const { error: clinicError } = await supabase
  .from('Clinics')
  .upsert({
    practitioner_id: profile.id,
    clinic_name: clinicInfo.clinic_name,
    clinic_website: clinicInfo.clinic_website,
    clinic_phone: clinicInfo.clinic_phone,
    clinic_email: clinicInfo.clinic_email,
    clinic_address: clinicInfo.clinic_address,
    clinic_logo: logoUrl,
  }, {
    onConflict: 'practitioner_id' // Update if exists, insert if not
  });
```

---

## Benefits of Separate Clinics Table

✅ **Better Data Organization**
- Clear separation between user accounts and clinic profiles
- Easier to query clinic-specific data

✅ **Proper Tracking**
- `id` - Unique identifier for each clinic
- `created_at` - When clinic profile was created
- `updated_at` - Last modification timestamp
- `practitioner_id` - Clear ownership tracking

✅ **Scalability**
- Can extend with additional clinic-specific fields
- Easy to add clinic staff, hours, etc. in the future

✅ **Security**
- Row Level Security (RLS) policies ensure practitioners can only manage their own clinics
- Public can view all clinics for directory/search

---

## Row Level Security (RLS) Policies

The table has the following security policies:

1. **Practitioners can view their own clinic**
   - `SELECT` using `practitioner_id = auth.uid()`

2. **Practitioners can insert their own clinic**
   - `INSERT` with check `practitioner_id = auth.uid()`

3. **Practitioners can update their own clinic**
   - `UPDATE` using `practitioner_id = auth.uid()`

4. **Practitioners can delete their own clinic**
   - `DELETE` using `practitioner_id = auth.uid()`

5. **Public can view all clinics**
   - `SELECT` using `true` (for directory/search functionality)

---

## How It Works

1. **Creating a Clinic Profile:**
   - Practitioner fills out "Update Clinic Profile" form
   - On save, code uses `upsert` to Clinics table
   - If clinic doesn't exist → creates new row
   - If clinic exists → updates existing row

2. **Loading Clinic Profile:**
   - Code fetches from Clinics table using `practitioner_id`
   - Populates form with existing data

3. **Tracking:**
   - `practitioner_id` identifies who owns the clinic
   - `created_at` shows when profile was first created
   - `updated_at` auto-updates on every save

---

## Testing Checklist

- [ ] Run `create-clinics-table.sql` in Supabase
- [ ] Verify table created successfully
- [ ] Login as practitioner
- [ ] Navigate to Profile → Update Clinic Profile
- [ ] Fill in clinic information
- [ ] Upload clinic logo
- [ ] Save changes
- [ ] Verify data saved in Clinics table
- [ ] Reload page and verify data loads correctly

---

## Files Modified/Created

### Created:
- ✅ `create-clinics-table.sql` - SQL script to create Clinics table
- ✅ `CLINICS_TABLE_SETUP.md` - This documentation file

### Modified:
- ✅ `src/app/profile/components/UpdateClinicProfile.tsx` - Updated to use Clinics table

---

## Questions?

If you encounter any issues:

1. Check Supabase logs for errors
2. Verify RLS policies are enabled
3. Ensure `update_updated_at_column()` function exists
4. Confirm practitioner is authenticated

---

## Next Steps (Optional Enhancements)

Future improvements you might consider:

- [ ] Add clinic business hours field (JSONB)
- [ ] Add clinic amenities (TEXT[])
- [ ] Add insurance providers accepted (TEXT[])
- [ ] Add clinic images gallery
- [ ] Add clinic staff management
- [ ] Add clinic verification status

---

**Status:** ✅ Complete and ready to use!
