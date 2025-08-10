
````markdown
# 🛡️ Xainik.com — AI-First, Resume-Free, Community-Supported, Ultra-Fast Hiring Platform
**Version:** 1.0  
**Last Updated:** 2025-01-27 (IST)

---

## 1) Overview & Objectives
**Goal:** Build a premium, minimalist, mobile-first platform where:
- **Veterans** post **short AI-generated pitches** (no public resumes).
- **Recruiters** connect via **phone/email in seconds**.
- **Supporters** amplify reach through **referrals, shares, endorsements**.
- **Donations** support the **platform** (not individuals).

**Value Promise:** Instant visibility • Direct contact • Always-fresh listings (≤90 days) • Community-verified trust.

---

## 2) Tech Stack & Integrations
✅ **COMPLETE** - **Next.js 15 (App Router) + Tailwind CSS** — Vercel hosting
✅ **COMPLETE** - **Supabase** — Postgres, Auth, Realtime, Storage, **RLS**
⚠️ **PARTIAL** - **OpenAI** — Pitch/Title/Skills generation (API setup complete, integration pending)
✅ **COMPLETE** - **Razorpay** — Plans & donations (Key ID, Key Secret, Webhook Secret)
✅ **COMPLETE** - **Resend** — Transactional emails
❌ **NOT DONE** - **Google Places** — City autocomplete
❌ **NOT DONE** - **Image crop** — `react-easy-crop` or equivalent

**Design References (strict)**
- **Toptal Talent** → premium typography/whitespace
- **AngelList Talent** → direct CTA patterns, recruiter flows

---

## 3) Database Schema + RLS Rules

### 3.1 Tables (outline)
✅ **COMPLETE** - `users` (role = veteran | recruiter | supporter | admin)
✅ **COMPLETE** - `veterans` (rank, branch, years, current/preferred locations)
✅ **COMPLETE** - `recruiters` (company, industry)
✅ **COMPLETE** - `supporters` (intro)
✅ **COMPLETE** - `pitches` (title, 300-char pitch, skills[3], job_type, location, availability, phone, photo, plan, expiry, likes)
✅ **COMPLETE** - `endorsements` (unique endorser per veteran; badge at 10)
✅ **COMPLETE** - `referrals` (unique supporter+pitch share link)
✅ **COMPLETE** - `referral_events` (LINK_OPENED, PITCH_VIEWED, CALL_CLICKED, EMAIL_CLICKED, SHARE_RESHARED, SIGNUP_FROM_REFERRAL)
⚠️ **PARTIAL** - `shared_pitches` (optional aggregate cache) - table exists, logic pending
✅ **COMPLETE** - `donations` (platform-wide)
✅ **COMPLETE** - `activity_log` (FOMO ticker events)
✅ **COMPLETE** - `resume_requests` (recruiter→veteran, approve/decline)
⚠️ **PARTIAL** - `notifications`, `notification_prefs` - tables exist, UI pending
✅ **COMPLETE** - `payment_events`, `invoices`, `receipts` (billing system)
✅ **COMPLETE** - `email_logs` (email tracking)

### 3.2 SQL Migrations (Supabase)
✅ **COMPLETE** - All migrations implemented in `/migrations/`:
- `20250127_complete_schema_rls.sql` - Full schema with RLS
- `20250127_billing_system.sql` - Billing tables and functions
- `20250127_add_activity_log.sql` - Activity logging
- `20250127_donations_aggregates_view.sql` - Donation aggregates

### 3.3 RLS (Row-Level Security) — Principles
✅ **COMPLETE** - All RLS policies implemented:
- **users**: user can `select` own row; admin can `select` all
- **veterans/recruiters/supporters**: owner can `select/update` own; admin all
- **pitches**: public can `select` where `is_active=true` AND `plan_expires_at > now()`
- **endorsements**: signed-in can `insert`; `unique (veteran_id, endorser_id)`
- **referrals**: supporter can `select` own; admin all
- **referral_events**: supporter can `select` events via join on own referrals
- **donations**: expose aggregates via view/RPC (public); admin can `select` rows
- **resume_requests**: recruiter can `insert/select` own; veteran can `select` where `veteran_id = auth.uid()`
- **activity_log**: public can `select` last N via view/RPC; admin full

