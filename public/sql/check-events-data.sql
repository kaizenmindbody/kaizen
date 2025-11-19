-- Check if there are any events in the Events table
SELECT
  id,
  host_id,
  event_name,
  event_summary,
  event_start_datetime,
  event_end_datetime,
  address,
  status,
  created_at
FROM "Events"
ORDER BY created_at DESC
LIMIT 10;

-- Check total count
SELECT COUNT(*) as total_events FROM "Events";

-- Check events by status
SELECT
  status,
  COUNT(*) as count
FROM "Events"
GROUP BY status;
