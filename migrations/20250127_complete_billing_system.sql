-- =====================================================
-- COMPLETE BILLING SYSTEM MIGRATION
-- Xainik Platform - Professional Billing & Invoicing
-- =====================================================

-- 1. Add Razorpay fields to existing tables
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS buyer_name text,
ADD COLUMN IF NOT EXISTS buyer_email text,
ADD COLUMN IF NOT EXISTS buyer_phone text,
ADD COLUMN IF NOT EXISTS plan_tier text,
ADD COLUMN IF NOT EXISTS plan_meta jsonb,
ADD COLUMN IF NOT EXISTS storage_key text;

ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS donor_name text,
ADD COLUMN IF NOT EXISTS donor_email text,
ADD COLUMN IF NOT EXISTS donor_phone text,
ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS storage_key text;

-- 2. Create payment events table for webhook idempotency
CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  payment_id text NOT NULL,
  order_id text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  event_type text NOT NULL,
  notes jsonb,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL, -- 'invoice' or 'receipt'
  document_id uuid NOT NULL,
  recipient_email text NOT NULL,
  message_id text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_razorpay_payment_id ON donations(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_donations_razorpay_order_id ON donations(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_razorpay_payment_id ON invoices(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_razorpay_order_id ON invoices(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_razorpay_payment_id ON receipts(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_razorpay_order_id ON receipts(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON payment_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_document_id ON email_logs(document_id);

-- 5. Create RLS policies for security
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Payment events policies (admin only)
CREATE POLICY "Admin can manage payment events" ON payment_events
  FOR ALL USING (auth.role() = 'service_role');

-- Email logs policies (admin only)
CREATE POLICY "Admin can manage email logs" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Add comments for documentation
COMMENT ON TABLE payment_events IS 'Stores Razorpay webhook events for idempotency';
COMMENT ON TABLE email_logs IS 'Tracks invoice and receipt email deliveries';
COMMENT ON COLUMN donations.razorpay_payment_id IS 'Razorpay payment ID for tracking';
COMMENT ON COLUMN donations.razorpay_order_id IS 'Razorpay order ID for tracking';
COMMENT ON COLUMN invoices.razorpay_payment_id IS 'Razorpay payment ID for tracking';
COMMENT ON COLUMN invoices.razorpay_order_id IS 'Razorpay order ID for tracking';
COMMENT ON COLUMN receipts.razorpay_payment_id IS 'Razorpay payment ID for tracking';
COMMENT ON COLUMN receipts.razorpay_order_id IS 'Razorpay order ID for tracking';
