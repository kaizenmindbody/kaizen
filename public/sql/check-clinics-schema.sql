-- =====================================================
-- CHECK CLINICS TABLE SCHEMA
-- =====================================================
-- Run this query to see the actual columns in your Clinics table

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Clinics'
ORDER BY ordinal_position;

-- Also check for any clinic_id columns in related tables
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'clinic_id'
ORDER BY table_name;
