# Ticket Tables Column Structure

This document outlines the complete database schema for the ticketing system, including Events, TicketTypes, TicketPurchases, EventWaivers, and WaiverSignatures tables.

---

## 1. Events Table

Stores all event information created by EventHosts.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique event identifier |
| **host_id** | UUID | NOT NULL, FOREIGN KEY → EventHosts(id) | Reference to event host |
| **event_name** | TEXT | NOT NULL | Name of the event |
| **event_summary** | TEXT | NOT NULL | Brief 2-3 sentence summary |
| **event_description** | TEXT | NOT NULL | Detailed event description |
| **what_to_bring** | TEXT | NULLABLE | What attendees should bring/not bring |
| **event_start_datetime** | TIMESTAMP WITH TIME ZONE | NOT NULL | Event start date and time |
| **event_end_datetime** | TIMESTAMP WITH TIME ZONE | NOT NULL | Event end date and time |
| **address** | TEXT | NOT NULL | Full event address (street, city, state, zip) |
| **hide_address** | BOOLEAN | DEFAULT FALSE | Hide address until user registers |
| **event_image** | TEXT | NULLABLE | URL to event image in storage |
| **enable_ticketing** | BOOLEAN | DEFAULT FALSE | Enable Kaizen ticketing system |
| **non_refundable** | BOOLEAN | DEFAULT FALSE | Event is non-refundable |
| **status** | TEXT | DEFAULT 'draft' | Event status: draft, published, cancelled, completed |
| **created_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| **updated_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_events_host_id` on host_id
- `idx_events_status` on status
- `idx_events_start_date` on event_start_datetime
- `idx_events_created_at` on created_at
- `idx_events_address` (GIN) on address for full-text search

**Constraints:**
- `check_event_dates`: event_end_datetime >= event_start_datetime

---

## 2. TicketTypes Table

Stores different ticket types for each event (e.g., General Admission, VIP, Early Bird).

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ticket type identifier |
| **event_id** | UUID | NOT NULL, FOREIGN KEY → Events(id) | Reference to parent event |
| **ticket_name** | TEXT | NOT NULL | Name of the ticket type |
| **description** | TEXT | NULLABLE | Optional ticket description |
| **max_quantity** | INTEGER | NOT NULL, DEFAULT 50, CHECK > 0 | Maximum tickets available |
| **sold_quantity** | INTEGER | DEFAULT 0, CHECK >= 0 | Number of tickets sold |
| **available_quantity** | INTEGER | GENERATED (max_quantity - sold_quantity) | Calculated available tickets |
| **sales_start_datetime** | TIMESTAMP WITH TIME ZONE | NOT NULL | When ticket sales begin |
| **sales_end_datetime** | TIMESTAMP WITH TIME ZONE | NOT NULL | When ticket sales end |
| **price** | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00, CHECK >= 0 | Ticket price |
| **requires_approval** | BOOLEAN | DEFAULT FALSE | Requires host approval to purchase |
| **suggested_pricing** | BOOLEAN | DEFAULT FALSE | Allow pay-what-you-want pricing |
| **is_sold_out** | BOOLEAN | DEFAULT FALSE | Manually marked as sold out |
| **is_active** | BOOLEAN | DEFAULT TRUE | Ticket type is active/available |
| **display_order** | INTEGER | DEFAULT 0 | Order for sorting ticket types |
| **created_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| **updated_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_ticket_types_event_id` on event_id
- `idx_ticket_types_active` on is_active
- `idx_ticket_types_display_order` on (event_id, display_order)

**Constraints:**
- `check_max_quantity`: max_quantity > 0
- `check_sold_quantity`: sold_quantity >= 0 AND sold_quantity <= max_quantity
- `check_price`: price >= 0
- `check_sales_dates`: sales_end_datetime >= sales_start_datetime

---

## 3. TicketPurchases Table

