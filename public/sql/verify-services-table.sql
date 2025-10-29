-- Verify Services table structure and data

-- 1. Check if Services table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'Services'
) AS table_exists;

-- 2. Show all columns in Services table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Services'
ORDER BY ordinal_position;

-- 3. Check if type column specifically exists
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Services'
    AND column_name = 'type'
) AS type_column_exists;

-- 4. Show all data in Services table (limit 10)
SELECT * FROM "Services" LIMIT 10;

-- 5. Count total services
SELECT COUNT(*) as total_services FROM "Services";
