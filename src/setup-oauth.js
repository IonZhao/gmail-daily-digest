import { google } from 'googleapis';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'
];

async function getRefreshToken() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  });

  console.log('\n=== Gmail OAuth 2.0 Setup ===\n');
  console.log('Follow these steps to get your refresh token:\n');
  console.log('1. Visit this URL in your browser:');
  console.log('\n' + authUrl + '\n');
  console.log('2. Log in with your Gmail account');
  console.log('3. Grant the requested permissions');
  console.log('4. Copy the authorization code\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code here: ', async (code) => {
    rl.close();

    try {
      const { tokens } = await oauth2Client.getToken(code);

      console.log('\n=== Success! ===\n');
      console.log('Add these to your GitHub Secrets or .env file:\n');
      console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('\nNote: Keep this refresh token secure!');

      if (!tokens.refresh_token) {
        console.log('\n⚠️  Warning: No refresh token received!');
        console.log('Make sure you:');
        console.log('1. Set access_type to "offline"');
        console.log('2. Use prompt: "consent" to force a new authorization');
        console.log('3. Revoke previous access at https://myaccount.google.com/permissions');
      }
    } catch (error) {
      console.error('Error retrieving access token:', error);
    }
  });
}

// Check if CLIENT_ID and CLIENT_SECRET are set
if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
  console.error('\n❌ Error: Missing OAuth credentials!\n');
  console.log('Please set the following in your .env file:');
  console.log('GMAIL_CLIENT_ID=your_client_id');
  console.log('GMAIL_CLIENT_SECRET=your_client_secret\n');
  console.log('Get these from: https://console.cloud.google.com/apis/credentials\n');
  process.exit(1);
}

getRefreshToken();