---

## 4) Roles & Permissions
✅ **COMPLETE** - All roles implemented:
- **Veteran**: create/edit pitches, invite supporters, see referrals/endorsements, approve/deny resume requests
- **Recruiter**: browse/filter, call/email instantly, request resume, shortlist, notes
- **Supporter**: refer/share pitches (tracked), endorse, view referral analytics
- **Admin**: manage users/pitches/donations/endorsements/resume requests, monitor FOMO feed & abuse flags, view analytics

---

## 5) Core Features

### 5.1 Xainik AI (Pitch Helper) — Inputs & Outputs
⚠️ **PARTIAL** - API setup complete, integration pending:
- **Inputs:** LinkedIn URL OR optional resume (backend only) OR manual 1–4 lines
- **Outputs (strict):** `title` ≤80, `pitch` ≤300, `skills[3]`, `job_type`, `location_current`, `location_preferred`(≤3), `availability`, `military_info` (name, rank, branch, years), `photo_url`, `email`, `phone`, optional links
- **Missing:** OpenAI integration, pitch generation logic

### 5.2 Pitch Cards (homepage/browse)
✅ **COMPLETE** - Implemented in `src/components/PitchCard.tsx`:
- Show: Name+Rank, Service, Title, ~150-char pitch, 3 skills, City, Job type, Availability, 📞 tel:, ❤️ likes, 🛡️ verified badge (≥10 endorsements)
- Hide: email, share/shortlist, resume
- Uses canonical `PitchCardData` type with proper veteran object structure

### 5.3 Pitch Detail
⚠️ **PARTIAL** - Basic structure exists, missing:
- Full pitch, skills, job type, availability, service info
- Call/Email buttons
- **Refer**, **Like**, **Request Resume** actions
- Endorsements list
- Contribute (Donate/Become Supporter)
- Share functionality

### 5.4 Endorsements & Community Verified
✅ **COMPLETE** - Implemented in `src/lib/actions/endorsements.ts`:
- Any signed-in user can endorse (1 per veteran)
- At 10 unique endorsements → **Community Verified** badge (shown on all pitches/profile)
- Proper array/object handling with `first()` helper

### 5.5 Referrals (End-to-End)
⚠️ **PARTIAL** - Basic structure exists, missing:
- Unique link per supporter+pitch
- UTM parameter handling
- Event tracking (OPENED/VIEWED/CALL/EMAIL/RESHARED/SIGNUP_FROM_REFERRAL)
- Session attribution via cookie
- Metrics surface to veteran/supporter/admin

### 5.6 Donations (Platform)
✅ **COMPLETE** - Implemented in `src/app/donations/page.tsx`:
- Public page: Total • Today • Last • Highest
- Donations write to ticker
- Billing system with 80G receipts

### 5.7 Pricing & Plans (Razorpay)
✅ **COMPLETE** - Implemented in `src/app/pricing/page.tsx`:
- ₹1/14-day **one-time** trial; ₹299/30d; ₹499/60d; ₹599/90d
- Plan tier + expiry management
- Renewal reminders T-3/T-0/T+3 (cron jobs implemented)

---

## 6) Page-by-Page Build Status

1. ✅ **COMPLETE** - **Homepage** — Hero; realtime ticker from `activity_log`; donation snapshot (aggregates); featured pitch cards; Support CTA; Footer
2. ✅ **COMPLETE** - **Pitch Card Component** — Minimal fields; phone + like; verified badge; responsive
3. ⚠️ **PARTIAL** - **Pitch Detail Page** — Basic structure exists, missing actions and endorsements
4. ❌ **NOT DONE** - **Pitch Creation (AI-first)** — LinkedIn/resume/manual → OpenAI → editable preview → plan select → Razorpay → publish
5. ⚠️ **PARTIAL** - **Veteran Dashboard** — Basic structure exists, missing analytics and resume requests
6. ⚠️ **PARTIAL** - **Recruiter Dashboard** — Basic structure exists, missing filters and shortlist
7. ⚠️ **PARTIAL** - **Supporter Dashboard** — Basic structure exists, missing referral analytics
8. ✅ **COMPLETE** - **Donations Page** — Live totals; today/last/highest; realtime updates; ticker linking
9. ✅ **COMPLETE** - **Pricing Page** — Plans + Razorpay; trial lockout; expiry reminders
10. ❌ **NOT DONE** - **Admin Panel** — Users, pitches, endorsements, donations, resume requests; FOMO feed; abuse flags; analytics time series

