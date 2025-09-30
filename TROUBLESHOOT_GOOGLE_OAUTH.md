# Troubleshooting Google OAuth 403: access_denied Error

## The Problem
You're getting a 403 access_denied error when trying to authorize your Google Calendar integration. This is a common issue with new Google Cloud projects.

## Root Cause
Google requires OAuth apps to be verified OR you need to add test users during development.

## Solutions (Choose One)

### Option 1: Add Test Users (Recommended for Development)

1. **Go to Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project

2. **Navigate to OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"

3. **Add Test Users**:
   - Scroll down to "Test users" section
   - Click "ADD USERS"
   - Add your email address (the one you want to authorize)
   - Add any other email addresses that need access
   - Click "SAVE"

4. **Verify Publishing Status**:
   - Make sure your app is in "Testing" mode
   - You should see "Publishing status: Testing"

5. **Try Again**:
   - Run the token script again
   - The authorization should now work

### Option 2: Update OAuth Consent Screen Configuration

1. **Go to OAuth Consent Screen**:
   - "APIs & Services" > "OAuth consent screen"

2. **Check Application Type**:
   - Make sure "User Type" is set to "External" if you want any Google user to access
   - Or "Internal" if it's only for your organization

3. **Update Scopes**:
   - Click "EDIT APP"
   - Go to "Scopes" section
   - Make sure these scopes are added:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`

4. **Complete App Information**:
   - Fill in all required fields:
     - App name
     - User support email
     - Developer contact information
   - Add your domain if applicable

### Option 3: Use Different Redirect URI (Alternative)

If the above doesn't work, try using a different redirect URI:

1. **Update Google Cloud Console**:
   - Go to "Credentials" > Your OAuth 2.0 Client
   - Add this redirect URI: `urn:ietf:wg:oauth:2.0:oob`

2. **Update the script**:
   ```javascript
   const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';
   ```

3. **Modified OAuth Flow**:
   - The browser will show the authorization code directly
   - Copy it manually (no callback URL)

## Updated Token Generation Script

Here's a modified version that handles the manual code input better:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = '729791092410-dpgnulsbm7c05kfpgc5h4n98kv285or2.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // Manual code copy

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar'
];

function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('\n=== Google Calendar OAuth Setup ===\n');
  console.log('1. Visit this URL in your browser:');
  console.log('\x1b[36m%s\x1b[0m', authUrl);
  console.log('\n2. Sign in and grant permissions');
  console.log('3. Copy the authorization code that appears');
  console.log('4. Paste it below when prompted\n');

  return authUrl;
}

async function getTokens(authCode) {
  try {
    const { tokens } = await oauth2Client.getToken(authCode);

    console.log('\n=== SUCCESS! Your Google Calendar Tokens ===\n');
    console.log('Add these to your .env.local file:\n');
    console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error.message);
    throw error;
  }
}

async function main() {
  console.log('Starting Google Calendar OAuth token generation...\n');

  getAuthUrl();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the authorization code: ', async (authCode) => {
    try {
      await getTokens(authCode.trim());
      console.log('\n✅ Token generation complete!');
    } catch (error) {
      console.error('\n❌ Failed to get tokens:', error.message);
    } finally {
      rl.close();
    }
  });
}

if (require.main === module) {
  main();
}
```

## Step-by-Step Fix

### Immediate Solution:

1. **Add yourself as a test user**:
   - Google Cloud Console > APIs & Services > OAuth consent screen
   - Scroll to "Test users" section
   - Click "ADD USERS"
   - Add your email address
   - Save

2. **Try the authorization again**:
   ```bash
   node scripts/get-google-tokens.js
   ```

### Alternative Quick Fix:

If you want to avoid the test user setup, you can temporarily publish your app:

1. **Go to OAuth consent screen**
2. **Click "PUBLISH APP"**
3. **Confirm publishing**
4. **Run your token script**
5. **After getting tokens, you can unpublish if needed**

## Verification

After implementing the fix:

1. The authorization URL should work without 403 error
2. You should see the Google permission screen
3. After granting permission, you'll get the authorization code
4. The script will exchange it for access and refresh tokens

## Common Issues

- **Still getting 403**: Make sure you're signed into Google with the email you added as a test user
- **Invalid client**: Double-check your CLIENT_ID and CLIENT_SECRET
- **Redirect URI mismatch**: Ensure the redirect URI in your script matches what's in Google Cloud Console

Let me know if you need help with any of these steps!