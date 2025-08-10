# Cursor Execution Plan (Rolling)

## Checklist

- [x] Homepage CTAs wired (/pitch/new, /browse, footer links)
- [x] /browse page with Supabase queries, filters, pagination
- [x] /pitch/[id] Pitch Detail (SSR)
- [x] Refer modal + referral link creation
- [x] Like action (RLS-safe)
- [x] Request Resume flow + Resend email
- [x] Activity + referral events logging
- [x] /pitch/new AI-first flow (OpenAI + Razorpay + webhook)
- [x] /browse — Search + Filters + Pagination
- [x] Homepage polish (realtime ticker, donation snapshot, featured pitches)
- [x] Pricing page (plan cards, trial validation, Razorpay integration)
- [x] Donations page (KPIs, donation form, recent donations)
- [x] Dashboards (MVP slices for veteran, recruiter, supporter)
- [x] Housekeeping & SEO (sitemap, robots.txt, auto-expire, OG tags)
- [x] Minimal tests (openai.ts constraints, webhook verification, client validation)
- [x] Lighthouse mobile ≥ 90 (tune images, critical CSS, preconnect)

## Go-Live Readiness Sweep ✅

### A) Automated Smoke & RLS Tests ✅
- [x] `tests/smoke/health.test.ts` - Public routes 200 status
- [x] `tests/rls/permissions.test.ts` - RLS enforcement verification
- [x] Package.json updated with test script
- [x] Vitest configuration and setup

### B) Webhook & Email Dry Runs ✅
- [x] `scripts/dev/webhook-sim.ts` - Razorpay webhook simulation
- [x] `src/app/api/test-email/route.ts` - Resend email testing
- [x] Idempotency verification working
- [x] Email delivery confirmed

### C) Performance & Accessibility ✅
- [x] `scripts/perf/lighthouse.mjs` - Automated performance testing
- [x] `scripts/perf/urls.json` - Test URL configuration
- [x] Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 90
- [x] UI polish: button accessibility, focus rings, aria-labels

### D) SEO & OG Verification ✅
- [x] `scripts/seo/og-check.ts` - OG tag validation
- [x] Canonical URL verification
- [x] Sitemap validation (active pitches only)
- [x] Meta description length compliance

### E) Security Headers & Rate Limits ✅
- [x] `src/middleware/rateLimit.ts` - Rate limiting middleware
- [x] `src/lib/security/headers.test.ts` - Security headers verification
- [x] X-Content-Type-Options, X-Frame-Options, CSP headers
- [x] Rate limits: webhook (10/min), resume (5/min), general (100/min)

### F) Cron/Expiry & Ticker ✅
- [x] `scripts/dev/test-cron.ts` - Cron expiry testing
- [x] API key authentication working
- [x] Activity ticker integration verified
- [x] Expired pitch visibility testing

### G) Content & Legal ✅
- [x] `src/app/terms/page.tsx` - Terms of Service
- [x] `src/app/privacy/page.tsx` - Privacy Policy
- [x] `src/app/contact/page.tsx` - Contact form with Resend
- [x] `src/app/api/contact/route.ts` - Contact API endpoint
- [x] Cookie consent banner ready

### H) Prod Readiness Switch ✅
- [x] `docs/go-live-checklist.md` - Comprehensive checklist
- [x] Environment configuration verified
- [x] Security hardening complete
- [x] Monitoring setup documented
- [x] Launch day procedures defined

### I) Documentation Update ✅
- [x] `docs/decisions.md` - Added D-0010 to D-0013
- [x] `docs/cursor-plan.md` - Updated with go-live sweep results
- [x] All architectural decisions documented
- [x] Implementation rationale preserved

## Automated Invoicing & 80G Receipt Management ✅

### 1) ENV + Storage ✅
- [x] Environment variables configured for billing system
- [x] Supabase storage bucket "docs" created
- [x] All required ORG_* keys and billing settings ready

### 2) SQL Migrations ✅
- [x] `migrations/20250127_billing_system.sql` - Complete billing schema
- [x] `fy_label()` function for fiscal year computation
- [x] `numbering_state` table for sequential numbering
- [x] `lock_numbering_and_next()` RPC for concurrency control
- [x] `payment_events`, `invoices`, `receipts`, `email_logs` tables
- [x] RLS policies for owner/admin access control
- [x] Storage policies for secure document access

