# Events Table - Column Names and Types

## Complete Column Structure

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | **UUID** | NO | `gen_random_uuid()` | Primary key (auto-generated) |
| `host_id` | **UUID** | NO | - | FK to EventHosts table |
| `event_name` | **TEXT** | NO | - | Name of the event |
| `event_summary` | **TEXT** | NO | - | Brief 2-3 sentence summary |
| `event_description` | **TEXT** | NO | - | Detailed event description |
| `what_to_bring` | **TEXT** | YES | `NULL` | Items to bring or not bring |
| `event_start_datetime` | **TIMESTAMP WITH TIME ZONE** | NO | - | Event start date and time |
| `event_end_datetime` | **TIMESTAMP WITH TIME ZONE** | NO | - | Event end date and time |
| `address` | **TEXT** | NO | - | Full event address |
| `hide_address` | **BOOLEAN** | NO | `FALSE` | Hide address until registration |
| `event_image` | **TEXT** | YES | `NULL` | URL to event image in storage |
| `enable_ticketing` | **BOOLEAN** | NO | `FALSE` | Enable Kaizen ticketing |
| `non_refundable` | **BOOLEAN** | NO | `FALSE` | Non-refundable event |
| `status` | **TEXT** | NO | `'draft'` | Event status (draft/published/cancelled/completed) |
| `created_at` | **TIMESTAMP WITH TIME ZONE** | NO | `NOW()` | Record creation timestamp |
| `updated_at` | **TIMESTAMP WITH TIME ZONE** | NO | `NOW()` | Last update timestamp |

---

## Column Names Only (Copy-Paste Ready)

```
id
host_id
event_name
event_summary
event_description
what_to_bring
event_start_datetime
event_end_datetime
address
hide_address
event_image
enable_ticketing
non_refundable
status
created_at
updated_at
```

---

## Data Types Summary

```
UUID (3 columns):
  - id
  - host_id

TEXT (7 columns):
  - event_name
  - event_summary
  - event_description
  - what_to_bring
  - address
  - event_image
  - status

TIMESTAMP WITH TIME ZONE (4 columns):
  - event_start_datetime
  - event_end_datetime
  - created_at
  - updated_at

BOOLEAN (3 columns):
  - hide_address
  - enable_ticketing
  - non_refundable
```

---

## Required vs Optional Fields

### Required (NOT NULL):
- `id` - Auto-generated
- `host_id` - Must specify event host
- `event_name` - Event name is required
- `event_summary` - Summary is required
- `event_description` - Description is required
- `event_start_datetime` - Start time is required
- `event_end_datetime` - End time is required
- `address` - Full address is required
- `hide_address` - Defaults to FALSE
- `enable_ticketing` - Defaults to FALSE
- `non_refundable` - Defaults to FALSE
- `status` - Defaults to 'draft'
- `created_at` - Auto-set
- `updated_at` - Auto-set

### Optional (NULL allowed):
- `what_to_bring` - Optional field
- `event_image` - Optional event image

---

## Constraints

1. **Foreign Key:**
   ```sql
   CONSTRAINT fk_event_host
     FOREIGN KEY (host_id) REFERENCES "EventHosts"(id) ON DELETE CASCADE
   ```

2. **Date Validation:**
   ```sql
   CONSTRAINT check_event_dates
     CHECK (event_end_datetime >= event_start_datetime)
   ```

3. **Status Check:**
   ```sql
   CHECK (status IN ('draft', 'published', 'cancelled', 'completed'))
   ```

---

## Indexes

```sql
CREATE INDEX idx_events_host_id ON "Events"(host_id);
CREATE INDEX idx_events_status ON "Events"(status);
CREATE INDEX idx_events_start_date ON "Events"(event_start_datetime);
CREATE INDEX idx_events_created_at ON "Events"(created_at);
CREATE INDEX idx_events_address ON "Events" USING gin(to_tsvector('english', address));  -- For address search
```

---

## SQL CREATE Statement

```sql
CREATE TABLE "Events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,

  -- Basic Event Information
  event_name TEXT NOT NULL,
  event_summary TEXT NOT NULL,
  event_description TEXT NOT NULL,
  what_to_bring TEXT,

  -- Date and Time
  event_start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Location Information
  address TEXT NOT NULL,
  hide_address BOOLEAN DEFAULT FALSE,

  -- Event Image
  event_image TEXT,

  -- Ticketing Settings
  enable_ticketing BOOLEAN DEFAULT FALSE,
  non_refundable BOOLEAN DEFAULT FALSE,

  -- Event Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_event_host FOREIGN KEY (host_id) REFERENCES "EventHosts"(id) ON DELETE CASCADE,
  CONSTRAINT check_event_dates CHECK (event_end_datetime >= event_start_datetime)
);
```

---

## TypeScript Interface

```typescript
interface Event {
  id: string;                           // UUID
  host_id: string;                      // UUID

  // Basic Information
  event_name: string;
  event_summary: string;
  event_description: string;
  what_to_bring?: string | null;

  // Date and Time
  event_start_datetime: string;         // ISO 8601 timestamp
  event_end_datetime: string;           // ISO 8601 timestamp

  // Location
  address: string;
  hide_address: boolean;

  // Media
  event_image?: string | null;

  // Settings
  enable_ticketing: boolean;
  non_refundable: boolean;

  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed';

  // Metadata
  created_at: string;                   // ISO 8601 timestamp
  updated_at: string;                   // ISO 8601 timestamp
}
```

---

## Sample Data

```sql
INSERT INTO "Events" (
  host_id,
  event_name,
  event_summary,
  event_description,
  what_to_bring,
  event_start_datetime,
  event_end_datetime,
  address,
  hide_address,
  event_image,
  enable_ticketing,
  non_refundable,
  status
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Sunset Yoga & Meditation',
  'Join us for a peaceful evening of yoga and meditation as the sun sets over the ocean. Perfect for all skill levels.',
  'Experience tranquility and inner peace in this guided yoga and meditation session. We will focus on breathing techniques, gentle stretching, and mindfulness practices to help you unwind from your day. The session takes place on the beach with stunning ocean views.',
  'Please bring: yoga mat, water bottle, towel, comfortable clothing. Do not bring: shoes (barefoot on beach), phones (silent/off)',
  '2025-11-15 17:00:00-08',
  '2025-11-15 19:00:00-08',
  '123 Ocean View Drive, Malibu, CA 90265',
  FALSE,
  'https://example.com/event-images/sunset-yoga.jpg',
  TRUE,
  FALSE,
  'published'
);
```

---

## Total: 16 Columns

- **3** UUID columns (id, host_id)
- **7** TEXT columns (event_name, event_summary, event_description, what_to_bring, address, event_image, status)
- **4** TIMESTAMP WITH TIME ZONE columns (event_start_datetime, event_end_datetime, created_at, updated_at)
- **3** BOOLEAN columns (hide_address, enable_ticketing, non_refundable)
