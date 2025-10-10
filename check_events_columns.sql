-- Check what columns exist in the Events table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Events'
ORDER BY ordinal_position;
