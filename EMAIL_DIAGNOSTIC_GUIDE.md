# Email Invitation Diagnostic Guide

## Is it a Supabase Setup Issue or Code Issue?

Follow these steps to diagnose:

## Step 1: Check Server Logs

After sending an invitation, check your server console/logs. Look for:

### ✅ Code is Working (Supabase Setup Issue):
```
[SUCCESS] Invitation email sent to user@example.com via Supabase email service. User ID: xxx
```
- Code executed successfully
- Supabase API returned success
- **BUT** email not received = **Supabase email configuration issue**

### ❌ Code Issue:
```
[ERROR] Failed to send invitation to user@example.com: [error message]
```
- Code failed to call Supabase API
- Check the error message for details

## Step 2: Check Supabase Dashboard

### A. Check Auth Logs
1. Go to **Supabase Dashboard** → **Project Settings** → **Logs** → **Auth Logs**
2. Look for email sending events
3. Check for errors like:
   - "Email quota exceeded"
   - "SMTP configuration error"
   - "Email delivery failed"

### B. Check SMTP Configuration
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. **Is Custom SMTP enabled?**
   - ❌ **Not enabled** = Using default Supabase email (has rate limits, may not work in production)
   - ✅ **Enabled** = Check if credentials are correct

### C. Check Email Templates
1. Go to **Authentication** → **Email Templates**
2. Check if **"Invite user"** template exists and is configured
3. The template should have `{{ .ConfirmationURL }}` variable

## Step 3: Common Issues & Solutions

### Issue 1: Default Supabase Email Service (No SMTP Configured)

**Symptoms:**
- Code shows success
- No email received
- No errors in logs

**Solution:**
1. Configure Custom SMTP in Supabase:
   - Go to **Project Settings** → **Auth** → **SMTP Settings**
   - Enable **Custom SMTP**
   - Use Resend (recommended), SendGrid, or Mailgun
   - See `public/md/SUPABASE_EMAIL_SETUP.md` for details

### Issue 2: Email in Spam Folder

**Symptoms:**
- Code shows success
- Email not in inbox

**Solution:**
- Check spam/junk folder
- Check email filters
- Configure SPF/DKIM records for your domain (if using custom domain)

### Issue 3: Email Quota Exceeded

**Symptoms:**
- Code shows success initially
- Later emails fail
- Error in Supabase logs: "quota exceeded"

**Solution:**
- Check email quota in Supabase Dashboard
- Configure Custom SMTP for higher limits
- Wait for quota reset (if using free tier)

### Issue 4: SMTP Credentials Wrong

**Symptoms:**
- Code shows success
- Error in Supabase Auth Logs: "SMTP authentication failed"

**Solution:**
- Verify SMTP credentials in **Project Settings** → **Auth** → **SMTP Settings**
- Test credentials with email provider
- Check if using app password (for Gmail) or API key (for Resend/SendGrid)

### Issue 5: Redirect URL Not Configured

**Symptoms:**
- Email received
- Link doesn't work or redirects incorrectly

**Solution:**
1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/signup/invitation` (development)
   - `https://yourdomain.com/auth/signup/invitation` (production)

## Step 4: Test Email Sending Directly

### Test 1: Check if Supabase Email Works
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Invite User"** button
3. Enter a test email
4. Check if email is received

**If this works:** Code issue (our custom invitation flow)
**If this doesn't work:** Supabase email configuration issue

### Test 2: Check API Response
Look at server logs for the full response:
```
[DEBUG] inviteUserByEmail response for user@example.com: {
  hasData: true,
  hasUser: true,
  userId: "xxx",
  error: null
}
```

**If `hasUser: true` and `error: null`:** Code is working, Supabase should send email
**If `error` exists:** Check error message

## Step 5: Quick Fix Checklist

- [ ] Check server logs for `[SUCCESS]` or `[ERROR]` messages
- [ ] Check Supabase Dashboard → Logs → Auth Logs
- [ ] Verify SMTP is configured in Supabase
- [ ] Check spam folder
- [ ] Test Supabase's built-in "Invite User" feature
- [ ] Verify email template exists in Supabase
- [ ] Check email quota hasn't been exceeded
- [ ] Verify redirect URLs are configured

## Most Likely Issue

**If code shows success but no email received:**
- 90% chance: **Supabase SMTP not configured** (using default service with limits)
- 5% chance: Email in spam folder
- 5% chance: Email quota exceeded

**Solution:** Configure Custom SMTP in Supabase Dashboard (see `public/md/SUPABASE_EMAIL_SETUP.md`)