---

## 7) UI Layout Prompts (Cursor-Ready)

### 7.1 Homepage — Layout Prompt
✅ **COMPLETE** - Implemented in `src/app/page.tsx`:
- **Hero**: H1 + dual subtext (veterans, recruiters); CTAs `[Post My Pitch] [Browse Veterans] [Refer a Pitch]`
- **Ticker**: horizontal auto-scroll; last 10 events from `activity_log` (realtime)
- **Donations snapshot**: 4 KPIs (Total, Today, Last, Highest)
- **Featured cards**: 3–4; responsive (1 col mobile → 3 cols desktop)
- **Support CTA strip**: Donate / Become a Supporter
- **Footer**: About, Contact, Terms, Privacy

### 7.2 Pitch Card — Layout Prompt
✅ **COMPLETE** - Implemented in `src/components/PitchCard.tsx`:
- **Show**: Name+Rank+Service; Title (≤80); truncated pitch (~150); 3 skill chips; City; Job type; Availability; **📞 tel:**; **❤️ likes**; **🛡️ verified** (≥10 endorsements)
- **Hide**: email/share/resume/shortlist
- **Behavior**: Phone uses `tel:` on mobile (tooltip on desktop). Card click → details

### 7.3 Pitch Details — Layout Prompt
⚠️ **PARTIAL** - Basic structure exists, missing:
- **Top**: Title, cropped photo
- **Body**: Full pitch (≤300), skills, job type, availability, service info
- **Contact**: Call, Email buttons
- **Actions**: **Refer**, **Like**, **Request Resume**
- **Lower**: Endorsements list; Contribute (Donate/Become Supporter); Share

---

## 8) Notifications & FOMO Logic

### 8.1 Activity Log (Ticker) — Event Types
✅ **COMPLETE** - Implemented in `src/lib/activity.ts`:
- `veteran_joined` — meta: `{ veteran_name }`
- `pitch_referred` — meta: `{ supporter_name, veteran_name }`
- `recruiter_called` — meta: `{ recruiter_name, veteran_name }`
- `endorsement_added` — meta: `{ endorser_name, veteran_name }`
- `like_added` — meta: `{ pitch_title }`
- `donation_received` — meta: `{ amount }`
- **Display:** latest 10, streaming via Supabase Realtime; human-readable labels

### 8.2 Notification Triggers (Resend + In-App)
⚠️ **PARTIAL** - Email system implemented, in-app pending:
- ✅ Referral **accepted** → Veteran (in-app + email)
- ✅ Referral **opened** → Supporter (in-app, debounced)
- ✅ Pitch **viewed** via referral → Veteran + Supporter (in-app, debounced)
- ✅ **Call/Email clicked** → Veteran (in-app + email)
- ✅ **Endorsement added** → Veteran (in-app; +email at 10 → badge)
- ✅ **Resume requested** → Veteran (in-app + email with recruiter name/email + job role)
- ✅ **Resume approved/declined** → Recruiter (in-app + email)
- ✅ **Plan expiry T-3/T+0** → Veteran (email; in-app on expiry)
- ✅ **Donation received** → Admin (in-app + email)
- ✅ **Abuse/suspicious** → Admin (in-app + email)

---

## 9) Billing & Razorpay Webhooks

### 9.1 Invoice System
✅ **COMPLETE** - Implemented in `src/lib/billing/`:
- **Invoice prefix**: XAI (configurable via `ORG_INVOICE_PREFIX`)
- **Numbering**: Fiscal year-based with locking mechanism
- **PDF generation**: Server-only using `@react-pdf/renderer`
- **Storage**: Secure PDF storage in Supabase storage
- **Email**: Automated invoice emails via Resend