Tracks all ticket purchases/registrations by users.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique purchase identifier |
| **ticket_type_id** | UUID | NOT NULL, FOREIGN KEY → TicketTypes(id) | Reference to ticket type |
| **event_id** | UUID | NOT NULL, FOREIGN KEY → Events(id) | Reference to event (denormalized) |
| **user_id** | UUID | NOT NULL, FOREIGN KEY → Users(id) | Reference to purchasing user |
| **quantity** | INTEGER | NOT NULL, DEFAULT 1, CHECK > 0 | Number of tickets purchased |
| **price_paid** | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Price paid per ticket |
| **total_amount** | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Total amount paid (quantity × price_paid) |
| **attendee_name** | TEXT | NOT NULL | Name of attendee |
| **attendee_email** | TEXT | NOT NULL | Email of attendee |
| **attendee_phone** | TEXT | NULLABLE | Phone number of attendee |
| **status** | TEXT | DEFAULT 'pending' | Purchase status: pending, approved, rejected, cancelled, refunded, completed |
| **payment_status** | TEXT | DEFAULT 'pending' | Payment status: pending, paid, failed, refunded |
| **payment_intent_id** | TEXT | NULLABLE | Stripe payment intent ID |
| **payment_method** | TEXT | NULLABLE | Payment method used |
| **requires_approval** | BOOLEAN | DEFAULT FALSE | Purchase requires host approval |
| **approved_at** | TIMESTAMP WITH TIME ZONE | NULLABLE | When purchase was approved |
| **approved_by** | UUID | NULLABLE | Event host user_id who approved |
| **rejection_reason** | TEXT | NULLABLE | Reason for rejection if applicable |
| **checked_in** | BOOLEAN | DEFAULT FALSE | Attendee has checked in |
| **checked_in_at** | TIMESTAMP WITH TIME ZONE | NULLABLE | Check-in timestamp |
| **purchased_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | When purchase was made |
| **created_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| **updated_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_ticket_purchases_ticket_type_id` on ticket_type_id
- `idx_ticket_purchases_event_id` on event_id
- `idx_ticket_purchases_user_id` on user_id
- `idx_ticket_purchases_status` on status
- `idx_ticket_purchases_payment_status` on payment_status
- `idx_ticket_purchases_purchased_at` on purchased_at

**Constraints:**
- `check_quantity`: quantity > 0
- `check_price_paid`: price_paid >= 0
- `check_total_amount`: total_amount >= 0

---

## 4. EventWaivers Table (Optional - For Future Use)

Stores liability waivers or terms for events.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique waiver identifier |
| **event_id** | UUID | NOT NULL, FOREIGN KEY → Events(id) | Reference to event |
| **waiver_title** | TEXT | NOT NULL | Title of the waiver |
| **waiver_content** | TEXT | NOT NULL | Full waiver text/content |
| **is_required** | BOOLEAN | DEFAULT TRUE | Waiver is required for registration |
| **display_order** | INTEGER | DEFAULT 0 | Order for displaying multiple waivers |
| **created_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| **updated_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_event_waivers_event_id` on event_id

---

## 5. WaiverSignatures Table (Optional - For Future Use)

Tracks waiver signatures/agreements by users.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique signature identifier |
| **waiver_id** | UUID | NOT NULL, FOREIGN KEY → EventWaivers(id) | Reference to waiver |
| **user_id** | UUID | NOT NULL, FOREIGN KEY → Users(id) | Reference to user who signed |
| **ticket_purchase_id** | UUID | NOT NULL, FOREIGN KEY → TicketPurchases(id) | Reference to ticket purchase |
| **agreed** | BOOLEAN | DEFAULT FALSE | User agreed to waiver |
| **signature_data** | TEXT | NULLABLE | Digital signature data (if applicable) |
| **ip_address** | TEXT | NULLABLE | IP address of user when signing |
| **signed_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | When waiver was signed |
| **created_at** | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_waiver_signatures_user_id` on user_id
- `idx_waiver_signatures_purchase_id` on ticket_purchase_id

**Constraints:**
- UNIQUE(waiver_id, ticket_purchase_id) - One signature per waiver per purchase

---

## Database Relationships

```
EventHosts (1) ──→ (N) Events
    │
    └──→ (N) TicketTypes
            │
            └──→ (N) TicketPurchases ←── (N) Users
                     │
                     └──→ (N) WaiverSignatures ←── (N) EventWaivers
```

---

## Key Features

### Automatic Triggers

1. **update_updated_at_column()** - Automatically updates the `updated_at` field on all tables
2. **update_ticket_sold_quantity()** - Automatically updates `sold_quantity` when:
   - A purchase is made and payment status changes to 'paid'
   - A purchase is cancelled or refunded

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Event hosts can manage their own events and tickets
- Users can view their own purchases
- Public can view published events and active tickets

---

## Status Enums

### Event Status
- `draft` - Event is being created
- `published` - Event is live and visible
- `cancelled` - Event has been cancelled
- `completed` - Event has finished

### Purchase Status
- `pending` - Purchase awaiting approval or payment
- `approved` - Purchase has been approved (if required)
- `rejected` - Purchase was rejected by host
- `cancelled` - Purchase was cancelled by user
- `refunded` - Purchase was refunded
- `completed` - Purchase is complete and active

### Payment Status
- `pending` - Payment not yet processed
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment was refunded

---

## Example Queries

### Get all active tickets for an event
```sql
SELECT * FROM "TicketTypes"
WHERE event_id = 'event-uuid'
  AND is_active = TRUE
  AND is_sold_out = FALSE
  AND CURRENT_TIMESTAMP BETWEEN sales_start_datetime AND sales_end_datetime
ORDER BY display_order;
```

### Get purchase summary for an event
```sql
SELECT
  t.ticket_name,
  t.max_quantity,
  t.sold_quantity,
  t.available_quantity,
  SUM(p.quantity) as total_purchased,
  SUM(p.total_amount) as total_revenue
FROM "TicketTypes" t
LEFT JOIN "TicketPurchases" p ON t.id = p.ticket_type_id AND p.payment_status = 'paid'
WHERE t.event_id = 'event-uuid'
GROUP BY t.id, t.ticket_name, t.max_quantity, t.sold_quantity, t.available_quantity;
```

### Get user's upcoming events
```sql
SELECT DISTINCT e.*, tp.quantity, tp.status as purchase_status
FROM "Events" e
JOIN "TicketPurchases" tp ON e.id = tp.event_id
WHERE tp.user_id = 'user-uuid'
  AND tp.payment_status = 'paid'
  AND e.event_start_datetime > CURRENT_TIMESTAMP
ORDER BY e.event_start_datetime;
```
