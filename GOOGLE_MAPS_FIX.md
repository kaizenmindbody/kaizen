# Google Maps API Error Fix

## Problem
Google Maps is working locally but showing `InvalidKeyMapError` on the production server.

## Root Cause
The `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable is either:
1. Not set on your production server
2. Set with an invalid/empty value
3. The API key has domain restrictions that don't include your production domain

## Solution

### Step 1: Check Your Environment Variables on Production Server

Make sure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set on your hosting platform:

#### For Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = `your-api-key-here`
4. Make sure it's enabled for Production environment
5. Redeploy your application

#### For Netlify:
1. Go to Site settings → Build & deploy → Environment
2. Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = `your-api-key-here`
3. Redeploy your application

#### For Other Platforms:
Add the environment variable through your platform's dashboard and redeploy.

### Step 2: Verify Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Find your API key and click Edit
4. Under "Application restrictions":
   - If set to "HTTP referrers", add your production domain:
     - `your-domain.com/*`
     - `*.your-domain.com/*`
   - Or temporarily set to "None" for testing (not recommended for production)
5. Under "API restrictions":
   - Make sure these APIs are enabled:
     - Maps JavaScript API
     - Places API
     - Geocoding API

### Step 3: Enable Required APIs

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search and enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API** (if using geocoding)

### Step 4: Verify the Fix

After deploying with the correct environment variable:

1. Check browser console for errors
2. The map should load without the `InvalidKeyMapError`
3. If you still see errors, check:
   - API key is copied correctly (no extra spaces)
   - Domain restrictions include your production domain
   - Billing is enabled on your Google Cloud project

## Code Changes Made

1. **layout.tsx**: Added conditional rendering to only load the script if API key exists
2. **Location.tsx**: Added timeout handling and better error messages

## Testing

### Local Testing:
1. Create/update `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
   ```
2. Restart your dev server: `npm run dev`

### Production Testing:
1. Set environment variable on your hosting platform
2. Redeploy the application
3. Visit a page with a map
4. Check browser console for any errors

## Common Issues

### "This page can't load Google Maps correctly"
- Your API key is invalid or billing is not enabled
- Go to Google Cloud Console and enable billing

### Map shows but is grayed out with "For development purposes only"
- Billing is not enabled on your Google Cloud project
- Enable billing in Google Cloud Console

### "RefererNotAllowedMapError"
- Your domain is not added to the API key restrictions
- Add your production domain to HTTP referrer restrictions

## Support Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Maps API Error Messages](https://developers.google.com/maps/documentation/javascript/error-messages)
- [Managing API Keys](https://developers.google.com/maps/api-key-best-practices)