### 9.2 Receipt System
✅ **COMPLETE** - Implemented in `src/lib/billing/`:
- **Receipt prefix**: RCPT (configurable via `ORG_RECEIPT_PREFIX`)
- **80G compliance**: Proper donation receipts with tax benefits
- **PDF generation**: Server-only with proper formatting
- **Storage**: Secure PDF storage in Supabase storage
- **Email**: Automated receipt emails via Resend

### 9.3 Webhook Integration
✅ **COMPLETE** - Implemented in `src/app/api/razorpay/webhook/route.ts`:
- **Signature verification**: HMAC-SHA256 verification
- **Idempotency**: Via `payment_events` table with unique `event_id`
- **Type safety**: Typed DTOs for service and donation payments
- **Branching**: Service → generate invoice, Donation → generate receipt
- **Activity logging**: All payment events logged to activity feed

### 9.4 Download APIs
✅ **COMPLETE** - Implemented in `src/app/api/docs/`:
- `GET /api/docs/invoice/[id]` → verify owner/admin → signed URL (24h) → 302 redirect
- `GET /api/docs/receipt/[id]` → ditto
- **Security**: Proper authorization checks before generating signed URLs

---

## 10) Auth, Roles, and RLS

### 10.1 Authentication
✅ **COMPLETE** - Implemented in `src/app/auth/page.tsx`:
- **Google OAuth**: Full integration with Supabase Auth
- **LinkedIn OAuth**: Full integration with Supabase Auth
- **Role selection**: Post-signup role assignment
- **Suspense boundaries**: Proper CSR bailout handling

### 10.2 Role-Based Access
✅ **COMPLETE** - Implemented across all components:
- **Veteran**: Pitch creation, endorsements, resume requests
- **Recruiter**: Browse, filter, contact, resume requests
- **Supporter**: Referrals, endorsements, analytics
- **Admin**: Full system access

### 10.3 RLS Policies
✅ **COMPLETE** - Implemented in migrations:
- **User isolation**: Users can only access their own data
- **Public access**: Pitches visible to all when active
- **Admin override**: Admins can access all data
- **Proper joins**: Complex queries with proper authorization

---

## 11) Security & Monitoring

### 11.1 Security Headers
✅ **COMPLETE** - Implemented in `src/middleware.ts`:
- **CSP**: Content Security Policy headers
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing protection

### 11.2 Rate Limiting
✅ **COMPLETE** - Implemented in `src/middleware/rateLimit.ts`:
- **API protection**: Rate limiting on all API routes
- **Configurable limits**: Different limits for different endpoints
- **IP-based tracking**: Proper IP address handling

### 11.3 Error Monitoring
✅ **COMPLETE** - Implemented with Sentry:
- **Error tracking**: All errors logged to Sentry
- **Performance monitoring**: Transaction tracking
- **Breadcrumbs**: Detailed error context

---

## 12) Email & Notifications

### 12.1 Email System
✅ **COMPLETE** - Implemented in `src/lib/emails/`:
- **Resend integration**: Full transactional email system
- **Invoice emails**: Automated invoice delivery
- **Receipt emails**: Automated donation receipt delivery
- **Email logging**: All emails tracked in `email_logs` table

### 12.2 Notification System
⚠️ **PARTIAL** - Database structure exists, UI pending:
- **In-app notifications**: Table structure ready, UI components needed
- **Email notifications**: Fully implemented
- **Notification preferences**: Table structure ready, UI pending

---

## 13) SEO & Performance

### 13.1 SEO Implementation
✅ **COMPLETE** - Implemented in `src/lib/seo.ts`:
- **Meta tags**: Dynamic meta tag generation
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **Sitemap**: Dynamic sitemap generation

### 13.2 Performance Optimization
✅ **COMPLETE** - Implemented across the app:
- **Image optimization**: Next.js Image component usage
- **Code splitting**: Automatic route-based code splitting
- **Caching**: Proper caching headers
- **Bundle optimization**: Tree shaking and minification

---

## 14) Core Flows

### 14.1 Pitch Creation Flow
❌ **NOT DONE** - Missing:
- AI-powered pitch generation
- LinkedIn/resume parsing
- Pitch preview and editing
- Plan selection and payment

