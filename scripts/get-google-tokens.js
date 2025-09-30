const { google } = require('googleapis');
const readline = require('readline');

// Replace these with your actual Google OAuth credentials
const CLIENT_ID = '729791092410-dpgnulsbm7c05kfpgc5h4n98kv285or2.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'; // Manual code copy method

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes for Google Calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Step 1: Get authorization URL
function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important: This ensures we get a refresh token
    scope: SCOPES,
    prompt: 'consent' // Force consent screen to ensure refresh token
  });

  console.log('\n=== Google Calendar OAuth Setup ===\n');
  console.log('1. Visit this URL in your browser:');
  console.log('\x1b[36m%s\x1b[0m', authUrl);
  console.log('\n2. Sign in and grant permissions');
  console.log('3. Copy the authorization code that Google shows you');
  console.log('4. Paste it below when prompted\n');

  return authUrl;
}

// Step 2: Exchange authorization code for tokens
async function getTokens(authCode) {
  try {
    const { tokens } = await oauth2Client.getToken(authCode);

    console.log('\n=== SUCCESS! Your Google Calendar Tokens ===\n');
    console.log('Access Token:');
    console.log('\x1b[32m%s\x1b[0m', tokens.access_token);
    console.log('\nRefresh Token:');
    console.log('\x1b[32m%s\x1b[0m', tokens.refresh_token);

    console.log('\n=== Add these to your .env.local file ===\n');
    console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

    console.log('\n=== Token Details ===');
    console.log('Token Type:', tokens.token_type);
    console.log('Expires In:', tokens.expiry_date ? new Date(tokens.expiry_date) : 'N/A');
    console.log('Scope:', tokens.scope);

    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error.message);
    throw error;
  }
}

// Main function to run the OAuth flow
async function main() {
  console.log('Starting Google Calendar OAuth token generation...\n');

  // Check if credentials are configured
  if (CLIENT_ID === 'your_google_client_id_here' || CLIENT_SECRET === 'your_google_client_secret_here') {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: Please update CLIENT_ID and CLIENT_SECRET in this script first!');
    console.log('\nGet these from: https://console.cloud.google.com/apis/credentials');
    process.exit(1);
  }

  // Step 1: Display auth URL
  getAuthUrl();

  // Step 2: Get authorization code from user
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

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getAuthUrl, getTokens };