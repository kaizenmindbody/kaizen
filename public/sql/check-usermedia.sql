-- Check if UserMedia table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'UserMedia'
) AS table_exists;

-- Count total media items
SELECT COUNT(*) as total_media_count FROM "UserMedia";

-- Count media by type
SELECT
  file_type,
  COUNT(*) as count
FROM "UserMedia"
GROUP BY file_type;

-- Show all media items with user info
SELECT
  um.id,
  um.user_id,
  u.email,
  CONCAT(u.firstname, ' ', u.lastname) as user_name,
  um.file_type,
  um.file_name,
  um.file_url,
  um.display_order,
  um.created_at
FROM "UserMedia" um
LEFT JOIN "Users" u ON um.user_id = u.id
ORDER BY um.created_at DESC
LIMIT 20;

-- Check for a specific practitioner (replace with actual user_id)
-- SELECT * FROM "UserMedia" WHERE user_id = 'your-practitioner-user-id-here';