### 3) Libraries ✅
- [x] `src/lib/billing/numbering.ts` - FY computation and numbering
- [x] `src/lib/storage.ts` - PDF upload and signed URL generation
- [x] `src/lib/emails/sendInvoiceEmail.ts` - Invoice email dispatch
- [x] `src/lib/emails/sendReceiptEmail.ts` - Receipt email dispatch
- [x] `@react-pdf/renderer` installed and configured

### 4) React-PDF Components ✅
- [x] `src/pdfs/InvoicePDF.tsx` - Professional invoice template
- [x] `src/pdfs/DonationReceiptPDF.tsx` - 80G-compliant receipt template
- [x] Dynamic content rendering with proper styling
- [x] Organization details integration

### 5) Generators ✅
- [x] `src/lib/billing/invoices.ts` - `generateServiceInvoice()` function
- [x] `src/lib/billing/receipts.ts` - `generateDonationReceipt()` function
- [x] PDF generation → storage upload → DB insert → email dispatch
- [x] Returns {number, key, url} for complete workflow

### 6) Razorpay Webhook Branching ✅
- [x] Updated `src/app/api/razorpay/webhook/route.ts`
- [x] Event idempotency via `payment_events` table
- [x] Branch on `order.notes.type`:
  - "service" → `generateServiceInvoice()`
  - "donation" → `generateDonationReceipt()`
- [x] Proper error handling and logging

### 7) Signed Download API ✅
- [x] `src/app/api/docs/invoice/[id]/route.ts` - Invoice downloads
- [x] `src/app/api/docs/receipt/[id]/route.ts` - Receipt downloads
- [x] Session + ownership verification (RLS compliance)
- [x] Signed URL generation with TTL
- [x] Error states (404/403) handled

### 8) Dashboard Wiring ✅
- [x] Veteran dashboard: Invoices table with download links
- [x] Supporter dashboard: Donation receipts table with download links
- [x] Real-time data from database (no dummy data)
- [x] Proper RLS enforcement throughout

### 9) Tests & Documentation ✅
- [x] `tests/billing/numbering.test.ts` - FY computation tests
- [x] `tests/billing/webhook-idempotency.test.ts` - Idempotency verification
- [x] `tests/billing/fy-boundary.test.ts` - FY boundary tests with mocked dates
- [x] All tests passing with proper mocking
- [x] Documentation updated with billing system details

## Billing UAT Scripts ✅

### 1) E2E Test Helpers ✅
- [x] `scripts/test-payments/servicePurchase.ts` - Complete service purchase flow testing
- [x] `scripts/test-payments/donation.ts` - Complete donation flow testing
- [x] Webhook payload generation with HMAC signatures
- [x] Database verification (payment_events, invoices/receipts, storage, email_logs)
- [x] CLI execution with parameterized testing

### 2) Protection Test Route ✅
- [x] `src/app/api/dev/check/rls` - RLS policy verification
- [x] Cross-user access testing for all billing tables
- [x] Admin-only access verification
- [x] Development-only access (DEV_TEST_ROUTES=true)

### 3) Admin Export Routes ✅
- [x] `src/app/api/admin/export/invoices.csv` - Invoice export with payment details
- [x] `src/app/api/admin/export/receipts.csv` - Receipt export with donor details
- [x] CSV streaming with proper headers
- [x] Admin-only access control
- [x] Real-time data from database

### 4) Backup Cron Route ✅
- [x] `src/app/api/cron/archive-payment-events` - Automated archiving
- [x] `migrations/20250127_payment_events_archive.sql` - Archive table creation
- [x] 180-day retention policy
- [x] Admin API key authentication
- [x] Complete audit trail preservation

### 5) FY Boundary Unit Test ✅
- [x] `tests/billing/fy-boundary.test.ts` - Comprehensive boundary testing
- [x] March 31 23:59 and April 1 00:01 Asia/Kolkata scenarios
- [x] Leap year handling
- [x] Multiple year transitions
- [x] Edge case coverage

### 6) UAT Page ✅
- [x] `src/app/uat/billing` - Comprehensive UAT interface
- [x] Last 10 invoices with signed download links
- [x] Last 10 receipts with signed download links
- [x] Test script documentation
- [x] System status indicators
- [x] Development-only access (DEV_UAT=true)

## UAT Checklist & Runbook

### Pre-UAT Setup
1. **Environment Variables**:
   ```bash
   DEV_TEST_ROUTES=true
   DEV_UAT=true
   CRON_API_KEY=your-secure-key
   ```

2. **Database Migration**:
   ```bash
   # Apply archive table migration
   npx supabase db push
   ```

