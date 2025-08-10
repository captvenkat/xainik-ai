-- Payment Events Archive Table
-- Migration: 20250127_payment_events_archive.sql

-- Create archive table with same structure as payment_events
CREATE TABLE IF NOT EXISTS payment_events_archive (
  id uuid PRIMARY KEY,
  event_id text NOT NULL,
  payment_id text NOT NULL,
  order_id text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  notes jsonb,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  archived_at timestamptz DEFAULT now()
);

-- Create indexes for archive table
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_event_id ON payment_events_archive(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_payment_id ON payment_events_archive(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_order_id ON payment_events_archive(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_created_at ON payment_events_archive(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_archived_at ON payment_events_archive(archived_at);

-- RLS policies for archive table (admin only)
ALTER TABLE payment_events_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage payment events archive" ON payment_events_archive
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
