# Google Calendar Integration Setup

This guide explains how to set up Google Calendar integration for the Kaizen medical booking platform.

## Overview

When patients book appointments, calendar events are automatically created and sent to both the patient and practitioner's Google Calendars with:
- Event details (practitioner, patient, service type, reason)
- Automatic reminders (24 hours and 30 minutes before)
- Email invitations to both parties

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Configure OAuth 2.0

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the consent screen if prompted
4. Set application type to "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Save the Client ID and Client Secret

### 3. Get Access and Refresh Tokens

You need to obtain OAuth tokens that allow the server to access Google Calendar on behalf of the practitioner:

```javascript
// Use this script to get tokens (run once during setup)
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URI'
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('Visit this URL:', authUrl);
// After visiting the URL and getting the code, exchange it for tokens:
// const { tokens } = await oauth2Client.getToken(code);
```

### 4. Environment Variables

Add these variables to your `.env.local` file:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_ACCESS_TOKEN=your_google_access_token_here
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
```

### 5. Database Migration

Run this SQL to add the calendar_event_id column to your Books table:

```sql
-- Add calendar_event_id column to Books table
ALTER TABLE Books ADD COLUMN calendar_event_id TEXT;

-- Add index for better performance
CREATE INDEX idx_books_calendar_event_id ON Books(calendar_event_id);
```

## How It Works

### Automatic Integration

The system automatically:

1. **Creates calendar events** when new bookings are made (POST /api/bookings)
2. **Updates calendar events** when bookings are modified (PUT /api/bookings)
3. **Deletes calendar events** when bookings are cancelled (DELETE /api/bookings)
4. **Skips calendar operations** for blocked time slots

### API Endpoints

- `POST /api/calendar` - Create calendar event for booking
- `PUT /api/calendar` - Update existing calendar event
- `DELETE /api/calendar` - Delete calendar event

### Event Details

Each calendar event includes:
- **Title**: "Medical Appointment - {service_type}"
- **Attendees**: Patient and practitioner email addresses
- **Duration**: 1 hour (configurable)
- **Reminders**: Email (24h before) + Popup (30min before)
- **Description**: Detailed appointment information

## Customization

### Time Zones

Default timezone is set to 'America/New_York'. Update in `src/lib/google-calendar.ts`:

```typescript
timeZone: 'Your/Timezone', // e.g., 'Europe/London', 'Asia/Tokyo'
```

### Event Duration

Default appointment duration is 1 hour. Modify in `formatDateTime()` function:

```typescript
endDate.setHours(hours + 2, minutes, 0, 0); // 2-hour appointment
```

### Reminders

Customize reminder settings in `createBookingEvent()`:

```typescript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 24 * 60 }, // 24 hours
    { method: 'popup', minutes: 15 },      // 15 minutes
  ],
}
```

## Testing

1. Make sure all environment variables are configured
2. Create a test booking through the application
3. Check that calendar events appear in both calendars
4. Test updating and cancelling appointments

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check API is enabled and credentials are correct
2. **Invalid Grant**: Refresh token may be expired, re-authenticate
3. **No calendar events**: Check environment variables and network connectivity
4. **Email not sent**: Verify attendee email addresses are valid

### Debug Mode

Enable detailed logging by adding console.log statements in:
- `src/lib/google-calendar.ts`
- `src/app/api/calendar/route.ts`

## Security Notes

- Store credentials securely (use environment variables)
- Use HTTPS in production
- Regularly rotate access tokens
- Monitor API usage in Google Cloud Console
- Consider implementing rate limiting for calendar operations