3. **Test Data Preparation**:
   - Ensure test user accounts exist
   - Verify Razorpay webhook secret is configured
   - Confirm Resend API key is working

### UAT Execution Steps

#### 1. Service Purchase Testing
```bash
# Test basic service purchase
node scripts/test-payments/servicePurchase.ts test-user-123 premium 29900 "Test User" test@example.com +919876543210

# Test with custom pitch data
node scripts/test-payments/servicePurchase.ts test-user-456 basic 19900 "Veteran User" veteran@example.com +919876543211
```

**Expected Results**:
- ✅ Payment event created in database
- ✅ Invoice generated with proper numbering
- ✅ PDF uploaded to storage bucket
- ✅ Email sent with message ID logged
- ✅ Signed download URL accessible

#### 2. Donation Testing
```bash
# Test named donation
node scripts/test-payments/donation.ts 50000 "John Doe" john@example.com +919876543212 false

# Test anonymous donation
node scripts/test-payments/donation.ts 25000 "Anonymous" anonymous@example.com +919876543213 true
```

**Expected Results**:
- ✅ Payment event created in database
- ✅ Receipt generated with 80G compliance
- ✅ PDF uploaded to storage bucket
- ✅ Email sent (for named donations only)
- ✅ Activity log entry created
- ✅ Signed download URL accessible

#### 3. RLS Protection Verification
```bash
# Access RLS check endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/api/dev/check/rls
```

**Expected Results**:
- ✅ Cross-user access blocked for invoices
- ✅ Cross-user access blocked for receipts
- ✅ Admin-only tables properly protected
- ✅ RLS policies working correctly

#### 4. Admin Export Testing
```bash
# Export invoices (requires admin authentication)
curl -H "Authorization: Bearer ADMIN_JWT" http://localhost:3000/api/admin/export/invoices.csv

# Export receipts (requires admin authentication)
curl -H "Authorization: Bearer ADMIN_JWT" http://localhost:3000/api/admin/export/receipts.csv
```

**Expected Results**:
- ✅ CSV files generated with proper headers
- ✅ All invoice/receipt data included
- ✅ Payment IDs linked correctly
- ✅ Proper date formatting

#### 5. Archive Cron Testing
```bash
# Test archive functionality (requires API key)
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_API_KEY" \
  http://localhost:3000/api/cron/archive-payment-events
```

**Expected Results**:
- ✅ Old payment events moved to archive
- ✅ Original table cleaned up
- ✅ Archive timestamp preserved
- ✅ No data loss during migration

#### 6. UAT Page Verification
```bash
# Access UAT page (requires DEV_UAT=true)
open http://localhost:3000/uat/billing
```

**Expected Results**:
- ✅ Recent invoices displayed with download links
- ✅ Recent receipts displayed with download links
- ✅ All system status indicators green
- ✅ Test script documentation visible

### Post-UAT Verification

#### 1. Database Integrity
- [ ] All payment events have corresponding invoices/receipts
- [ ] All documents have valid storage keys
- [ ] Email logs contain message IDs
- [ ] RLS policies prevent unauthorized access

#### 2. Storage Verification
- [ ] PDF files accessible via signed URLs
- [ ] Storage bucket permissions correct
- [ ] No orphaned files in storage

#### 3. Email Delivery
- [ ] Invoice emails received with download links
- [ ] Receipt emails received (for named donations)
- [ ] Message IDs logged in database

#### 4. Security Validation
- [ ] Cross-user access properly blocked
- [ ] Admin-only routes protected
- [ ] Signed URLs expire correctly
- [ ] API keys required for sensitive operations

### Production Readiness Checklist

#### Environment Configuration
- [ ] All ORG_* environment variables set
- [ ] Razorpay webhook secret configured
- [ ] Resend API key verified
- [ ] Supabase service role key configured
- [ ] Storage bucket permissions set

#### Database Setup
- [ ] All migrations applied
- [ ] RLS policies active
- [ ] Indexes created for performance
- [ ] Archive table ready for use

#### Monitoring & Alerts
- [ ] Webhook failure monitoring
- [ ] Email delivery tracking
- [ ] Storage usage monitoring
- [ ] Database performance metrics

#### Documentation
- [ ] UAT runbook completed
- [ ] Admin procedures documented
- [ ] Troubleshooting guide available
- [ ] Support contact information updated

## Notes
- Tailwind v4 used with custom gradient helpers in `globals.css`.
- Supabase anon client helper in `src/lib/supabaseClient.ts`.
- All data must pass RLS; no service-role on client.
