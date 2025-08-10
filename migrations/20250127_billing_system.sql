-- Automated Invoicing & 80G Receipt Management System
-- Migration: 20250127_billing_system.sql

-- 1. Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('docs', 'docs', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 2. Create fiscal year function
CREATE OR REPLACE FUNCTION fy_label(ts timestamptz DEFAULT now())
RETURNS text AS $$
BEGIN
  RETURN CASE 
    WHEN EXTRACT(month FROM ts) >= 4 
    THEN EXTRACT(year FROM ts)::text || '-' || (EXTRACT(year FROM ts) + 1)::text
    ELSE (EXTRACT(year FROM ts) - 1)::text || '-' || EXTRACT(year FROM ts)::text
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Create numbering state table
CREATE TABLE IF NOT EXISTS numbering_state (
  id text PRIMARY KEY,
  fy text NOT NULL,
  next_number integer NOT NULL DEFAULT 1,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create lock and next number function
CREATE OR REPLACE FUNCTION lock_numbering_and_next(prefix text, fy text)
RETURNS integer AS $$
DECLARE
  state_id text;
  next_num integer;
  lock_timeout interval := '30 seconds';
BEGIN
  state_id := prefix || '-' || fy;
  
  -- Try to insert or update with lock
  INSERT INTO numbering_state (id, fy, next_number, locked_until)
  VALUES (state_id, fy, 1, now() + lock_timeout)
  ON CONFLICT (id) DO UPDATE SET
    next_number = numbering_state.next_number + 1,
    locked_until = now() + lock_timeout,
    updated_at = now()
  WHERE numbering_state.locked_until < now()
  RETURNING next_number INTO next_num;
  
  -- If no row was updated, the lock is still active
  IF next_num IS NULL THEN
    RAISE EXCEPTION 'Numbering system locked for %', state_id;
  END IF;
  
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- 5. Create payment events table
CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  payment_id text NOT NULL,
  order_id text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  notes jsonb,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 6. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_event_id uuid REFERENCES payment_events(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  plan_tier text,
  plan_meta jsonb,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  storage_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 7. Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  payment_event_id uuid REFERENCES payment_events(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  donor_name text,
  donor_email text,
  donor_phone text,
  is_anonymous boolean NOT NULL DEFAULT false,
  storage_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 8. Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL, -- 'invoice' or 'receipt'
  document_id uuid NOT NULL,
  recipient_email text NOT NULL,
  message_id text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON payment_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(number);
CREATE INDEX IF NOT EXISTS idx_email_logs_document ON email_logs(document_type, document_id);

-- 10. RLS Policies

-- Payment events: admin only
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage payment events" ON payment_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Invoices: owner and admin
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage invoices" ON invoices
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Receipts: owner (by email) and admin
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (
    auth.jwt() ->> 'email' = donor_email OR 
    auth.jwt() ->> 'role' = 'admin'
  );
CREATE POLICY "Admin can manage receipts" ON receipts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Email logs: admin only
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage email logs" ON email_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Numbering state: admin only
ALTER TABLE numbering_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage numbering" ON numbering_state
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 11. Storage policies for docs bucket
CREATE POLICY "Authenticated users can upload docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'docs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'docs' AND (
      auth.jwt() ->> 'role' = 'admin' OR
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- 12. Add environment variables check function
CREATE OR REPLACE FUNCTION check_billing_env()
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'has_80g', current_setting('app.org_has_80g', true)::boolean,
    'org_name', current_setting('app.org_name', true),
    'org_address', current_setting('app.org_address', true),
    'org_pan', current_setting('app.org_pan', true),
    'org_80g_number', current_setting('app.org_80g_number', true)
  );
END;
$$ LANGUAGE plpgsql STABLE;
