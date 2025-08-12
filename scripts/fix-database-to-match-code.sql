-- Fix database schema to match code expectations
-- Add missing columns that code expects

-- Add 'number' column to invoices (alias for invoice_number)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS number VARCHAR(50);
UPDATE invoices SET number = invoice_number WHERE number IS NULL;

-- Add 'amount' column to invoices (alias for amount_cents)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount INTEGER;
UPDATE invoices SET amount = amount_cents WHERE amount IS NULL;

-- Add 'plan_tier' column to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(50);

-- Add 'number' column to receipts (alias for receipt_number)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS number VARCHAR(50);
UPDATE receipts SET number = receipt_number WHERE number IS NULL;

-- Add 'amount' column to receipts (alias for amount_cents)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS amount INTEGER;
UPDATE receipts SET amount = amount_cents WHERE amount IS NULL;

-- Add 'donor_name' column to receipts
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS donor_name VARCHAR(255);

-- Add 'is_anonymous' column to receipts
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
