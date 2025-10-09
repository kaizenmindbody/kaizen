# EventHost Setup Instructions

## 1. Create EventHosts Table in Supabase

Run the SQL script in `supabase_eventhost_table.sql` in your Supabase SQL Editor.

This will create:
- **EventHosts** table with the following fields:
  - `id` (UUID, primary key, references auth.users)
  - `user_id` (UUID, references Users table)
  - `business_name` (TEXT) - Event Host or Business Name
  - `website` (TEXT) - Host website URL
  - `bio` (TEXT) - Host biography/description
  - `instagram` (TEXT) - Instagram profile URL
  - `facebook` (TEXT) - Facebook profile URL
  - `tiktok` (TEXT) - TikTok profile URL
  - `linkedin` (TEXT) - LinkedIn profile URL
  - `host_image` (TEXT) - Host profile image URL
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- Row Level Security (RLS) policies for proper data access
- Automatic timestamp update trigger

## 2. What Has Been Implemented

### Types
- Created `EventHost` interface in `src/types/user.ts`

### Hook
- Updated `useEventHost` hook with:
  - `hostProfile` state for EventHost data
  - `fetchHostProfile()` function to load host profile
  - `updateHostProfile()` function to save host profile
  - Integrated into `refreshData()` to load all data together

### Components

#### ManageHostProfile Component
Updated with the following fields:
- Event Host or Business Name (required)
- Website
- Bio (textarea)
- Instagram URL
- Facebook URL
- TikTok URL
- LinkedIn URL
- Form validation and submission handling
- Success/error messages
- Auto-redirect to view profile after successful save

#### ViewHostProfile Component
Updated to display:
- Host Information section:
  - Event Host or Business Name
  - Website (clickable link)
  - Bio (with line breaks preserved)
- Social Media section:
  - Instagram (clickable link)
  - Facebook (clickable link)
  - TikTok (clickable link)
  - LinkedIn (clickable link)

### Main Page
- Updated `eventhost/page.tsx` to fetch and pass `hostProfile` data
- Integrated `updateHostProfile` function
- Passed props to ViewHostProfile and ManageHostProfile components

## 3. Features

✅ Create/Update host profile with business information
✅ Social media links management
✅ Automatic data refresh after updates
✅ Proper error handling
✅ Loading states
✅ Form validation
✅ Clean UI with success/error messages

## 4. Next Steps (Optional)

- Add image upload functionality for `host_image`
- Add form validation for URL formats
- Add character limits for bio field
- Add preview for social media links
