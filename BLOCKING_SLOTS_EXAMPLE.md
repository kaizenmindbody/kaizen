# Practitioner Slot Blocking Implementation

## Overview
Practitioners can now block time slots using the existing Books table with `service_type='blocked'`.

## API Usage

### Block a Time Slot
```javascript
// POST /api/bookings
const blockSlot = {
  practitioner_id: "practitioner-uuid-here",
  date: "2024-01-15",
  time: "09:00",
  service_type: "blocked"
  // patient_id, price, book_number will be automatically set to null
  // reason will be automatically set to "Personal appointment"
  // status will be set to "confirmed"
};

fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(blockSlot)
});
```

### Response
```json
{
  "message": "Time slot blocked successfully",
  "booking": {
    "id": "booking-uuid",
    "practitioner_id": "practitioner-uuid",
    "patient_id": null,
    "date": "2024-01-15",
    "time": "09:00",
    "service_type": "blocked",
    "price": null,
    "reason": "Personal appointment",
    "book_number": null,
    "status": "confirmed",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### Unblock a Time Slot
```javascript
// DELETE /api/bookings?book_number=BLOCKED_SLOT_ID
// Or delete by finding the specific blocked booking ID and using normal deletion
```

## Database Schema
Uses existing Books table with these values for blocked slots:
- `service_type`: "blocked"
- `patient_id`: null
- `price`: null
- `reason`: "Personal appointment"
- `book_number`: null
- `status`: "confirmed"

## UI Behavior

### Booking Page (Patient View)
- **Blocked slots**: Show as red/unavailable with tooltip "Unavailable - Personal appointment"
- **Booked slots**: Show as red/unavailable with tooltip "Already booked with this practitioner"
- **Available slots**: Show as green/clickable

### Profile Page (Practitioner View)
- Blocked slots will appear in the availability section as occupied slots
- Can toggle availability to block/unblock slots

## Benefits
1. **Unified data model**: All time slot occupancy in one table
2. **Existing API compatibility**: No new endpoints needed
3. **Simple implementation**: Leverages current booking infrastructure
4. **Consistent behavior**: Blocked slots behave like bookings in availability calculations