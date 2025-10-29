# EventHost Avatar Upload - Setup Complete ✅

## What Was Added

Avatar upload functionality has been added to the EventHost profile management system.

---

## 1. Database Changes

### Add Avatar Column (if needed)

Run this SQL in Supabase if the `avatar` column doesn't exist:

```sql
-- Add avatar column to EventHosts table
ALTER TABLE "EventHosts" ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Verify column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'EventHosts'
  AND column_name IN ('avatar', 'host_image')
ORDER BY column_name;
```

**Note:** The table now has both `avatar` (for profile picture) and `host_image` (for future use).

---

## 2. Files Created/Updated

### ✅ API Route
**`src/app/api/eventhost/avatar/route.ts`** - NEW
- POST endpoint: Upload avatar to Supabase storage
- DELETE endpoint: Remove avatar
- Handles file upload, storage, and database update
- Automatically deletes old avatar when uploading new one

### ✅ TypeScript Types
**`src/types/user.ts`** - UPDATED
- Added `avatar?: string` to EventHost interface

### ✅ Hook
**`src/hooks/useEventHost.ts`** - UPDATED
- Added `avatar` field to updateHostProfile function
- Saves avatar URL to database

### ✅ Components

**`src/app/eventhost/components/ManageHostProfile.tsx`** - UPDATED
- Avatar upload with preview
- File input with image selection
- Shows selected file name
- Uploads to `/api/eventhost/avatar`
- Saves avatar URL with profile data

**`src/app/eventhost/components/ViewHostProfile.tsx`** - UPDATED
- Displays avatar image if available
- Shows initials fallback if no avatar

---

## 3. Features

✅ **Avatar Upload**
- Click "Change Photo" to select an image
- Shows preview of selected image
- Accepts image files (jpg, png, gif, etc.)
- Maximum file size handled by Supabase (default 50MB)

✅ **Storage**
- Uploaded to Supabase Storage bucket: `kaizen`
- Path: `eventhost/{userId}_eventhost_avatar_{timestamp}.{ext}`
- Automatically gets public URL

✅ **Database**
- Avatar URL saved to `EventHosts.avatar` column
- Associated with user's event host profile

✅ **Old File Cleanup**
- When uploading new avatar, automatically deletes old one
- Prevents storage clutter

---

## 4. Usage

### For Event Hosts:

1. **Login as Event Host**
2. **Navigate to**: Host → Manage Host Profile
3. **Upload Avatar**:
   - Click "Change Photo"
   - Select an image file
   - See preview of selected image
   - Click "Save Changes"
4. **View Profile**:
   - Avatar displays in "View Host Profile"
   - Avatar shows in all places event host profile is displayed

---

## 5. Storage Structure

```
Supabase Storage Bucket: kaizen
└── eventhost/
    ├── {userId}_eventhost_avatar_1234567890.jpg
    ├── {userId}_eventhost_avatar_1234567891.png
    └── ...
```

---

## 6. API Endpoints

### POST /api/eventhost/avatar

**Upload Event Host Avatar**

**Request:**
```typescript
FormData {
  userId: string        // User ID
  avatar: File         // Image file
  oldAvatarUrl?: string // Optional: URL of old avatar to delete
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  avatarUrl: string  // Public URL of uploaded avatar
}
```

### DELETE /api/eventhost/avatar

**Remove Event Host Avatar**

**Request:**
```typescript
{
  userId: string
  avatarUrl: string
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

---

## 7. Image Display

The avatar displays as:
- **Circular image** (20x20, w-20 h-20 rounded-full)
- **Fallback to initials** if no avatar uploaded
- **Object-cover** for proper image scaling
- **Next.js Image component** for optimization

---

## 8. Error Handling

✅ File upload errors caught and displayed
✅ Database update errors handled
✅ Storage errors logged
✅ User-friendly error messages shown in UI

---

## 9. Security

✅ **RLS Policies**: Users can only update their own EventHosts record
✅ **File Validation**: Server-side validation of uploads
✅ **Storage Access**: Public read, authenticated write
✅ **User Authentication**: Must be logged in to upload

---

## 10. Testing

1. **Upload Avatar**
   - Select image → Should see preview
   - Click Save → Should upload and display

2. **View Avatar**
   - Navigate to View Host Profile
   - Avatar should display correctly

3. **Update Avatar**
   - Upload new image
   - Old image should be deleted
   - New image should display

4. **No Avatar**
   - If no avatar uploaded, should show initials
   - Initials should use firstname/lastname from profile

---

## Summary

✅ Avatar column added to EventHosts table
✅ API route created for avatar upload/delete
✅ Components updated with upload UI
✅ Image preview and display working
✅ Storage and cleanup handled automatically
✅ Ready to use!

🎉 **Event hosts can now upload their profile pictures!**
