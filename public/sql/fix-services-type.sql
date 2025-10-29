-- Simple fix: Update all existing services to have type = 'real'

-- Update all services that have NULL or missing type
UPDATE "Services"
SET type = 'real'
WHERE type IS NULL OR type = '';

-- Show the updated services
SELECT id, title, type, created_at
FROM "Services"
ORDER BY created_at DESC;
