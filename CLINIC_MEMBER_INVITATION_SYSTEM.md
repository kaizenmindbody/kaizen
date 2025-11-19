# Clinic Member Invitation System - Implementation Guide

## Overview

This document describes the implementation of the **Clinic Member Invitation System** that allows CSV-uploaded clinic members to receive email invitations, create accounts, and log into the platform.

## Problem Solved

Previously, when clinic administrators uploaded members via CSV:
- ❌ Members were added to the `ClinicMembers` table only
- ❌ They had NO authentication credentials
- ❌ They could NOT log into the platform
- ❌ They did NOT receive any email notifications

Now, with the invitation system:
- ✅ Members receive automatic email invitations
- ✅ They can create their own secure accounts
- ✅ They can log in and access the platform
- ✅ Email verification is handled automatically

---

## System Architecture

### 1. Database Changes

**File:** `public/sql/add-invitation-tracking-to-clinic-members.sql`

Added the following columns to the `ClinicMembers` table:

```sql
- invitation_token        (TEXT)       - Unique token for invitation link
- invitation_status       (TEXT)       - Status: 'pending', 'accepted', 'registered'
- invitation_sent_at      (TIMESTAMP)  - When invitation was sent
- invitation_expires_at   (TIMESTAMP)  - When invitation expires (7 days)
- user_id                 (UUID)       - Links to auth.users after signup
```

### 2. API Endpoints

#### A. Send Invitations API
**File:** `src/app/api/clinic-members/send-invitations/route.ts`

**Purpose:** Send invitation emails to newly added clinic members

**Endpoint:** `POST /api/clinic-members/send-invitations`

**Request Body:**
```json
{
  "memberIds": ["uuid-1", "uuid-2"],
  "clinicName": "My Clinic"
}
```

**Process:**
1. Fetches member details from `ClinicMembers`
2. Generates secure random invitation token (64-char hex)
3. Updates member record with token and expiry (7 days)
4. Sends invitation email via Supabase Auth
5. Returns success/failure results

---

#### B. Verify Invitation API
**File:** `src/app/api/clinic-members/verify-invitation/route.ts`

**Purpose:** Verify invitation token and return member details for signup

**Endpoint:** `POST /api/clinic-members/verify-invitation`

**Request Body:**
```json
{
  "token": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "member": {
    "email": "doctor@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "phone": "+1234567890",
    "clinicName": "My Clinic"
  }
}
```

**Validations:**
- Token exists
- Token not expired
- Not already registered

---

#### C. Complete Invitation Signup API
**File:** `src/app/api/clinic-members/complete-invitation-signup/route.ts`

**Purpose:** Create auth account for invited member and link to ClinicMembers record

**Endpoint:** `POST /api/clinic-members/complete-invitation-signup`

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "securePassword123",
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+1234567890"
}
```

**Process:**
1. Verifies token is valid and not expired
2. Creates Supabase Auth user (email auto-confirmed)
3. Inserts user into `Users` table
4. Updates `ClinicMembers` record with:
   - `user_id` (links to auth user)
   - `invitation_status` = 'registered'
   - Clears `invitation_token`
5. Returns success with user details

---

### 3. Frontend Pages

#### Invitation Signup Page
**File:** `src/app/auth/signup/invitation/page.tsx`

**URL:** `/auth/signup/invitation?token=abc123...`

**Features:**
- Verifies invitation token on page load
- Pre-fills form with member data (email, name, phone)
- Collects password from user
- Handles signup via API
- Auto-logs in user after successful signup
- Redirects to dashboard

**User Experience:**
1. User clicks invitation link in email
2. Page loads and verifies token
3. Form is pre-filled with their info
4. They set their password
5. Account is created
6. Auto-logged in and redirected to dashboard

---

### 4. CSV Upload Integration

**File:** `src/app/profile/components/ManagePractitionerInfo.tsx`

**Modified Function:** `saveCSVPractitioners()`

**New Behavior:**
1. Saves members to `ClinicMembers` table (as before)
2. Collects IDs of newly inserted members
3. Fetches clinic name
4. Calls `/api/clinic-members/send-invitations` API
5. Shows toast notifications for success/failure

**User Feedback:**
- "Successfully added X practitioner(s) to your clinic"
- "Sending invitation emails..." (loading)
- "Sent X invitation email(s) successfully!"
- "Failed to send X invitation email(s)..."

---

## Complete User Flow

### Step 1: Clinic Admin Uploads CSV
1. Admin navigates to **Profile → Clinic Tab → Manage Practitioners**
2. Uploads CSV file with member emails (and optionally: firstname, lastname, phone, etc.)
3. Reviews preview table
4. Clicks "Add Members"

### Step 2: System Processing
1. Members are saved to `ClinicMembers` table
2. Invitation tokens are generated
3. Invitation emails are sent via Supabase Auth
4. Admin sees success confirmation

### Step 3: Member Receives Email
Member receives an email with:
- Welcome message
- Clinic name
- "Accept Invitation & Sign Up" button
- Invitation link with token
- 7-day expiry notice

### Step 4: Member Clicks Invitation Link
1. Redirected to `/auth/signup/invitation?token=abc123...`
2. Token is verified
3. Form is pre-filled with their info from CSV
4. They enter their password
5. They click "Create Account & Join Clinic"

### Step 5: Account Creation
1. Auth account is created in Supabase
2. User record is created in `Users` table
3. `ClinicMembers` record is updated with `user_id`
4. Member is auto-logged in
5. Redirected to dashboard

### Step 6: Member Can Now Log In
- Member can log in using their email and password
- They have full platform access
- They appear as a verified clinic member

---

## Database Migration

**IMPORTANT:** Run this SQL script to add invitation tracking:

```bash
# Navigate to project root
cd F:\kaizen

