# Events and Tickets Database Schema Documentation

## Overview

This document describes the database schema for the Event Management and Ticketing system for Kaizen. The schema supports EventHosts creating events, managing multiple ticket types, and tracking ticket purchases.

---

## Table Structure

### 1. **Events Table**

Stores all event information created by EventHosts.

#### Columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `host_id` | UUID | FK to EventHosts table |
| `event_name` | TEXT | Name of the event (required) |
| `event_summary` | TEXT | Brief 2-3 sentence summary (required) |
| `event_description` | TEXT | Detailed event description (required) |
| `what_to_bring` | TEXT | Optional: Items to bring or not bring |
| `event_start_datetime` | TIMESTAMPTZ | Event start date and time (required) |
| `event_end_datetime` | TIMESTAMPTZ | Event end date and time (required) |
| `address` | TEXT | Full event address (required) |
| `hide_address` | BOOLEAN | Hide address until registration (default: false) |
| `event_image` | TEXT | URL to event image in storage |
| `enable_ticketing` | BOOLEAN | Enable Kaizen ticketing (default: false) |
| `non_refundable` | BOOLEAN | Non-refundable event (default: false) |
| `status` | TEXT | draft/published/cancelled/completed (default: 'draft') |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Last updated timestamp |

#### Constraints:
- `event_end_datetime` must be >= `event_start_datetime`
- `host_id` references `EventHosts(id)` with CASCADE delete

#### Indexes:
- `idx_events_host_id` - For querying events by host
- `idx_events_status` - For filtering by status
- `idx_events_start_date` - For date range queries
- `idx_events_created_at` - For sorting by creation date

---

### 2. **TicketTypes Table**

Stores different ticket types for each event (General Admission, VIP, Early Bird, etc.).

#### Columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `event_id` | UUID | FK to Events table |
| `ticket_name` | TEXT | Name of ticket type (required) |
| `description` | TEXT | Optional description of ticket |
| `max_quantity` | INTEGER | Maximum tickets available (default: 50) |
| `sold_quantity` | INTEGER | Number of tickets sold (default: 0) |
| `available_quantity` | INTEGER | Computed: max_quantity - sold_quantity |
| `sales_start_datetime` | TIMESTAMPTZ | When ticket sales start (required) |
| `sales_end_datetime` | TIMESTAMPTZ | When ticket sales end (required) |
| `price` | DECIMAL(10,2) | Ticket price (default: 0.00) |
| `requires_approval` | BOOLEAN | Host must approve purchase (default: false) |
| `suggested_pricing` | BOOLEAN | Pay-what-you-want (default: false) |
| `is_sold_out` | BOOLEAN | Manually marked as sold out (default: false) |
| `is_active` | BOOLEAN | Ticket type is active (default: true) |
| `display_order` | INTEGER | For sorting ticket types (default: 0) |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Last updated timestamp |

#### Constraints:
- `sales_end_datetime` must be >= `sales_start_datetime`
- `max_quantity` must be > 0
- `sold_quantity` must be >= 0 and <= `max_quantity`
- `price` must be >= 0
- `event_id` references `Events(id)` with CASCADE delete

#### Indexes:
- `idx_ticket_types_event_id` - For querying tickets by event
- `idx_ticket_types_active` - For filtering active tickets
- `idx_ticket_types_display_order` - For sorting ticket types

#### Special Features:
- `available_quantity` is a **GENERATED column** (computed automatically)
- Automatically updates `sold_quantity` when purchases are made

---

### 3. **TicketPurchases Table**

Tracks all ticket purchases/registrations by users.

#### Columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `ticket_type_id` | UUID | FK to TicketTypes table |
| `event_id` | UUID | FK to Events table (denormalized) |
| `user_id` | UUID | FK to Users table |
| `quantity` | INTEGER | Number of tickets purchased (default: 1) |
| `price_paid` | DECIMAL(10,2) | Price paid per ticket |
| `total_amount` | DECIMAL(10,2) | Total amount (quantity × price_paid) |
| `attendee_name` | TEXT | Name of attendee |
| `attendee_email` | TEXT | Email of attendee |
| `attendee_phone` | TEXT | Phone of attendee (optional) |
| `status` | TEXT | pending/approved/rejected/cancelled/refunded/completed |
| `payment_status` | TEXT | pending/paid/failed/refunded |
| `payment_intent_id` | TEXT | Stripe payment intent ID |
| `payment_method` | TEXT | Payment method used |
| `requires_approval` | BOOLEAN | Needs host approval (default: false) |
| `approved_at` | TIMESTAMPTZ | When purchase was approved |
| `approved_by` | UUID | EventHost user ID who approved |
| `rejection_reason` | TEXT | Reason for rejection (if rejected) |
| `checked_in` | BOOLEAN | Checked in at event (default: false) |
| `checked_in_at` | TIMESTAMPTZ | When checked in |
| `purchased_at` | TIMESTAMPTZ | When purchase was made |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Last updated timestamp |

#### Constraints:
- `quantity` must be > 0
- `price_paid` must be >= 0
- `total_amount` must be >= 0
- References `TicketTypes(id)`, `Events(id)`, `Users(id)` with CASCADE delete

#### Indexes:
- `idx_ticket_purchases_ticket_type_id`
- `idx_ticket_purchases_event_id`
- `idx_ticket_purchases_user_id`
- `idx_ticket_purchases_status`
- `idx_ticket_purchases_payment_status`
- `idx_ticket_purchases_purchased_at`

#### Automatic Triggers:
- When `payment_status` changes to 'paid', automatically increments `sold_quantity` in TicketTypes
- When `payment_status` changes to 'cancelled' or 'refunded', automatically decrements `sold_quantity`

---

### 4. **EventWaivers Table** (Optional - For Future)

Stores liability waivers and terms for events.

#### Columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | FK to Events table |
| `waiver_title` | TEXT | Title of waiver |
| `waiver_content` | TEXT | Full waiver text |
| `is_required` | BOOLEAN | Must be signed (default: true) |
| `display_order` | INTEGER | Display order (default: 0) |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Last updated timestamp |

---

### 5. **WaiverSignatures Table** (Optional - For Future)

Tracks waiver signatures by users.

#### Columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `waiver_id` | UUID | FK to EventWaivers table |
| `user_id` | UUID | FK to Users table |
| `ticket_purchase_id` | UUID | FK to TicketPurchases table |
| `agreed` | BOOLEAN | User agreed (default: false) |
| `signature_data` | TEXT | Digital signature data |
| `ip_address` | TEXT | IP address of signature |
| `signed_at` | TIMESTAMPTZ | When signed |
| `created_at` | TIMESTAMPTZ | Created timestamp |

#### Unique Constraint:
- One signature per waiver per ticket purchase: `UNIQUE(waiver_id, ticket_purchase_id)`

---

## Row Level Security (RLS) Policies

### Events Table:
- ✓ Event hosts can view/insert/update/delete their own events
- ✓ Anyone can view published events

### TicketTypes Table:
- ✓ Event hosts can manage tickets for their own events
- ✓ Anyone can view active tickets for published events

### TicketPurchases Table:
- ✓ Users can view/insert their own purchases
- ✓ Event hosts can view/update purchases for their events (for approval/check-in)

### Waivers Tables:
- ✓ Event hosts can manage waivers for their events
- ✓ Users can view/sign waivers for events they're registering for

---

## Helper Functions

### `update_ticket_sold_quantity()`
Automatically maintains the `sold_quantity` field in TicketTypes:
- **Increments** when a purchase payment_status changes to 'paid'
- **Decrements** when a purchase is cancelled or refunded

This ensures accurate inventory tracking without manual updates.

---

## Usage Examples

### Creating an Event

