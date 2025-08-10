
````markdown
# 🛡️ Xainik.com — AI-First, Resume-Free, Community-Supported, Ultra-Fast Hiring Platform
**Version:** 1.0  
**Last Updated:** 2025-08-09 (IST)

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
- **Next.js 14 (App Router) + Tailwind CSS** — Vercel hosting
- **Supabase** — Postgres, Auth, Realtime, Storage, **RLS**
- **OpenAI** — Pitch/Title/Skills generation
- **Razorpay** — Plans & donations (Key ID, Key Secret, Webhook Secret)
- **Resend** — Transactional emails
- **Google Places** — City autocomplete
- **Image crop** — `react-easy-crop` or equivalent

**Design References (strict)**
- **Toptal Talent** → premium typography/whitespace
- **AngelList Talent** → direct CTA patterns, recruiter flows

---

## 3) Database Schema + RLS Rules

### 3.1 Tables (outline)
- `users` (role = veteran | recruiter | supporter | admin)
- `veterans` (rank, branch, years, current/preferred locations)
- `recruiters` (company, industry)
- `supporters` (intro)
- `pitches` (title, 300-char pitch, skills[3], job_type, location, availability, phone, photo, plan, expiry, likes)
- `endorsements` (unique endorser per veteran; badge at 10)
- `referrals` (unique supporter+pitch share link)
- `referral_events` (LINK_OPENED, PITCH_VIEWED, CALL_CLICKED, EMAIL_CLICKED, SHARE_RESHARED, SIGNUP_FROM_REFERRAL)
- `shared_pitches` (optional aggregate cache)
- `donations` (platform-wide)
- `activity_log` (FOMO ticker events)
- `resume_requests` (recruiter→veteran, approve/decline)
- `notifications`, `notification_prefs`

### 3.2 SQL Migrations (Supabase)

> Paste these into `/supabase/migrations/YYYYMMDDHHMM_init.sql` (Cursor can split if needed).