# Apply the migration
psql -h <your-supabase-host> -U postgres -d postgres -f public/sql/add-invitation-tracking-to-clinic-members.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `public/sql/add-invitation-tracking-to-clinic-members.sql`
3. Execute the SQL

---

## Environment Variables Required

Ensure these are set in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL (for invitation links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

---

## Email Configuration

The system uses **Supabase Auth's built-in email service** (`admin.inviteUserByEmail`).

### Email Template Customization

You can customize the invitation email template in Supabase Dashboard:

1. Go to **Authentication → Email Templates**
2. Select "Invite User" template
3. Customize the HTML/text
4. Use variables like `{{ .ConfirmationURL }}`, `{{ .Data.firstname }}`, etc.

### Alternative Email Providers

If you prefer to use a different email service (Resend, SendGrid, AWS SES):

1. Install email package: `npm install resend` (or your choice)
2. Create email utility in `src/lib/email.ts`
3. Update `send-invitations/route.ts` to use your email service instead of Supabase

---

## Security Considerations

### ✅ Security Features Implemented

1. **Secure Token Generation**
   - Uses `crypto.randomBytes(32)` for 64-character hex tokens
   - Virtually impossible to guess or brute-force

2. **Token Expiration**
   - Invitations expire after 7 days
   - Prevents indefinite access via old links

3. **Email Auto-Confirmation**
   - Invited users' emails are auto-confirmed
   - Safe because invitation was sent to that email

4. **One-Time Use Tokens**
   - Token is cleared after successful signup
   - Prevents token reuse

5. **Password Requirements**
   - Minimum 6 characters enforced
   - Users choose their own secure passwords

6. **Authorization Checks**
   - Only clinic owners can add members
   - Verified via RLS policies and API checks

### 🔒 Additional Security Recommendations

1. **Rate Limiting**
   - Add rate limiting to invitation endpoints
   - Prevent spam/abuse

2. **HTTPS Only**
   - Ensure production site uses HTTPS
   - Protects tokens in transit

3. **Token Rotation**
   - Consider shorter expiry for high-security needs
   - Allow re-sending invitations

---

## Testing Checklist

### Local Testing

- [ ] Run database migration
- [ ] Set environment variables
- [ ] Start development server
- [ ] Upload CSV with test members
- [ ] Verify invitation emails sent
- [ ] Click invitation link
- [ ] Complete signup
- [ ] Verify auto-login works
- [ ] Log out and log back in
- [ ] Verify member appears in clinic members list

### Edge Cases to Test

- [ ] Expired invitation token
- [ ] Already-used invitation token
- [ ] Invalid/missing token
- [ ] Duplicate email in CSV
- [ ] Member already has account
- [ ] Password too short
- [ ] Network errors during signup
- [ ] Email send failures

---

## Troubleshooting

### Issue: Invitation emails not sending

**Possible Causes:**
1. `SUPABASE_SERVICE_ROLE_KEY` not set
2. Supabase email service not configured
3. Email quota exceeded

**Solution:**
- Check Supabase Dashboard → Settings → API
- Verify email templates are configured
- Check Supabase logs for email errors

---

### Issue: "Invalid invitation token" error

**Possible Causes:**
1. Token expired (>7 days old)
2. Token already used
3. Token not in database

**Solution:**
- Check `ClinicMembers` table for the token
- Verify `invitation_expires_at` timestamp
- Re-send invitation if needed

---

### Issue: Members added but emails not sent

**Expected Behavior:**
- Members are added to database
- Email sending is a separate step
- Partial failure is possible

**Solution:**
- Check toast notifications for details
- Manually re-send invitations if needed
- Check API logs for email errors

---

## Future Enhancements

### Potential Improvements

1. **Resend Invitation Button**
   - Allow admins to resend invitations
   - Update expiry date on resend

2. **Invitation Status Dashboard**
   - Show invitation status in member list
   - Display: Pending, Accepted, Registered

3. **Custom Email Templates**
   - Rich HTML email templates
   - Clinic branding/logo in emails

4. **Bulk Operations**
   - Select multiple members
   - Resend invitations in bulk

5. **Analytics**
   - Track invitation acceptance rate
   - Show time-to-acceptance metrics

---

## Files Changed/Created

### New Files
1. `public/sql/add-invitation-tracking-to-clinic-members.sql`
2. `src/app/api/clinic-members/send-invitations/route.ts`
3. `src/app/api/clinic-members/verify-invitation/route.ts`
4. `src/app/api/clinic-members/complete-invitation-signup/route.ts`
5. `src/app/auth/signup/invitation/page.tsx`
6. `CLINIC_MEMBER_INVITATION_SYSTEM.md` (this file)

### Modified Files
1. `src/app/profile/components/ManagePractitionerInfo.tsx`
   - Updated `saveCSVPractitioners()` function
   - Updated info box text

---

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase logs
3. Check browser console for errors
4. Review API endpoint responses

---

## Summary

The Clinic Member Invitation System provides a complete, secure workflow for:
- Inviting members via CSV upload
- Sending automated invitation emails
- Allowing members to create accounts
- Enabling platform login and access

This solves the original problem where CSV-uploaded members had no way to log in or access the platform.
