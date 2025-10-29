# Supabase Email Invitation Setup Guide

## Step 1: Configure SMTP Settings (Optional but Recommended for Production)

By default, Supabase provides email service for development, but it has rate limits. For production, you should configure a custom SMTP provider.

### Go to Supabase Dashboard:
1. Open your project at https://supabase.com/dashboard
2. Navigate to: **Project Settings** → **Auth** → **SMTP Settings**

### Enable Custom SMTP:
3. Toggle **Enable Custom SMTP**
4. Choose one of these providers:

#### Option A: Resend (Recommended - Easiest)
- Sign up at https://resend.com (3,000 free emails/month)
- Get your API key from the dashboard
- Configure in Supabase:
  - **Sender name**: Kaizen
  - **Sender email**: onboarding@yourdomain.com
  - **Host**: smtp.resend.com
  - **Port**: 465 (for SSL) or 587 (for TLS)
  - **Username**: resend
  - **Password**: Your Resend API key

#### Option B: SendGrid
- Sign up at https://sendgrid.com (12,000 free emails/month)
- Get your API key
- Configure in Supabase:
  - **Host**: smtp.sendgrid.net
  - **Port**: 587
  - **Username**: apikey
  - **Password**: Your SendGrid API key

#### Option C: Mailgun
- Sign up at https://mailgun.com (5,000 free emails/month)
- Configure in Supabase:
  - **Host**: smtp.mailgun.org
  - **Port**: 587
  - **Username**: Your Mailgun SMTP username
  - **Password**: Your Mailgun SMTP password

5. Click **Save**

## Step 2: Customize Email Templates

### Go to Email Templates:
1. In Supabase Dashboard: **Authentication** → **Email Templates**
2. Select **Invite user** template

### Customize the Invitation Email:
3. Edit the template with your custom HTML/text. Here's a suggested template:

```html
<h2>You're invited to join Kaizen!</h2>

<p>Hi {{ .Data.first_name }},</p>

{{ if .Data.custom_message }}
<p><em>{{ .Data.custom_message }}</em></p>
{{ end }}

<p>You've been invited to join Kaizen as a practitioner. Click the button below to create your account and get started:</p>

<p>
  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Accept Invitation
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This invitation link will expire in 24 hours.</p>

<p>If you didn't expect this invitation, you can safely ignore this email.</p>

<p>Best regards,<br>The Kaizen Team</p>
```

### Available Template Variables:
- `{{ .ConfirmationURL }}` - The invitation link
- `{{ .Email }}` - Invitee's email address
- `{{ .Data.first_name }}` - First name from metadata
- `{{ .Data.last_name }}` - Last name from metadata
- `{{ .Data.full_name }}` - Full name from metadata
- `{{ .Data.custom_message }}` - Custom message from invitation
- `{{ .Data.type }}` - User type (e.g., "Practitioner")

4. Click **Save**

## Step 3: Configure Redirect URL

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL to **Redirect URLs**:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
3. Click **Save**

## Step 4: Test the Invitation

1. Go to your app's admin panel or profile page
2. Send an invitation to a test email address
3. Check the email inbox (including spam folder)
4. Click the invitation link to verify it works

## Troubleshooting

### Not receiving emails?
1. **Check Spam folder** - Invitation emails often go to spam initially
2. **Verify SMTP settings** - Make sure your SMTP credentials are correct
3. **Check Supabase logs** - Go to **Project Settings** → **Logs** → **Auth Logs**
4. **Rate limits** - Default Supabase email has rate limits. Use custom SMTP for production
5. **Email provider verification** - Some providers require email domain verification

### Email sent but link doesn't work?
1. **Check Redirect URLs** - Make sure your callback URL is whitelisted
2. **Check link expiration** - Invitation links expire after 24 hours by default
3. **Check browser console** - Look for any JavaScript errors

### Need to change expiration time?
The default invitation expiration is 24 hours. To change this:
1. Go to **Authentication** → **Policies**
2. Modify the JWT expiration settings

## Environment Variables Check

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vbioebgdmwgrykkphupd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

## Security Notes

- ✅ Service role key is used server-side only (in API route)
- ✅ Never expose service role key to the client
- ✅ Invitation links expire automatically
- ✅ Users must set their own password when accepting invitation

## Next Steps

After the user accepts the invitation:
1. They'll be redirected to your app
2. They can complete their profile
3. They'll be automatically added to your database Users table

Your invitation system is now ready! 🎉
