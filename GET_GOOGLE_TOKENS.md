# How to Get Google Access Token and Refresh Token

Follow these steps to obtain your Google Calendar API tokens for the Kaizen booking system.

## Prerequisites

1. **Google Cloud Project with Calendar API enabled**
2. **OAuth 2.0 credentials configured**

If you haven't set these up yet, follow the [Google Calendar Setup Guide](./GOOGLE_CALENDAR_SETUP.md) first.

## Step-by-Step Process

### 1. Configure OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth 2.0 Client IDs"
4. Set application type to "Web application"
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   https://yourdomain.com/api/auth/google/callback
   ```
6. Save and copy your **Client ID** and **Client Secret**

### 2. Update Token Generation Script

1. Open `scripts/get-google-tokens.js`
2. Replace the placeholder values:
   ```javascript
   const CLIENT_ID = 'your_actual_google_client_id';
   const CLIENT_SECRET = 'your_actual_google_client_secret';
   ```

### 3. Run the Token Generation Script

```bash
cd E:\working\Timon\kaizen
node scripts/get-google-tokens.js
```

### 4. Follow the OAuth Flow

1. **Visit the authorization URL** - The script will display a URL like:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=...
   ```

2. **Grant permissions** - You'll see a consent screen asking for calendar access

3. **Copy the authorization code** - After granting permission, you'll be redirected to:
   ```
   http://localhost:3000/api/auth/google/callback?code=AUTHORIZATION_CODE_HERE
   ```
   Copy the `code` parameter value

4. **Paste the code** - Enter it in the terminal when prompted

5. **Get your tokens** - The script will display:
   ```
   Access Token: ya29.a0AfH6SMC...
   Refresh Token: 1//04_Zx3...
   ```

### 5. Add Tokens to Environment

Add the tokens to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_ACCESS_TOKEN=ya29.a0AfH6SMC...
GOOGLE_REFRESH_TOKEN=1//04_Zx3...
```

## Alternative: Manual OAuth Flow

If the script doesn't work, you can do this manually:

### 1. Generate Auth URL

```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/api/auth/google/callback'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent'
});

console.log('Visit:', authUrl);
```

### 2. Exchange Code for Tokens

```javascript
const { tokens } = await oauth2Client.getToken('AUTHORIZATION_CODE_FROM_CALLBACK');
console.log('Access Token:', tokens.access_token);
console.log('Refresh Token:', tokens.refresh_token);
```

## Important Notes

### Token Lifecycle

- **Access Token**: Expires in ~1 hour, used for API calls
- **Refresh Token**: Long-lived, used to get new access tokens
- The system automatically refreshes access tokens using the refresh token

### Security Best Practices

1. **Never commit tokens to version control**
2. **Store tokens in environment variables only**
3. **Use HTTPS in production**
4. **Rotate tokens periodically**

### Troubleshooting

**"invalid_grant" error**:
- Make sure `access_type: 'offline'` and `prompt: 'consent'` are set
- Try generating new tokens

**"redirect_uri_mismatch" error**:
- Ensure redirect URI in Google Console matches exactly

**No refresh token received**:
- Add `prompt: 'consent'` to force consent screen
- Revoke existing app permissions and re-authorize

### Testing the Integration

After setting up tokens, test the calendar integration:

1. Create a test booking in your application
2. Check that calendar events appear in Google Calendar
3. Verify both patient and practitioner receive invitations

## Support

For issues with:
- **Google Cloud setup**: Check [Google Calendar API documentation](https://developers.google.com/calendar/api/quickstart/nodejs)
- **OAuth flow**: Visit [Google OAuth 2.0 guide](https://developers.google.com/identity/protocols/oauth2)
- **Application integration**: Check the logs in `src/app/api/calendar/route.ts`