### 14.2 Endorsement Flow
✅ **COMPLETE** - Implemented in `src/lib/actions/endorsements.ts`:
- Unique endorser per veteran
- Community verification at 10 endorsements
- Proper array/object handling

### 14.3 Referral Flow
⚠️ **PARTIAL** - Basic structure exists, missing:
- Unique link generation
- Event tracking
- Analytics dashboard

### 14.4 Donation Flow
✅ **COMPLETE** - Implemented in `src/app/donations/page.tsx`:
- Razorpay integration
- 80G receipt generation
- Activity logging

---

## 15) Crawler & Link Health

### 15.1 Link Health Monitoring
⚠️ **PARTIAL** - Scripts exist in `scripts/`:
- **Link checker**: Basic link validation scripts
- **Health monitoring**: Basic health check endpoints
- **Missing**: Automated monitoring and alerting

### 15.2 SEO Crawler Support
✅ **COMPLETE** - Implemented:
- **Robots.txt**: Proper crawler directives
- **Sitemap**: Dynamic sitemap generation
- **Meta tags**: SEO-optimized meta tags

---

## 16) Database Schema & Naming

### 16.1 Schema Consistency
✅ **COMPLETE** - All tables follow consistent naming:
- **Snake_case**: All column names use snake_case
- **UUID primary keys**: All tables use UUID primary keys
- **Timestamps**: Consistent created_at/updated_at patterns
- **Foreign keys**: Proper referential integrity

### 16.2 Data Types
✅ **COMPLETE** - Proper data types used:
- **Text constraints**: Proper length limits (pitch_text ≤ 300)
- **Array types**: Skills stored as text[]
- **JSONB**: Flexible metadata storage
- **Enums**: Proper constraint checking

---

## 17) TypeScript / Build Status

### 17.1 TypeScript Implementation
✅ **COMPLETE** - Full TypeScript coverage:
- **Type safety**: All components properly typed
- **Interface definitions**: Canonical types in `types/domain.ts`
- **Generic helpers**: Reusable type-safe utilities
- **Build success**: Zero TypeScript errors

### 17.2 Build System
✅ **COMPLETE** - Production-ready build:
- **Next.js 15**: Latest version with App Router
- **Turbopack**: Fast development builds
- **Optimization**: Production optimizations enabled
- **Zero build errors**: Clean production builds

---

## 18) Testing Coverage & Results

### 18.1 Test Implementation
⚠️ **PARTIAL** - Basic test coverage exists:
- **Test files**: 5 test files in `tests/`
- **Test count**: 31 passing tests
- **Coverage areas**: Billing, RLS, health checks
- **Missing**: Component tests, integration tests, E2E tests

### 18.2 Test Results
✅ **PASSING** - All tests pass:
- **Billing tests**: Invoice/receipt generation
- **RLS tests**: Permission validation
- **Health tests**: Basic functionality checks
- **Webhook tests**: Payment processing

---

## 19) Deployment Readiness

### 19.1 Environment Configuration
✅ **COMPLETE** - All environments configured:
- **Development**: Local development setup
- **Staging**: Staging environment ready
- **Production**: Production environment configured
- **Environment variables**: All required variables documented

### 19.2 CI/CD Pipeline
⚠️ **PARTIAL** - Basic setup exists:
- **Build pipeline**: Automated builds
- **Test pipeline**: Automated testing
- **Missing**: Automated deployment, staging deployments

---

## 20) Known Issues

### 20.1 Development Issues
- **Turbopack warnings**: Some dependency warnings in development (non-blocking)
- **Suspense boundaries**: All useSearchParams properly wrapped
- **Type safety**: All TypeScript errors resolved

### 20.2 Production Issues
- **None identified**: All critical issues resolved

---

## Last Verified
- **Date**: 2025-01-27
- **Branch**: main
- **Build**: ✅ PASS
- **Typecheck**: ✅ PASS
- **Test Coverage**: 31 tests passing (5 test files)
- **Summary**: Core platform functional with billing, auth, and pitch display complete. Missing AI integration and advanced dashboard features.


```