```sql
-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  phone text,
  role text check (role in ('veteran','recruiter','supporter','admin')) not null,
  created_at timestamptz default now()
);

-- VETERANS PROFILE
create table if not exists veterans (
  user_id uuid primary key references users(id) on delete cascade,
  rank text,
  service_branch text,
  years_experience int,
  location_current text,
  locations_preferred text[] -- up to 3 "City, Country"
);

-- RECRUITERS PROFILE
create table if not exists recruiters (
  user_id uuid primary key references users(id) on delete cascade,
  company_name text,
  industry text
);

-- SUPPORTERS PROFILE
create table if not exists supporters (
  user_id uuid primary key references users(id) on delete cascade,
  intro text
);

-- PITCHES
create table if not exists pitches (
  id uuid primary key default gen_random_uuid(),
  veteran_id uuid references users(id) on delete cascade,
  title text not null,
  pitch_text text not null check (length(pitch_text) <= 300),
  skills text[] not null, -- exactly 3 items
  job_type text not null, -- full-time, part-time, freelance, consulting, hybrid, project-based, remote, on-site
  location text not null, -- "City, Country" (display city only on card)
  availability text not null, -- Immediate/30/60/90
  photo_url text,
  phone text not null,
  likes_count int default 0,
  is_active boolean default true,
  plan_tier text, -- 'trial_14','plan_30','plan_60','plan_90'
  plan_expires_at timestamptz,
  created_at timestamptz default now()
);

-- ENDORSEMENTS
create table if not exists endorsements (
  id uuid primary key default gen_random_uuid(),
  veteran_id uuid references users(id) on delete cascade,
  endorser_id uuid references users(id) on delete cascade,
  text text, -- optional "Why I recommend" (<=150 chars)
  created_at timestamptz default now(),
  unique (veteran_id, endorser_id)
);

-- REFERRALS (unique per supporter+pitch)
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid references users(id) on delete cascade,
  pitch_id uuid references pitches(id) on delete cascade,
  share_link text not null,
  created_at timestamptz default now(),
  unique (supporter_id, pitch_id)
);

-- REFERRAL EVENTS (attribution + platform)
create table if not exists referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid references referrals(id) on delete cascade,
  event_type text check (event_type in ('LINK_OPENED','PITCH_VIEWED','CALL_CLICKED','EMAIL_CLICKED','SHARE_RESHARED','SIGNUP_FROM_REFERRAL')) not null,
  platform text, -- whatsapp, linkedin, email, direct
  user_agent text,
  country text,
  ip_hash text,
  occurred_at timestamptz default now()
);

-- OPTIONAL CACHE: SHARED PITCH AGGREGATES
create table if not exists shared_pitches (
  supporter_id uuid references users(id) on delete cascade,
  pitch_id uuid references pitches(id) on delete cascade,
  share_link text not null,
  click_count int default 0,
  primary key (supporter_id, pitch_id)
);

-- DONATIONS (platform-wide)
create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  amount numeric(10,2) not null,
  currency text default 'INR',
  created_at timestamptz default now()
);

-- ACTIVITY LOG (FOMO ticker)
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  event text not null, -- veteran_joined, pitch_referred, recruiter_called, endorsement_added, like_added, donation_received
  meta jsonb,          -- {veteran_name, supporter_name, recruiter_name, amount, pitch_title, ...}
  created_at timestamptz default now()
);

-- RESUME REQUESTS
create table if not exists resume_requests (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid references users(id) on delete cascade,
  veteran_id uuid references users(id) on delete cascade,
  pitch_id uuid references pitches(id) on delete set null,
  job_role text,
  status text check (status in ('PENDING','APPROVED','DECLINED')) default 'PENDING',
  created_at timestamptz default now(),
  responded_at timestamptz
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  payload_json jsonb,
  channel text check (channel in ('IN_APP','EMAIL')) not null,
  status text check (status in ('PENDING','SENT','FAILED')) default 'PENDING',
  created_at timestamptz default now(),
  sent_at timestamptz,
  read_at timestamptz
);

-- NOTIFICATION PREFS
create table if not exists notification_prefs (
  user_id uuid primary key references users(id) on delete cascade,
  email_enabled boolean default true,
  in_app_enabled boolean default true,
  digest_enabled boolean default true,
  quiet_hours_start time,
  quiet_hours_end time
);

-- INDEXES
create index if not exists idx_pitches_active on pitches(is_active, plan_expires_at);
create index if not exists idx_referral_events_referral_time on referral_events(referral_id, occurred_at desc);
create index if not exists idx_activity_log_time on activity_log(created_at desc);
````

### 3.3 RLS (Row-Level Security) — Principles (Implement in Supabase SQL)

* **users**: user can `select` own row; admin can `select` all.
* **veterans/recruiters/supporters**: owner can `select/update` own; admin all.
* **pitches**:

  * public can `select` where `is_active=true` AND `plan_expires_at > now()`
  * owner can `insert/update` own
  * admin all
* **endorsements**:

  * signed-in can `insert`; `unique (veteran_id, endorser_id)`
  * veteran can `select` endorsements where `veteran_id = auth.uid()` (via join)
  * admin all
* **referrals**: supporter can `select` own; admin all
* **referral\_events**:

  * supporter can `select` events via join on own referrals
  * veteran can `select` events tied to their pitches (via join)
  * admin all
* **shared\_pitches**: supporter can `select` own rows; admin all
* **donations**: expose aggregates via view/RPC (public); admin can `select` rows
* **notifications / notification\_prefs**: user can `select` own; admin all
* **resume\_requests**:

  * recruiter can `insert/select` own
  * veteran can `select` where `veteran_id = auth.uid()`
  * admin all
* **activity\_log**: public can `select` last N via view/RPC; admin full

---

## 4) Roles & Permissions

* **Veteran**: create/edit pitches, invite supporters, see referrals/endorsements, approve/deny resume requests.
* **Recruiter**: browse/filter, call/email instantly, request resume, shortlist, notes.
* **Supporter**: refer/share pitches (tracked), endorse, view referral analytics.
* **Admin**: manage users/pitches/donations/endorsements/resume requests, monitor FOMO feed & abuse flags, view analytics.

---

## 5) Core Features

### 5.1 Xainik AI (Pitch Helper) — Inputs & Outputs

**Inputs:** LinkedIn URL OR optional resume (backend only) OR manual 1–4 lines.
**Outputs (strict):** `title` ≤80, `pitch` ≤300, `skills[3]`, `job_type`, `location_current`, `location_preferred`(≤3), `availability`, `military_info` (name, rank, branch, years), `photo_url`, `email`, `phone`, optional links.

**Copy guardrails:** no fluff/clichés; outcomes + numbers; job-type, availability, location if useful.

### 5.2 Pitch Cards (homepage/browse)

Show: Name+Rank, Service, Title, \~150-char pitch, 3 skills, City, Job type, Availability, 📞 tel:, ❤️ likes, 🛡️ verified badge (≥10 endorsements).
Hide: email, share/shortlist, resume.

### 5.3 Pitch Detail

Full pitch, skills, job type, availability, service info; Call/Email; **Refer**, **Like**, **Request Resume**; endorsements list; Contribute; Share.

### 5.4 Endorsements & Community Verified

Any signed-in user can endorse (1 per veteran). At 10 unique endorsements → **Community Verified** badge (shown on all pitches/profile).

### 5.5 Referrals (End-to-End)

Unique link per supporter+pitch; append UTM; track events (OPENED/VIEWED/CALL/EMAIL/RESHARED/SIGNUP\_FROM\_REFERRAL); attribute session via cookie; surface metrics to veteran/supporter/admin.

### 5.6 Donations (Platform)

Public page: Total • Today • Last • Highest. Donations write to ticker.

### 5.7 Pricing & Plans (Razorpay)

₹1/14-day **one-time** trial; ₹299/30d; ₹499/60d; ₹599/90d. Set plan tier + expiry; renewal reminders T-3/T-0/T+3.

---

## 6) Page-by-Page Build (Cursor)

1. **Homepage** — Hero; realtime ticker from `activity_log`; donation snapshot (aggregates); featured pitch cards; Support CTA; Footer.
2. **Pitch Card Component** — Minimal fields; phone + like; verified badge; responsive.
3. **Pitch Detail Page** — Full info + **Refer/Like/Request Resume**; endorsements; Contribute; Share.
4. **Pitch Creation (AI-first)** — LinkedIn/resume/manual → OpenAI → editable preview → plan select → Razorpay → publish.
5. **Veteran Dashboard** — My pitches (status/plan/expiry); endorsements; referral analytics; invite supporters; resume requests.
6. **Recruiter Dashboard** — Filters/search; shortlist/contacted; resume requests; notes; notification prefs.
7. **Supporter Dashboard** — Referred pitches; referral events by platform/time; endorsements made.
8. **Donations Page** — Live totals; today/last/highest; realtime updates; ticker linking.
9. **Pricing Page** — Plans + Razorpay; trial lockout; expiry reminders.
10. **Admin Panel** — Users, pitches, endorsements, donations, resume requests; FOMO feed; abuse flags; analytics time series.

---

## 7) UI Layout Prompts (Cursor-Ready)

### 7.1 Homepage — Layout Prompt

* **Hero**: H1 + dual subtext (veterans, recruiters); CTAs `[Post My Pitch] [Browse Veterans] [Refer a Pitch]`.
* **Ticker**: horizontal auto-scroll; last 10 events from `activity_log` (realtime).
* **Donations snapshot**: 4 KPIs (Total, Today, Last, Highest).
* **Featured cards**: 3–4; responsive (1 col mobile → 3 cols desktop).
* **Support CTA strip**: Donate / Become a Supporter.
* **Footer**: About, Contact, Terms, Privacy.
* **Style**: Toptal-like restraint; Inter/DM Sans; black on white; subtle accent for CTAs; 44px tap targets; no heavy animations.

### 7.2 Pitch Card — Layout Prompt

* **Show**: Name+Rank+Service; Title (≤80); truncated pitch (\~150); 3 skill chips; City; Job type; Availability; **📞 tel:**; **❤️ likes**; **🛡️ verified** (≥10 endorsements).
* **Hide**: email/share/resume/shortlist.
* **Behavior**: Phone uses `tel:` on mobile (tooltip on desktop). Card click → details.

### 7.3 Pitch Details — Layout Prompt

* **Top**: Title, cropped photo.
* **Body**: Full pitch (≤300), skills, job type, availability, service info.
* **Contact**: Call, Email buttons.
* **Actions**: **Refer**, **Like**, **Request Resume**.
* **Lower**: Endorsements list; Contribute (Donate/Become Supporter); Share.

---

## 8) Notifications & FOMO Logic

### 8.1 Activity Log (Ticker) — Event Types

* `veteran_joined` — meta: `{ veteran_name }`
* `pitch_referred` — meta: `{ supporter_name, veteran_name }`
* `recruiter_called` — meta: `{ recruiter_name, veteran_name }`
* `endorsement_added` — meta: `{ endorser_name, veteran_name }`
* `like_added` — meta: `{ pitch_title }`
* `donation_received` — meta: `{ amount }`

**Display:** latest 10, streaming via Supabase Realtime; human-readable labels.

### 8.2 Notification Triggers (Resend + In-App)

* Referral **accepted** → Veteran (in-app + email)
* Referral **opened** → Supporter (in-app, debounced)
* Pitch **viewed** via referral → Veteran + Supporter (in-app, debounced)
* **Call/Email clicked** → Veteran (in-app + email)
* **Endorsement added** → Veteran (in-app; +email at 10 → badge)
* **Resume requested** → Veteran (in-app + email with recruiter name/email + job role)
* **Resume approved/declined** → Recruiter (in-app + email)
* **Plan expiry T-3/T+0** → Veteran (email; in-app on expiry)
* **Donation received** → Admin (in-app + email)
* **Abuse/suspicious** → Admin (in-app + email)

**Debounce:** collapse multiple `LINK_OPENED` / `PITCH_VIEWED` within 10 minutes.
**Quiet hours:** respect per-user prefs.
**In-App UX:** Bell icon, unread counter, filters: Referrals | Endorsements | Contacts | Billing | System.

---

## 9) JSON Payload Examples (Plug-and-Play)

### 9.1 Pitch Creation (AI Result)

```json
{
  "title": "Operations Lead — 22 yrs, Indian Army",
  "pitch": "Led 500+ personnel across complex logistics ops in 3 regions. Immediate joiner; excels in crisis mgmt, vendor ops, cross-functional delivery. Ready to drive outcomes now.",
  "skills": ["Logistics", "Operations", "Leadership"],
  "job_type": "Full-Time",
  "location_current": "Delhi, India",
  "location_preferred": ["Mumbai, India", "Bengaluru, India", "Pune, India"],
  "availability": "Immediate",
  "military_info": {
    "full_name": "Col. Raghav Mehta (Retd.)",
    "rank": "Colonel",
    "service_branch": "Indian Army",
    "years_experience": 22
  },
  "phone": "+91XXXXXXXXXX",
  "photo_url": "/uploads/raghav.jpg",
  "optional_links": { "linkedin": "https://linkedin.com/in/xyz" }
}
```

### 9.2 Referral Lifecycle

**Created**

```json
{"event":"referral_created","supporter_id":"SUP123","pitch_id":"PITCH678","referral_link":"https://xainik.com/r/abc123?utm_source=whatsapp&utm_medium=share_button&utm_campaign=pitch_referral","created_at":"2025-08-09T12:45:00Z"}
```

**Opened**

```json
{"event":"referral_opened","referral_id":"REF001","platform":"WhatsApp","ip_hash":"h1","user_agent":"UA","occurred_at":"2025-08-09T12:50:00Z"}
```

**Viewed**

```json
{"event":"pitch_viewed","referral_id":"REF001","pitch_id":"PITCH678","viewed_at":"2025-08-09T12:51:15Z"}
```

**Contact Clicked**

```json
{"event":"contact_clicked","referral_id":"REF001","contact_type":"phone","clicked_at":"2025-08-09T12:52:30Z"}
```

### 9.3 Donations (Platform)

```json
{"event":"donation_received","donation_id":"DON9001","amount":500,"currency":"INR","donor_name":"Anonymous","donated_at":"2025-08-09T14:10:00Z"}
```

### 9.4 Resume Request

```json
{"event":"resume_request","request_id":"REQ123","recruiter_id":"REC555","veteran_id":"VET111","pitch_id":"PITCH678","job_role":"Project Manager — Infra","requested_at":"2025-08-09T14:20:00Z"}
```

### 9.5 Notification Email (Resume Request → Veteran)

```json
{"type":"resume_request_email","recipient_id":"VET111","recruiter_name":"Priya Nair","recruiter_email":"priya@company.com","job_role":"Project Manager — Infra","action_url":"https://xainik.com/approve-resume/REQ123","timestamp":"2025-08-09T14:20:00Z"}
```

### 9.6 Notification Preferences

```json
{"user_id":"VET111","preferences":{"email":true,"in_app":true,"digest":false,"quiet_hours":{"start":"22:00","end":"07:00"}}}
```

---

## 10) Developer Guardrails

* **No hardcoded data** — all lists query Supabase; seed via migrations only.
* **Performance** — server components for lists; pagination; indexes on time-series tables.
* **Security** — strict RLS; input validation; hash IPs; idempotent email sends.
* **Observability** — log Resend message IDs; retries; error metrics; uptime health.
* **Accessibility** — 44px tap targets; ARIA; keyboard nav; contrast AA+.
* **Internationalization (future)** — centralize copy; optional auto-translate of pitch.
* **Extensibility** — schema supports multiple pitches per veteran; audio/video later.

---

## 11) How to Use This Spec in Cursor

1. **Save** this file as `docs/xainik-site-spec.md`.
2. In Cursor chat, **reference path + section**, e.g.:

   > “Refer to `docs/xainik-site-spec.md`, section **‘6) Page-by-Page Build (Cursor)’**. Build the Homepage now using Tailwind + Next.js. Use real queries; no dummy data.”
3. Ask Cursor to generate:

   * `/supabase/migrations/*.sql` from **3.2 SQL Migrations** + **3.3 RLS**
   * `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `GOOGLE_PLACES_API_KEY`
   * `app/page.tsx` (Homepage)
   * Reusable `PitchCard` component (`components/PitchCard.tsx`)
   * Notifications dispatcher (`lib/notifications/dispatcher.ts`) + Resend templates (`/emails`)
   * Role dashboards under `app/(dashboards)/...`
   * `docs/cursor-plan.md` (checklist) and `docs/decisions.md` (deviation log)

**Kickoff Prompt**

> “Refer to `docs/xainik-site-spec.md`.
> Implement **Database Schemas** and **RLS** first (create SQL migrations in `/supabase/migrations`).
> Then build the **Homepage** (hero, realtime ticker from `activity_log`, donation snapshot aggregates, featured pitch cards).
> Use Tailwind + Next.js + Supabase. **No dummy data** — wire real queries.”


Proceed with Supabase + Next.js build for:
 - /pitch/[id] (Pitch Detail)
 - /pitch/new (AI-first)
 - docs scaffolding (decisions.md, cursor-plan.md)

Before page builds, ensure Supabase DB schema + RLS match the spec's "3) Database Schema + RLS Rules":

Supabase DB — Create Tables (fields may reflect the outline; use migrations under /supabase/migrations):
users (id UUID PK default gen_random_uuid(), role ENUM[veteran,recruiter,supporter,admin], name text, email text unique, phone text, created_at timestamptz default now())
veterans (user_id UUID PK FK->users.id, rank text, service_branch text, years_experience int, location_current text, locations_preferred text[])
recruiters (user_id UUID PK FK->users.id, company_name text, industry text)
supporters (user_id UUID PK FK->users.id, intro text)
pitches (id UUID PK, veteran_id UUID FK->users.id, title text, pitch_text text, skills text[], job_type text, location text, availability text, photo_url text, phone text, is_active bool default true, plan_tier text, plan_expires_at timestamptz, likes_count int default 0, created_at timestamptz default now())
endorsements (id UUID PK, veteran_id UUID FK->users.id, endorser_id UUID FK->users.id, text text, created_at timestamptz default now(), UNIQUE(veteran_id, endorser_id))
referrals (id UUID PK, supporter_id UUID FK->users.id, pitch_id UUID FK->pitches.id, share_link text, created_at timestamptz default now(), UNIQUE(supporter_id, pitch_id))
referral_events (id UUID PK, referral_id UUID FK->referrals.id, event_type text, platform text, ip_hash text, user_agent text, occurred_at timestamptz default now())
shared_pitches (supporter_id UUID FK->users.id, pitch_id UUID FK->pitches.id, share_link text, click_count int default 0, PRIMARY KEY (supporter_id, pitch_id))
donations (id UUID PK, donor_name text, amount numeric(10,2), currency text default 'INR', created_at timestamptz default now())
activity_log (id UUID PK, event text, meta jsonb, created_at timestamptz default now())
resume_requests (id UUID PK, recruiter_id UUID FK->users.id, veteran_id UUID FK->users.id, pitch_id UUID FK->pitches.id, job_role text, status text default 'PENDING', created_at timestamptz default now(), responded_at timestamptz)
notifications (id UUID PK, user_id UUID FK->users.id, type text, payload_json jsonb, channel text, status text default 'PENDING', created_at timestamptz default now(), sent_at timestamptz, read_at timestamptz)
notification_prefs (user_id UUID PK FK->users.id, email_enabled bool default true, in_app_enabled bool default true, digest_enabled bool default true, quiet_hours_start time, quiet_hours_end time)

Views:
- donations_aggregates (total, today, last, highest)
- activity_recent (last_50 events)

RLS Policies:
- Implement exactly as the spec’s section 3.2 describes (public select only active pitches; owner-only updates; supporter/recruiter scoped inserts; etc.)
- Enforce UNIQUE where specified.

Seed Data (dev only):
- 2 veterans with 1–2 pitches each (one active, one recently expired)
- 1 recruiter, 1 supporter
- 3–5 endorsements for one veteran (to test verified badge)
- Sample activity_log events for ticker (veteran_joined, donation_received, pitch_referred)

Then proceed:

1) Build route: /pitch/[id] (Pitch Detail)
   Files:
     - app/pitch/[id]/page.tsx (server component)
     - components/ReferModal.tsx
     - components/EndorsementsList.tsx
     - components/ContactButtons.tsx
     - lib/referrals.ts (create/fetch referral link)
     - lib/activity.ts (write ticker events)
     - lib/notifications/dispatcher.ts (if not already present)
   Behavior (per spec §7.3):
     - Render full title, photo, 300-char pitch, 3 skills, job_type, availability, service details.
     - Contact: Call (tel:) and Email buttons.
     - Actions:
       a) [Refer This Veteran’s Pitch] -> supporter modal; if not signed in as supporter, route to /supporter/refer auth flow. On sign-in, create/fetch unique referral link (supporter_id + pitch_id), show share options (copy/WhatsApp/LinkedIn/Email) with UTM params.
       b) [Like] -> increments likes_count (RLS-safe mutation).
       c) [Request Resume] -> recruiter-only: inserts resume_requests row; triggers Resend email to veteran with recruiter name/email + job role and an approval URL.
     - Endorsements: list with avatar + ≤150-char text; enable Endorse button if eligible.
     - Contribute CTA: Donate to Platform / Become a Supporter.
     - Share button.
     - Event logging:
       - If opened via referral link, log referral_events: PITCH_VIEWED and (where applicable) write activity_log: pitch_referred.
       - On call/email clicks, log referral_events: CALL_CLICKED / EMAIL_CLICKED and write activity_log: recruiter_called.
     - RLS-safe reads: only show pitches where is_active=true AND plan_expires_at>now().

   Acceptance criteria:
     - SSR page loads with correct data via Supabase.
     - Actions work under RLS (no client bypass).
     - Activity + referral events saved and visible in dashboards later.
     - Lighthouse mobile perf ≥ 90.

2) Build route: /pitch/new (AI-first)
   Files:
     - app/pitch/new/page.tsx (client/server split for form + actions)
     - components/AIPitchHelper.tsx
     - lib/openai.ts (OpenAI call: title ≤80, pitch ≤300, skills[3]; no fluff)
     - lib/pricing.ts (plan metadata: trial_14, plan_30, plan_60, plan_90)
     - lib/payments/razorpay.ts (create order, verify payment, webhook handler)
     - app/api/razorpay/webhook/route.ts (webhook to activate plan -> set plan_tier, plan_expires_at)
   Flow (per §6 step 4 + §5.1):
     Step 1: Select job_type (single), current city, up to 3 preferred cities (Google Places city-level), availability (Immediate/30/60/90).
     Step 2: AI Inputs — LinkedIn URL OR resume upload (stored, not public) OR manual 1–4 lines. Call OpenAI to generate title (≤80), pitch (≤300), skills[3]. Enforce guardrails (no fluff, outcomes-led).
     Step 3: Preview + Edit with counters; required: title, pitch, 3 skills, phone, city, job_type, availability; optional: photo crop, links.
     Step 4: Choose plan — ₹1/14d (one-time), ₹299/30d, ₹499/60d, ₹599/90d.
     Step 5: Pay via Razorpay. On success → create pitch row (is_active=true), set plan_tier + plan_expires_at. On webhook confirm, re-verify. Write activity_log: veteran_joined (first pitch) and/or pitch published.
     Step 6: Redirect to /pitch/[id].

   Acceptance criteria:
     - OpenAI result respects limits (title ≤80, pitch ≤300, exactly 3 skills).
     - Resume is not public; stored backend only if uploaded.
     - Razorpay order + webhook fully wired; plan expiry computed correctly.
     - On publish, pitch appears on /browse and can be featured on homepage.
     - Renewal logic compatible with pricing page later.

3) Docs scaffolding:
   - Create docs/decisions.md and add: "D-0001: Routing + data decisions for /pitch/[id] and /pitch/new"
   - Create docs/cursor-plan.md with a rolling checklist; tick items as they complete.

   ---

## ▶️ Next Steps from Cursor

If the spec file exists under a different path, share it and Cursor will align content/structure exactly.  
Otherwise, Cursor can proceed to:

1. **Wire core actions**:
   - Like action
   - Supporter Refer modal flow
   - Request Resume + Resend email
2. **Log referral/activity events** on:
   - Open
   - Call
   - Email
3. **Build /pitch/new** (AI-first creation, pricing page, Razorpay webhook)
4. **Add tests**
5. **Keep docs checklists updated**

---

## 🛠 Supabase + DB Instructions

When using Supabase:
- Implement all tables and RLS rules as per spec above.
- Use migrations under `/supabase/migrations/*.sql`
- Enable Row-Level Security (RLS) on all tables.
- Create policies for:
  - Veterans, recruiters, supporters
  - Pitches, endorsements, referrals, donations
  - Notifications, resume requests, activity log
- Seed essential lookup data via migration scripts (plans, job types, etc.)
- Create SQL views/RPCs for:
  - Donations aggregates (total, today, highest, last)
  - Activity feed joins
- Set up webhooks for:
  - Razorpay payment success → update plan expiry
  - Resend email → log message IDs for observability

---

## 📦 JSON Payload Examples (New Actions)

#### 1) Like Action
```json
{
  "event": "pitch_liked",
  "pitch_id": "PITCH678",
  "user_id": "SUP123",
  "liked_at": "2025-08-10T10:25:00Z"
}
2) Referral Created via Modal
json
Copy
Edit
{
  "event": "referral_created",
  "supporter_id": "SUP123",
  "pitch_id": "PITCH678",
  "platform": "WhatsApp",
  "referral_link": "https://xainik.com/r/abc123?utm_source=whatsapp&utm_medium=share_button&utm_campaign=pitch_referral",
  "created_at": "2025-08-10T10:30:00Z"
}
3) Referral Opened
json
Copy
Edit
{
  "event": "referral_opened",
  "referral_id": "REF001",
  "platform": "LinkedIn",
  "ip_hash": "h1",
  "user_agent": "Mozilla/5.0",
  "occurred_at": "2025-08-10T10:31:45Z"
}
4) Request Resume
json
Copy
Edit
{
  "event": "resume_request",
  "request_id": "REQ456",
  "recruiter_id": "REC789",
  "veteran_id": "VET111",
  "pitch_id": "PITCH678",
  "job_role": "Operations Manager",
  "requested_at": "2025-08-10T10:35:00Z"
}
5) Resume Request Email to Veteran
json
Copy
Edit
{
  "type": "resume_request_email",
  "recipient_id": "VET111",
  "recruiter_name": "Ananya Kapoor",
  "recruiter_email": "ananya@company.com",
  "job_role": "Operations Manager",
  "action_url": "https://xainik.com/approve-resume/REQ456",
  "timestamp": "2025-08-10T10:35:05Z"
}
6) Contact Click (Phone or Email)
json
Copy
Edit
{
  "event": "contact_clicked",
  "referral_id": "REF001",
  "contact_type": "phone",
  "clicked_at": "2025-08-10T10:36:20Z"
}
7) Activity Log Event (FOMO Ticker)
json
Copy
Edit
{
  "event": "pitch_liked",
  "meta": {
    "supporter_name": "Ravi Kumar",
    "veteran_name": "Col. R. Mehta (Retd.)"
  }
}
json
Copy
Edit
{
  "event": "resume_request_sent",
  "meta": {
    "recruiter_name": "Ananya Kapoor",
    "veteran_name": "Col. R. Mehta (Retd.)"
  }
}
json
Copy
Edit
{
  "event": "referral_created",
  "meta": {
    "supporter_name": "Amit Sharma",
    "veteran_name": "Lt. P. Singh"
  }
}
8) Razorpay Payment Success (Plan Activation)
json
Copy
Edit
{
  "event": "payment_success",
  "payment_id": "pay_29QQoUBi66xm2f",
  "user_id": "VET111",
  "plan_id": "PLAN_499_60D",
  "amount": 499,
  "currency": "INR",
  "activated_at": "2025-08-10T10:40:00Z",
  "expires_at": "2025-10-09T23:59:59Z"
}
🧰 Developer Guardrails
No hardcoded data — all lists query Supabase; seed via migrations.

Performance — server components for lists; pagination; index time-series tables.

Security — strict RLS; validate inputs; hash IPs; idempotent email sends.

Observability — log Resend message IDs; retries; error metrics; uptime health.

Accessibility — 44px tap targets; ARIA; keyboard nav; contrast compliance.

Internationalization (future) — centralize copy; optional auto-translate of pitch.

Extensibility — schema supports multiple pitches per veteran; audio/video later.

## [Module] Automated Invoicing & Donation Receipts (Section 8, 80G-ready)

This module delivers **fully automated**, compliant, and trackable PDFs for:
- **Service invoices** (veteran plan purchases), and
- **Donation receipts** (platform donations)

Integrated with **Razorpay** (webhooks), **Supabase** (DB, Storage, RLS), **React-PDF** (PDFs), and **Resend** (emails). PDFs are emailed and available in dashboards.

---

### Organization Profile (pre-filled from your uploaded certificates)

**Legal Entity:** VETERAN SUCCESS FOUNDATION  
**Type:** Section 8 Company (Non-Profit)  
**CIN:** U85300TG2022NPL166977  
**PAN:** AAICV9997L  
**TAN:** HYDV23520A  
**Registered Address:**  
12-1-179/1, Plot No 149, Road No 6, Krushi Nagar Colony,  
Bandlaguda, Nagole, Hyderabad, Hyderabad, Telangana, India, 500068

**Section 8 Licence:** Granted on **23-09-2022** under Companies Act, 2013 §8(1).  
(Receipts/invoices will include “Section 8 Company (non-profit)” note.)

> 80G note: This module is **80G-ready**. If/when you obtain 80G approval, flip the env flags below to auto-print 80G wording on donation receipts. Until then, receipts omit the 80G claim.

**.env additions**
--- Org identity (pre-filled) ---
ORG_NAME="VETERAN SUCCESS FOUNDATION"
ORG_ADDRESS_LINE_1="12-1-179/1, Plot No 149, Road No 6"
ORG_ADDRESS_LINE_2="Krushi Nagar Colony, Bandlaguda, Nagole"
ORG_ADDRESS_LINE_3="Hyderabad, Hyderabad, Telangana, India, 500068"
ORG_CIN="U85300TG2022NPL166977"
ORG_PAN="AAICV9997L"
ORG_TAN="HYDV23520A"
ORG_IS_SECTION8="true"

--- 80G controls (toggle when approved) ---
ORG_HAS_80G="false"
ORG_80G_APPROVAL_NO=""
ORG_80G_APPROVAL_DATE=""

--- PDF storage & delivery ---
BILLING_PDF_BUCKET="docs" # private Supabase bucket
BILLING_SIGNED_URL_TTL="86400" # 24 hours
ADMIN_EMAIL="support@xainik.com"

csharp
Copy
Edit

---

### Goals & Rules (summary)

- Generate **PDF** on **Razorpay payment capture**:
  - Service invoice for plan purchase
  - Donation receipt for platform donation
- **FY-aware numbering** (India: Apr 1–Mar 31), collision-safe:
  - Invoice: `INV/{FY}/{000001}`
  - Receipt: `REC/{FY}/{000001}`
- Private PDFs in Supabase Storage → **signed URLs** for dashboard downloads (24h).
- Email via **Resend** (attachment optional) + signed link.
- Section 8 tax line printed; **no GST** unless you add GST later.
- 80G text prints automatically when `ORG_HAS_80G=true` and approval fields are filled.

---

### Supabase: SQL Schema, RPC & RLS (migration)

```sql
-- FY label helper (Asia/Kolkata)
create or replace function public.fy_label(ts timestamptz)
returns text language sql immutable as $$
  select
    (case when extract(month from ts at time zone 'Asia/Kolkata')::int >= 4
          then extract(year from ts at time zone 'Asia/Kolkata')::int
          else extract(year from ts at time zone 'Asia/Kolkata')::int - 1 end)::text
    || '-' ||
    lpad(((case when extract(month from ts at time zone 'Asia/Kolkata')::int >= 4
                 then extract(year from ts at time zone 'Asia/Kolkata')::int + 1
                 else extract(year from ts at time zone 'Asia/Kolkata')::int end) % 100)::text, 2, '0');
$$;

-- Per-FY sequence state (invoice/receipt)
create table if not exists public.numbering_state (
  kind text check (kind in ('invoice','receipt')) not null,
  fy   text not null,
  seq  bigint not null default 0,
  primary key (kind, fy)
);

-- Atomic increment (RPC)
create or replace function public.lock_numbering_and_next(p_kind text, p_fy text)
returns bigint language plpgsql as $$
declare v_seq bigint;
begin
  insert into numbering_state(kind, fy, seq)
  values (p_kind, p_fy, 0)
  on conflict (kind, fy) do nothing;

  update numbering_state
     set seq = numbering_state.seq + 1
   where kind = p_kind and fy = p_fy
   returning seq into v_seq;

  return v_seq;
end; $$;

-- Webhook idempotency/audit
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay',
  event_type text not null,
  event_id text unique,      -- Razorpay event id / payment id
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- Service invoices (veteran purchases)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  number text unique not null,
  fy text not null,
  issued_at timestamptz not null default now(),
  line_items jsonb not null,      -- [{description, qty, amount}]
  subtotal numeric(10,2) not null,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text not null default 'INR',
  payment_id text not null,
  order_id text,
  pdf_path text not null,         -- storage object key (private)
  meta jsonb                      -- e.g., { plan_tier, duration_days, buyer_name/email/phone }
);

-- Donation receipts (platform donations)
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null, -- nullable for anonymous
  donor_name text not null,
  donor_email text,
  donor_phone text,
  number text unique not null,
  fy text not null,
  received_at timestamptz not null default now(),
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  payment_id text not null,
  order_id text,
  anonymous boolean not null default false,
  pdf_path text not null,         -- storage object key (private)
  meta jsonb
);

-- Email observability
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  email_to text not null,
  subject text not null,
  template text not null,
  message_id text,
  payload jsonb,
  status text not null default 'QUEUED',
  created_at timestamptz not null default now()
);

-- RLS
alter table public.invoices enable row level security;
alter table public.receipts enable row level security;
alter table public.email_logs enable row level security;

create policy invoices_owner_read on public.invoices
for select using ( auth.uid() = user_id
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin') );

create policy receipts_owner_read on public.receipts
for select using ( (user_id is not distinct from auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin') );

create policy email_logs_owner_read on public.email_logs
for select using ( auth.uid() = user_id
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin') );
Storage: create a private bucket named ${BILLING_PDF_BUCKET} (default docs).
Keys:

docs/invoices/{FY}/{NUMBER}.pdf

docs/receipts/{FY}/{NUMBER}.pdf

Libraries & Utilities
Install

bash
Copy
Edit
npm i @react-pdf/renderer
FY helper — src/lib/billing/numbering.ts

ts
Copy
Edit
export function computeFY(d = new Date()) {
  const dt = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const y = dt.getFullYear();
  const m = dt.getMonth() + 1;
  const fyStart = m >= 4 ? y : y - 1;
  const fyEndYY = String((fyStart + 1) % 100).padStart(2, '0');
  return `${fyStart}-${fyEndYY}`;
}
Next number (atomic) — src/lib/billing/nextNumber.ts

ts
Copy
Edit
import { createAdminClient } from '@/lib/supabaseAdmin';
import { computeFY } from './numbering';

export async function nextNumber(kind: 'invoice'|'receipt') {
  const supabase = createAdminClient();
  const fy = computeFY();
  const { data, error } = await supabase.rpc('lock_numbering_and_next', { p_kind: kind, p_fy: fy });
  if (error) throw error;
  const seq: number = data;
  const prefix = kind === 'invoice' ? 'INV' : 'REC';
  const number = `${prefix}/${fy}/${String(seq).padStart(6, '0')}`;
  return { number, fy };
}
Storage — src/lib/storage.ts

ts
Copy
Edit
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function uploadPdf(key: string, buf: Buffer) {
  const s = createAdminClient();
  const { error } = await s.storage.from(process.env.BILLING_PDF_BUCKET!).upload(key, buf, {
    contentType: 'application/pdf', upsert: true
  });
  if (error) throw error;
}

export async function signedUrl(key: string, ttlSec = Number(process.env.BILLING_SIGNED_URL_TTL || 86400)) {
  const s = createAdminClient();
  const { data, error } = await s.storage.from(process.env.BILLING_PDF_BUCKET!).createSignedUrl(key, ttlSec);
  if (error) throw error;
  return data.signedUrl;
}
React-PDF Templates (drop-in)
src/pdfs/InvoicePDF.tsx

tsx
Copy
Edit
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const S = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  h1: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  block: { marginBottom: 10 },
  table: { borderWidth: 1, borderColor: '#222' },
  tr: { flexDirection: 'row' },
  th: { flex: 1, padding: 6, borderRightWidth: 1, fontWeight: 'bold', backgroundColor: '#eee' },
  td: { flex: 1, padding: 6, borderRightWidth: 1 },
  footer: { marginTop: 16, fontSize: 9, color: '#444', textAlign: 'center' }
});

type LineItem = { description: string; qty: number; amount: number };

export function InvoicePDF({
  org, invoice, buyer, items, totals, legal
}: {
  org: { name: string; address: string[]; cin: string; pan: string; tan?: string; isSection8: boolean; };
  invoice: { number: string; fy: string; date: string; paymentId: string; orderId?: string; };
  buyer: { name: string; email?: string; phone?: string; };
  items: LineItem[];
  totals: { subtotal: number; tax: number; total: number; currency: string; };
  legal: { terms: string[]; footer?: string; };
}) {
  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Text style={S.h1}>TAX INVOICE</Text>

        <View style={S.row}>
          <View>
            <Text>{org.name}</Text>
            {org.address.map((l, i) => <Text key={i}>{l}</Text>)}
            <Text>CIN: {org.cin} | PAN: {org.pan}{org.tan ? ` | TAN: ${org.tan}` : ''}</Text>
            {org.isSection8 && <Text>Section 8 Company (Companies Act, 2013)</Text>}
          </View>
          <View>
            <Text>No: {invoice.number}</Text>
            <Text>FY: {invoice.fy}</Text>
            <Text>Date: {invoice.date}</Text>
            <Text>Payment: {invoice.paymentId}</Text>
            {invoice.orderId && <Text>Order: {invoice.orderId}</Text>}
          </View>
        </View>

        <View style={S.block}>
          <Text>Bill To:</Text>
          <Text>{buyer.name}</Text>
          {buyer.email && <Text>{buyer.email}</Text>}
          {buyer.phone && <Text>{buyer.phone}</Text>}
        </View>

        <View style={[S.block, S.table]}>
          <View style={S.tr}>
            <Text style={S.th}>Description</Text>
            <Text style={S.th}>Qty</Text>
            <Text style={S.th}>Amount ({totals.currency})</Text>
          </View>
          {items.map((li, idx) => (
            <View style={S.tr} key={idx}>
              <Text style={S.td}>{li.description}</Text>
              <Text style={S.td}>{li.qty}</Text>
              <Text style={S.td}>{li.amount.toFixed(2)}</Text>
            </View>
          ))}
          <View style={S.tr}><Text style={S.td}>Subtotal</Text><Text style={S.td}></Text><Text style={S.td}>{totals.subtotal.toFixed(2)}</Text></View>
          <View style={S.tr}><Text style={S.td}>Tax</Text><Text style={S.td}></Text><Text style={S.td}>{totals.tax.toFixed(2)}</Text></View>
          <View style={S.tr}><Text style={S.td}>Total</Text><Text style={S.td}></Text><Text style={S.td}>{totals.total.toFixed(2)}</Text></View>
        </View>

        <View style={S.block}>
          <Text>Tax Note: Issued by a Section 8 Company. No GST charged unless separately notified.</Text>
        </View>

        <View style={S.block}>
          <Text>Terms:</Text>
          {legal.terms.map((t, i) => <Text key={i}>• {t}</Text>)}
        </View>

        <Text style={S.footer}>{legal.footer || 'This is a computer-generated invoice.'}</Text>
      </Page>
    </Document>
  );
}
src/pdfs/DonationReceiptPDF.tsx

tsx
Copy
Edit
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const S = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  h1: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  block: { marginBottom: 10 },
  table: { borderWidth: 1, borderColor: '#222' },
  tr: { flexDirection: 'row' },
  th: { flex: 1, padding: 6, borderRightWidth: 1, fontWeight: 'bold', backgroundColor: '#eee' },
  td: { flex: 1, padding: 6, borderRightWidth: 1 },
  footer: { marginTop: 16, fontSize: 9, color: '#444', textAlign: 'center' }
});

export function DonationReceiptPDF({
  org, receipt, donor, amount, legal
}: {
  org: {
    name: string; address: string[]; cin: string; pan: string; tan?: string;
    isSection8: boolean; has80G: boolean; eightyGNo?: string; eightyGDate?: string;
  };
  receipt: { number: string; fy: string; date: string; paymentId: string; orderId?: string; };
  donor: { name: string; email?: string; phone?: string; anonymous?: boolean; };
  amount: { value: number; currency: string; inWords: string; };
  legal: { notes: string[]; footer?: string; };
}) {
  const donorName = donor.anonymous ? 'Anonymous Donor' : donor.name;
  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Text style={S.h1}>DONATION RECEIPT</Text>

        <View style={S.row}>
          <View>
            <Text>{org.name}</Text>
            {org.address.map((l, i) => <Text key={i}>{l}</Text>)}
            <Text>CIN: {org.cin} | PAN: {org.pan}{org.tan ? ` | TAN: {org.tan}` : ''}</Text>
            {org.isSection8 && <Text>Section 8 Company (Companies Act, 2013)</Text>}
          </View>
          <View>
            <Text>No: {receipt.number}</Text>
            <Text>FY: {receipt.fy}</Text>
            <Text>Date: {receipt.date}</Text>
            <Text>Payment: {receipt.paymentId}</Text>
            {receipt.orderId && <Text>Order: {receipt.orderId}</Text>}
          </View>
        </View>

        <View style={S.block}>
          <Text>Received with thanks from: {donorName}</Text>
          {donor.email && <Text>Email: {donor.email}</Text>}
          {donor.phone && <Text>Phone: {donor.phone}</Text>}
        </View>

        <View style={[S.block, S.table]}>
          <View style={S.tr}>
            <Text style={S.th}>Particulars</Text>
            <Text style={S.th}>Amount ({amount.currency})</Text>
          </View>
          <View style={S.tr}>
            <Text style={S.td}>Voluntary donation to support veteran employment enablement</Text>
            <Text style={S.td}>{amount.value.toFixed(2)}</Text>
          </View>
        </View>

        <View style={S.block}><Text>Amount in words: {amount.inWords}</Text></View>

        <View style={S.block}>
          {org.has80G ? (
            <Text>
              Eligible for deduction under Section 80G of the Income-tax Act, 1961.
              Approval No: {org.eightyGNo} dated {org.eightyGDate}.
            </Text>
          ) : (
            <Text>
              Acknowledgement of voluntary contribution to a Section 8 company.
              80G statement will appear automatically when ORG_HAS_80G=true.
            </Text>
          )}
        </View>

        <View style={S.block}>
          {legal.notes.map((l, i) => <Text key={i}>• {l}</Text>)}
        </View>

        <Text style={S.footer}>{legal.footer || 'Thank you for your support.'}</Text>
      </Page>
    </Document>
  );
}
Generators (create PDF → upload → DB → email)
src/lib/billing/invoices.ts

ts
Copy
Edit
import { pdf as renderPDF } from '@react-pdf/renderer';
import { InvoicePDF } from '@/pdfs/InvoicePDF';
import { nextNumber } from './nextNumber';
import { signedUrl, uploadPdf } from '@/lib/storage';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { sendInvoiceEmail } from '@/lib/emails/sendInvoiceEmail';

export async function generateServiceInvoice({
  userId, buyer, plan, amount, paymentId, orderId
}: {
  userId: string;
  buyer: { name: string; email?: string; phone?: string; };
  plan: { name: string; durationDays: number; };
  amount: number;
  paymentId: string;
  orderId?: string;
}) {
  const supabase = createAdminClient();
  const { number, fy } = await nextNumber('invoice');

  const org = {
    name: process.env.ORG_NAME!,
    address: [process.env.ORG_ADDRESS_LINE_1!, process.env.ORG_ADDRESS_LINE_2!, process.env.ORG_ADDRESS_LINE_3!].filter(Boolean),
    cin: process.env.ORG_CIN!, pan: process.env.ORG_PAN!, tan: process.env.ORG_TAN || undefined,
    isSection8: process.env.ORG_IS_SECTION8 === 'true'
  };

  const items = [{ description: `${plan.name} (${plan.durationDays} days)`, qty: 1, amount }];
  const subtotal = amount, tax = 0, total = amount;

  const doc = (
    <InvoicePDF
      org={org}
      invoice={{ number, fy, date: new Date().toISOString().slice(0,10), paymentId, orderId }}
      buyer={buyer}
      items={items}
      totals={{ subtotal, tax, total, currency: 'INR' }}
      legal={{ terms: ['No refunds', 'Subject to Terms at https://xainik.com/terms'] }}
    />
  );
  const blob = await renderPDF(doc).toBlob();
  const buf = Buffer.from(await blob.arrayBuffer());

  const key = `docs/invoices/${fy}/${number}.pdf`;
  await uploadPdf(key, buf);

  const { error } = await supabase.from('invoices').insert({
    user_id: userId, number, fy, line_items: items, subtotal, tax, total,
    currency: 'INR', payment_id: paymentId, order_id: orderId, pdf_path: key,
    meta: { plan_tier: plan.name, duration_days: plan.durationDays, buyer_name: buyer.name, buyer_email: buyer.email, buyer_phone: buyer.phone }
  });
  if (error) throw error;

  const url = await signedUrl(key);
  if (buyer.email) {
    await sendInvoiceEmail({ to: buyer.email, number, date: new Date(), amount: total, downloadUrl: url });
  }
  return { number, key, url };
}
src/lib/billing/receipts.ts

ts
Copy
Edit
import { pdf as renderPDF } from '@react-pdf/renderer';
import { DonationReceiptPDF } from '@/pdfs/DonationReceiptPDF';
import { nextNumber } from './nextNumber';
import { signedUrl, uploadPdf } from '@/lib/storage';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { sendReceiptEmail } from '@/lib/emails/sendReceiptEmail';

const toWords = (n: number) => `${n} rupees only`; // replace with robust INR words lib

export async function generateDonationReceipt({
  userId, donor, amount, paymentId, orderId, anonymous
}: {
  userId?: string | null;
  donor: { name: string; email?: string; phone?: string; };
  amount: number;
  paymentId: string;
  orderId?: string;
  anonymous?: boolean;
}) {
  const supabase = createAdminClient();
  const { number, fy } = await nextNumber('receipt');

  const org = {
    name: process.env.ORG_NAME!,
    address: [process.env.ORG_ADDRESS_LINE_1!, process.env.ORG_ADDRESS_LINE_2!, process.env.ORG_ADDRESS_LINE_3!].filter(Boolean),
    cin: process.env.ORG_CIN!, pan: process.env.ORG_PAN!, tan: process.env.ORG_TAN || undefined,
    isSection8: process.env.ORG_IS_SECTION8 === 'true',
    has80G: process.env.ORG_HAS_80G === 'true',
    eightyGNo: process.env.ORG_80G_APPROVAL_NO || undefined,
    eightyGDate: process.env.ORG_80G_APPROVAL_DATE || undefined
  };

  const doc = (
    <DonationReceiptPDF
      org={org}
      receipt={{ number, fy, date: new Date().toISOString().slice(0,10), paymentId, orderId }}
      donor={{ name: donor.name, email: donor.email, phone: donor.phone, anonymous }}
      amount={{ value: amount, currency: 'INR', inWords: toWords(amount) }}
      legal={{ notes: ['No goods or services were provided in whole or part in consideration of this donation.'] }}
    />
  );
  const blob = await renderPDF(doc).toBlob();
  const buf = Buffer.from(await blob.arrayBuffer());

  const key = `docs/receipts/${fy}/${number}.pdf`;
  await uploadPdf(key, buf);

  const { error } = await supabase.from('receipts').insert({
    user_id: userId || null, donor_name: donor.name, donor_email: donor.email, donor_phone: donor.phone,
    number, fy, amount, currency: 'INR', payment_id: paymentId, order_id: orderId,
    anonymous: !!anonymous, pdf_path: key
  });
  if (error) throw error;

  const url = await signedUrl(key);
  if (donor.email) {
    await sendReceiptEmail({ to: donor.email, number, date: new Date(), amount, downloadUrl: url });
  }
  return { number, key, url };
}
Email Dispatchers (Resend)
src/lib/emails/sendInvoiceEmail.ts

ts
Copy
Edit
import { Resend } from 'resend';

export async function sendInvoiceEmail({ to, number, date, amount, downloadUrl }:{
  to: string; number: string; date: Date; amount: number; downloadUrl: string;
}) {
  if (!to) return;
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: `Xainik Billing <billing@xainik.com>`,
    to, subject: `Your Invoice ${number} — VETERAN SUCCESS FOUNDATION`,
    html: `
      <p>Dear Veteran,</p>
      <p>Thank you for your purchase. Your invoice is ready.</p>
      <p><strong>Invoice:</strong> ${number}<br/>
         <strong>Date:</strong> ${date.toISOString().slice(0,10)}<br/>
         <strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
      <p><a href="${downloadUrl}">Download Invoice (PDF)</a></p>
      <p>Regards,<br/>VETERAN SUCCESS FOUNDATION</p>
    `
  });
}
src/lib/emails/sendReceiptEmail.ts

ts
Copy
Edit
import { Resend } from 'resend';

export async function sendReceiptEmail({ to, number, date, amount, downloadUrl }:{
  to: string; number: string; date: Date; amount: number; downloadUrl: string;
}) {
  if (!to) return;
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: `Xainik Donations <donations@xainik.com>`,
    to, subject: `Donation Receipt ${number} — VETERAN SUCCESS FOUNDATION`,
    html: `
      <p>Dear Donor,</p>
      <p>Thank you for your contribution. Your receipt is ready.</p>
      <p><strong>Receipt:</strong> ${number}<br/>
         <strong>Date:</strong> ${date.toISOString().slice(0,10)}<br/>
         <strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
      <p><a href="${downloadUrl}">Download Donation Receipt (PDF)</a></p>
      <p>Regards,<br/>VETERAN SUCCESS FOUNDATION</p>
    `
  });
}
Webhook integration (extend your Razorpay route)
Verify signature

Idempotency via payment_events

Branch on order.notes.type:

service → generateServiceInvoice(...)

donation → generateDonationReceipt(...)

Ensure order.notes includes userId, names/emails/phones, plan meta, and anonymous for donations.

Signed download API
GET /api/docs/invoice/[id] → verify owner/admin → signed URL (24h) → 302 redirect

GET /api/docs/receipt/[id] → ditto

Dashboards
Veteran Dashboard → “Invoices”: number (download), date, plan, amount

Supporter Dashboard → “Donation Receipts”: number (download), date, amount, anonymous flag

General rules:
- No dummy data in UI: all lists/query from Supabase.
- Use Supabase JS client with server components where possible.
- Use migrations under /supabase/migrations — no manual SQL in production.
- Verify all actions respect RLS.
- Track referral loops fully (who, platform, when) for analytics later.
- Trigger Resend emails per Notification Matrix in the spec.

On completion:
- Update docs/decisions.md for any deviations from the spec.
- Update docs/cursor-plan.md checklist with completed items and next steps.


```

---

This is the full A→Z master spec, with SQL included.  

::contentReference[oaicite:0]{index=0}
```
