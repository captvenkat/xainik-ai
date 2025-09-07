# Core Flows
- Organizer: Create events, shortlist speakers, book, pay
- Speaker: OAuth login, profile, topics, availability
- Donor: Tiers, pay, receipt + email
- Booking: Link Event↔Speaker + confirmation

# Build Captain System

## System Prompt
The Build Captain operates in AUTO mode with strict adherence to SSOT (Single Source of Truth):
- docs/PROJECT_SPEC.md
- docs/SPEC.yaml

## Non-Negotiable Rules
1. If a detail isn't in SSOT, update SSOT first, then code
2. Never touch or leak secrets. Do not modify values of .env files or Vercel envs
3. Never edit historical migrations; add new ones
4. All API handlers must validate with Zod
5. "Facts from DB only"; missing facts → graceful message (no guesses)
6. Images = WebP only (hero/card/thumb) with Supabase Storage
7. Payments: 10% service fee; PG fee absorbed; no listing fee
8. Posters: feature-gated by RUNWARE key; rate limit 10/day/user
9. Alerts: 3+ failures on /api/posters in 10m → email to ADMIN_ALERTS_EMAIL (cooldown 30m)
10. Always produce a **Spec Compliance Report** (spec → files → migrations → tests)

## Available Tasks
- `master-runbook`: Run end-to-end deployment pipeline
- `full-self-check`: Programmatically validate all flows against SSOT
- `preview-smoke`: Run smoke tests on Vercel Preview
- `deploy-or-rollback`: Deploy to production or rollback on failure
- `ensure-preflight-workflows`: Add/verify GitHub workflows and scripts
- `fix-blockers`: Resolve any ❌ from Self-Check quickly
- `wire-runware`: Ensure posters endpoint uses RUNWARE_API_KEY
- `alerts-on-failures`: Email alerts for /api/posters failures
- `migrate-legacy-images`: Convert legacy images to WebP variants

## Deploy & Preflight

### Preflight Workflow
Runs comprehensive pre-deployment checks:
- `pnpm prisma generate` - Generate Prisma client
- `pnpm spec:check` - Validate against specification
- `pnpm dead:find` - Find dead code
- `tsc --noEmit` - TypeScript type checking
- `pnpm test --if-present` - Run tests if available
- `pnpm run webp:check || true` - WebP policy check (optional)

### Master Runbook Phases
A) **PREFLIGHT** (local/CI) - Run preflight checks
B) **SELF-CHECK** (functional) - Validate all flows against SSOT
C) **PREVIEW DEPLOY + SMOKE** - Test on Vercel Preview
D) **PRODUCTION DEPLOY + SMOKE** - Deploy and test production
E) **POST-DEPLOY WATCH** - Monitor critical systems

### Smoke Tests
- `/admin/media` (expect 200)
- `/api/posters` (200 with urls or 503 FEATURE_DISABLED)
- `/api/admin/run-migration-scan` (JSON response or 500 if schema missing)
- Basic API endpoints health check

### Environment Requirements
- Vercel envs: `RUNWARE_API_KEY`, `NEXT_PUBLIC_RUNWARE_ENABLED=true`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_URL=https://xainik.com`, `ADMIN_ALERTS_EMAIL=ceo@faujnet.com`

### Package Scripts
- `preflight`: Run all preflight checks
- `spec:check`: Validate against specification
- `dead:find`: Find dead code
- `webp:check`: Check WebP policy compliance
- `smoke:preview`: Run smoke tests on preview URL
- `smoke:prod`: Run smoke tests on production
- `self-check`: Run comprehensive self-check
- `master-runbook`: Run complete deployment pipeline