```sql
INSERT INTO "Events" (
  host_id,
  event_name,
  event_summary,
  event_description,
  event_start_datetime,
  event_end_datetime,
  address,
  enable_ticketing,
  status
) VALUES (
  'host-uuid-here',
  'Yoga & Meditation Workshop',
  'Join us for a relaxing yoga and meditation session.',
  'Detailed description here...',
  '2025-11-01 09:00:00-07',
  '2025-11-01 12:00:00-07',
  '123 Main St, Los Angeles, CA 90001',
  true,
  'published'
);
```

### Creating Ticket Types

```sql
-- General Admission
INSERT INTO "TicketTypes" (
  event_id,
  ticket_name,
  description,
  max_quantity,
  sales_start_datetime,
  sales_end_datetime,
  price,
  display_order
) VALUES (
  'event-uuid-here',
  'General Admission',
  'Standard ticket for the event',
  100,
  '2025-10-01 00:00:00-07',
  '2025-11-01 08:00:00-07',
  25.00,
  1
);

-- VIP Ticket
INSERT INTO "TicketTypes" (
  event_id,
  ticket_name,
  description,
  max_quantity,
  sales_start_datetime,
  sales_end_datetime,
  price,
  display_order
) VALUES (
  'event-uuid-here',
  'VIP Access',
  'Includes early access and exclusive content',
  25,
  '2025-10-01 00:00:00-07',
  '2025-11-01 08:00:00-07',
  50.00,
  0
);
```

### Recording a Purchase

```sql
INSERT INTO "TicketPurchases" (
  ticket_type_id,
  event_id,
  user_id,
  quantity,
  price_paid,
  total_amount,
  attendee_name,
  attendee_email,
  payment_status
) VALUES (
  'ticket-type-uuid',
  'event-uuid',
  'user-uuid',
  2,
  25.00,
  50.00,
  'John Doe',
  'john@example.com',
  'paid'
);
```

### Querying Available Tickets

```sql
SELECT
  e.event_name,
  tt.ticket_name,
  tt.price,
  tt.available_quantity,
  tt.is_sold_out
FROM "TicketTypes" tt
JOIN "Events" e ON tt.event_id = e.id
WHERE e.status = 'published'
  AND tt.is_active = true
  AND NOW() BETWEEN tt.sales_start_datetime AND tt.sales_end_datetime
  AND (tt.available_quantity > 0 OR tt.is_sold_out = false)
ORDER BY e.event_start_datetime, tt.display_order;
```

### Getting Event Sales Summary

```sql
SELECT
  e.event_name,
  tt.ticket_name,
  tt.max_quantity,
  tt.sold_quantity,
  tt.available_quantity,
  tt.price,
  (tt.sold_quantity * tt.price) as total_revenue
FROM "Events" e
JOIN "TicketTypes" tt ON e.id = tt.event_id
WHERE e.host_id = 'host-uuid-here'
ORDER BY e.event_start_datetime DESC, tt.display_order;
```

---

## Installation

To create these tables in your Supabase database:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `create-events-tickets-tables.sql`
3. Execute the SQL script
4. Verify tables were created using the verification queries at the end

---

## Next Steps

### Immediate:
1. ✅ Create database tables (run SQL script)
2. Create API routes for event CRUD operations
3. Create API routes for ticket type management
4. Integrate ticket purchase flow with Stripe

### Future Enhancements:
1. Event categories/tags
2. Event images gallery (multiple images)
3. Recurring events support
4. Waitlist functionality
5. Discount codes/coupons
6. Email notifications for purchases
7. QR code generation for tickets
8. Event analytics dashboard

---

## Notes

- All tables use UUID for primary keys matching the existing schema
- All timestamps are stored with timezone (TIMESTAMPTZ)
- RLS policies ensure data security and proper access control
- The `sold_quantity` is automatically maintained via triggers
- `available_quantity` is a computed/generated column
- Foreign keys use CASCADE delete for data integrity

---

## Support

For questions or issues with this schema, please contact the development team.
