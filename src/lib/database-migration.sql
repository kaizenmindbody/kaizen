-- Add calendar_event_id column to Books table for Google Calendar integration
ALTER TABLE Books ADD COLUMN calendar_event_id TEXT;

-- Add index for calendar_event_id for better performance
CREATE INDEX idx_books_calendar_event_id ON Books(calendar_event_id);

-- Add book_number column if it doesn't exist (for multi-session appointments)
ALTER TABLE Books ADD COLUMN IF NOT EXISTS book_number TEXT;

-- Create index for book_number
CREATE INDEX IF NOT EXISTS idx_books_book_number ON Books(book_number);

-- Update the Books table to allow NULL patient_id for blocked slots
ALTER TABLE Books ALTER COLUMN patient_id DROP NOT NULL;
ALTER TABLE Books ALTER COLUMN price DROP NOT NULL;