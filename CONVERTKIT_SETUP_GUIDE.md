# ConvertKit Newsletter Form Setup Guide

## Overview

This guide explains how ConvertKit newsletter subscriptions work, how to configure email confirmations, and what settings are needed in your application.

---

## Table of Contents

1. [How ConvertKit Works](#how-convertkit-works)
2. [Email Confirmation Setup](#email-confirmation-setup)
3. [EMAIL_PASS Configuration (Optional)](#email_pass-configuration-optional)
4. [Troubleshooting](#troubleshooting)
5. [Testing Your Setup](#testing-your-setup)

---

## How ConvertKit Works

### What Happening?

When someone enters their email in the footer newsletter form:

1. **ConvertKit receives the subscription** - The email is sent directly to ConvertKit's servers
2. **ConvertKit sends confirmation email** - ConvertKit automatically sends a confirmation email to the subscriber
3. **Subscriber confirms** - User clicks the confirmation link in their email
4. **Subscription complete** - User is added to your ConvertKit email list

### Important Points

- ✅ **ConvertKit handles all confirmation emails** - Your application code doesn't send these
- ✅ **No EMAIL_PASS needed** - ConvertKit confirmation emails work without any configuration in your app
- ✅ **Form is already integrated** - The form in the footer is already set up and working

---

## Email Confirmation Setup

### Step 1: Check ConvertKit Form Settings

1. Go to [ConvertKit Dashboard](https://app.convertkit.com/)
2. Navigate to **Forms** → Find your form (UID: `b5dc5d3bda`)
3. Click on the form to edit it

### Step 2: Configure Double Opt-In (Recommended)

**Double Opt-In** means subscribers must confirm their email before being added to your list.

1. In your form settings, look for **"Double opt-in"** or **"Email confirmation"**
2. **Enable** double opt-in (recommended for better deliverability)
3. **Customize** the confirmation email template if desired
4. **Save** your changes

### Step 3: Check Email Delivery Settings

1. Go to **Settings** → **Email**
2. Verify your **sending domain** is configured
3. Check for any **delivery warnings** or issues
4. Ensure your account is in good standing

### Step 4: Customize Confirmation Email

1. In your form settings, go to **"Email Settings"** or **"Confirmation"**
2. Customize the confirmation email:
   - Subject line
   - Email content
   - Branding
   - Confirmation button text
3. **Save** your changes

---

## EMAIL_PASS Configuration (Optional)

### What is EMAIL_PASS?

`EMAIL_PASS` is **only needed** if you want to:

1. **Receive contact form submissions** via email (`/contact` form)
2. **Receive webhook notifications** when someone subscribes (optional feature)

### When EMAIL_PASS is NOT Needed

- ❌ ConvertKit confirmation emails (handled by ConvertKit)
- ❌ Newsletter subscription confirmations (handled by ConvertKit)
- ❌ Adding subscribers to ConvertKit list (handled by ConvertKit)

### How to Set Up EMAIL_PASS (If Needed)

#### Step 1: Get Gmail App Password

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to **App passwords** (or visit: https://myaccount.google.com/apppasswords)
4. Select **Mail** as the app
5. Select **Other (Custom name)** → Type "Kaizen App"
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### Step 2: Add to Environment Variables

Create or update `.env.local` file in your project root:

```env
# Email Configuration (for contact form and webhook notifications)
EMAIL_USER=hello@kaizenmindbody.com
EMAIL_PASS=your-16-character-app-password-here
ADMIN_EMAIL=hello@kaizenmindbody.com
```

**Important:**
- Remove spaces from the app password (use `abcdefghijklmnop` not `abcd efgh ijkl mnop`)
- Never commit `.env.local` to Git
- Restart your development server after adding environment variables

#### Step 3: Verify Setup

1. Test the contact form (`/contact` page)
2. Submit a test message
3. Check if you receive an email at `hello@kaizenmindbody.com`

---

## Troubleshooting

### Issue: Not Receiving Confirmation Emails

#### Check 1: Spam/Junk Folder
- ✅ Check your spam/junk folder
- ✅ Add ConvertKit to your email contacts/whitelist
- ✅ Check email filters

#### Check 2: ConvertKit Form Settings
- ✅ Verify double opt-in is enabled (if you want confirmations)
- ✅ Check form is published and active
- ✅ Verify form UID matches: `b5dc5d3bda`

#### Check 3: ConvertKit Account Status
- ✅ Ensure your ConvertKit account is active
- ✅ Check for any account warnings or limitations
- ✅ Verify email delivery settings in ConvertKit dashboard

#### Check 4: Form Integration
- ✅ Check browser console for JavaScript errors
- ✅ Verify ConvertKit script is loading (check Network tab)
- ✅ Test form submission and check ConvertKit dashboard for new subscribers

### Issue: Contact Form Not Sending Emails

This requires `EMAIL_PASS`:

1. ✅ Verify `EMAIL_PASS` is set in `.env.local`
2. ✅ Check app password is correct (no spaces)
3. ✅ Ensure `EMAIL_USER` matches the Gmail account
4. ✅ Restart your development server
5. ✅ Check server logs for email errors

### Issue: Webhook Notifications Not Working

This requires `EMAIL_PASS` and webhook setup:

1. ✅ Set up `EMAIL_PASS` (see above)
2. ✅ Configure webhook in ConvertKit dashboard:
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://yourdomain.com/api/convertkit-webhook`
   - Select event: **"Subscriber created"**
3. ✅ Test webhook by subscribing to your form

---

## Testing Your Setup

### Test 1: Newsletter Subscription

1. Go to your website footer
2. Enter a test email address
3. Click subscribe
4. **Check ConvertKit Dashboard**:
   - Go to **Subscribers**
   - Look for your test email
   - Check subscription status (pending/confirmed)
5. **Check your email inbox**:
   - Look for ConvertKit confirmation email
   - Check spam folder if not in inbox
   - Click confirmation link

### Test 2: Contact Form (If EMAIL_PASS is Set)

1. Go to `/contact` page
2. Fill out and submit the form
3. Check `hello@kaizenmindbody.com` inbox
4. Verify email was received

### Test 3: Webhook Notifications (If Set Up)

1. Subscribe to newsletter form
2. Check `hello@kaizenmindbody.com` inbox
3. Verify notification email was received

---

## Quick Reference

### ConvertKit Form UID
- **Form ID**: `b5dc5d3bda`
- **Script URL**: `https://modern-aging.kit.com/b5dc5d3bda/index.js`

### Environment Variables

```env
# Required for contact form and webhook notifications
EMAIL_USER=hello@kaizenmindbody.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=hello@kaizenmindbody.com
```

### ConvertKit Dashboard Links

- **Forms**: https://app.convertkit.com/forms
- **Subscribers**: https://app.convertkit.com/subscribers
- **Settings**: https://app.convertkit.com/settings
- **Webhooks**: https://app.convertkit.com/settings/webhooks

---

## Summary

### ✅ What Works Without Configuration

- Newsletter form submission
- ConvertKit confirmation emails
- Adding subscribers to ConvertKit list
- Displaying form in footer

### ⚙️ What Requires Configuration

- **Contact form emails** → Requires `EMAIL_PASS`
- **Webhook notifications** → Requires `EMAIL_PASS` + webhook setup
- **Custom confirmation emails** → Configure in ConvertKit dashboard

### 🔧 Common Issues

1. **No confirmation email** → Check ConvertKit form settings and spam folder
2. **Contact form not working** → Set up `EMAIL_PASS` in `.env.local`
3. **Form not showing** → Check browser console for JavaScript errors

---

## Need Help?

- **ConvertKit Support**: https://help.convertkit.com/
- **ConvertKit Documentation**: https://help.convertkit.com/en/articles
- **Check form in ConvertKit Dashboard**: https://app.convertkit.com/forms

---

## Next Steps

1. ✅ Configure ConvertKit form settings (double opt-in, confirmation email)
2. ⚙️ (Optional) Set up `EMAIL_PASS` for contact form
3. ⚙️ (Optional) Set up webhook for subscription notifications
4. ✅ Test newsletter subscription
5. ✅ Test contact form (if EMAIL_PASS is set)

