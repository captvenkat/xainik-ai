# Build Captain System - Complete Operating Playbook

This is a **single, paste-ready operating playbook** for Cursor. It's turnkey: one **System Prompt**, a **Master Runbook**, and a set of **atomic tasks** Cursor can execute in order.

## 🚀 Quick Start

### 1. Set the System Prompt for Cursor

**Paste this as Cursor's System Prompt (or first message):**

```
You are **Build Captain** for Xainik (xainik.com). Operate in AUTO mode.

SINGLE SOURCE OF TRUTH (SSOT):
- docs/PROJECT_SPEC.md
- docs/SPEC.yaml

NON-NEGOTIABLE RULES
1) If a detail isn't in SSOT, update SSOT first, then code.
2) Never touch or leak secrets. Do not modify values of .env files or Vercel envs.
3) Never edit historical migrations; add new ones.
4) All API handlers must validate with Zod.
5) "Facts from DB only"; missing facts → graceful message (no guesses).
6) Images = WebP only (hero/card/thumb) with Supabase Storage.
7) Payments: 10% service fee; PG fee absorbed; no listing fee.
8) Posters: feature-gated by RUNWARE key; rate limit 10/day/user.
9) Alerts: 3+ failures on /api/posters in 10m → email to ADMIN_ALERTS_EMAIL (cooldown 30m).
10) Always produce a **Spec Compliance Report** (spec → files → migrations → tests).

WORK STYLE
- Make small, auditable PRs.
- Move legacy to /graveyard (don't delete in same PR).
- If blocked, halt and patch the spec with rationale.
```

### 2. MASTER RUNBOOK (one message to Cursor)

**Paste this message to orchestrate the whole flow:**

```
TASK: master-runbook

Objective:
Run end-to-end: Preflight → Self-Check → Preview Smoke → Production Deploy → Post-Deploy Smoke. If any step fails, stop and output the failure + minimal fix plan.

Phases:

A) PREFLIGHT (local/CI)
- Run:
  pnpm prisma generate
  pnpm run preflight
  # preflight should include: spec:check, dead:find, typecheck, tests, webp policy (soft-skip ok)

B) SELF-CHECK (functional)
- Execute the "full-self-check" task (if not present, create now) to validate Organizer, Speaker, Donor, Admin flows against SSOT. 
- Output a **Self-Check Compliance Report** with ✅/⚠️/❌ and spec line refs.
- If any ❌ → STOP and print the exact fix tasks (no deploy).

C) PREVIEW DEPLOY + SMOKE
- Ensure a PR is open to trigger Vercel Preview. When Preview URL is available:
  PREVIEW_URL=<preview-url> pnpm run smoke:preview
- If smoke fails → STOP and print minimal fix tasks.

D) PRODUCTION DEPLOY + SMOKE
- Merge to main (Vercel Git auto-deploy).
- Run:
  pnpm run smoke:prod
- If smoke fails → STOP and post rollback instructions (Vercel rollback to last green) + fix tasks.

E) POST-DEPLOY WATCH (informational)
- Confirm /admin/media loads, dry scan runs, and alerts configured to ceo@faujnet.com.
- Print short "Day-0 watchpoints" list for the operator (payments webhooks, posters errors, Resend bounces).

Deliverable:
- A single comment/summary containing:
  - Preflight result
  - Self-Check summary
  - Preview smoke result (with URL)
  - Prod smoke result (with URL)
  - Go/No-Go statement
  - If No-Go → ordered fix plan
```

## 🔧 Available Tasks

### Core Tasks

#### `master-runbook`
Run the complete end-to-end deployment pipeline with all phases.

#### `full-self-check`
Programmatically validate all flows against SSOT:
- Organizer: create event → shortlist 3 (fixture speakers) → quote accept (mock payment webhook) → invoice created
- Speaker: onboarding (stub LinkedIn ingest) → Runware gen (mock fetch) → WebP media rows present → availability saved
- Donor: donate tiers visible → test-mode order created (or 503 gated) → receipt logic wired
- Admin: /admin/media loads → dry scan returns number → alert throttle available
- System: Zod on API; images are WebP; rate limit posters 10/day/user; 10% fee; no listing fee; CI green

#### `preview-smoke`
Run smoke tests on Vercel Preview:
- Wait for Preview URL
- Run: `PREVIEW_URL=<url> pnpm run smoke:preview`
- Output responses (status + trimmed body)
- If any check fails, STOP and print fix steps

#### `deploy-or-rollback`
Deploy to production via Vercel Git or rollback:
- Merge to main → wait for prod deploy → run `pnpm run smoke:prod`
- If smoke passes → print GO message with URLs
- If smoke fails → perform Vercel rollback to last green; post failure analysis + minimal fix plan

### Setup Tasks

#### `ensure-preflight-workflows`
Add/verify GitHub workflows for Preflight & Deploy and package scripts:
1. Create/verify `.github/workflows/preflight.yml`
2. Create/verify `.github/workflows/deploy.yml`
3. Ensure scripts in `package.json`
4. Ensure `scripts/predeploy-smoke.sh` exists and is executable
5. Append "Deploy & Preflight" section to `docs/PROJECT_SPEC.md`

#### `fix-blockers`
Resolve any ❌ from Self-Check quickly:
1. Razorpay: `lib/razorpay.ts` returns 503 `{ code:"PAYMENTS_DISABLED" }` if keys missing
2. Prisma relations: make UI import match model name; run `pnpm prisma generate && pnpm prisma migrate deploy`
3. TS path alias: single `"paths": { "@/*": ["./*"] }` in root tsconfig; remove duplicates
4. Missing components: ensure BookingActions at `@/components/BookingActions` or fix path

### Feature Tasks

#### `wire-runware`
Ensure posters endpoint uses RUNWARE_API_KEY from env, rate-limits, and stores WebP variants:
- `app/api/posters/route.ts`: read key at call; 503 FEATURE_DISABLED if missing
- `lib/rate-limiter`: 10/day/user; 429 on 11th
- WebP pipeline (hero/card/thumb) saved to Supabase; media row updated

#### `alerts-on-failures`
Email ceo@faujnet.com when /api/posters fails 3+ times in 10m:
- `src/lib/alert-throttle.ts` used in posters route catch
- ENV: `RESEND_API_KEY`, `ADMIN_ALERTS_EMAIL=ceo@faujnet.com`
- Test: simulate 3 failures; ensure email send is attempted (mocked)

#### `migrate-legacy-images`
Convert legacy images to WebP variants and update media rows:
- Dry run: `pnpm tsx scripts/migrate-media.ts --dry --limit 50`
- Pilot: `pnpm tsx scripts/migrate-media.ts --limit 200`
- Full: `pnpm tsx scripts/migrate-media.ts`
- Confirm /admin/media shows declining legacy count

## 📋 Package Scripts

```json
{
  "scripts": {
    "preflight": "pnpm prisma generate && pnpm spec:check && pnpm dead:find && tsc --noEmit && pnpm test --if-present && pnpm run webp:check || true",
    "spec:check": "tsx scripts/spec-check.ts",
    "dead:find": "tsx scripts/find-dead.ts",
    "webp:check": "tsx scripts/check-webp-policy.ts",
    "smoke:preview": "bash scripts/predeploy-smoke.sh $PREVIEW_URL",
    "smoke:prod": "bash scripts/predeploy-smoke.sh https://xainik.com",
    "self-check": "tsx scripts/self-check.ts",
    "master-runbook": "tsx scripts/master-runbook.ts"
  }
}
```

## 🌐 Environment Requirements

Required Vercel environment variables:
- `RUNWARE_API_KEY` - For poster generation
- `NEXT_PUBLIC_RUNWARE_ENABLED=true` - Feature flag
- `RAZORPAY_KEY_ID` - Payment processing
- `RAZORPAY_KEY_SECRET` - Payment processing
- `RESEND_API_KEY` - Email service
- `NEXT_PUBLIC_SUPABASE_URL` - Database
- `SUPABASE_SERVICE_ROLE_KEY` - Database
- `NEXTAUTH_URL=https://xainik.com` - Authentication
- `ADMIN_ALERTS_EMAIL=ceo@faujnet.com` - Alert notifications

## 🚨 Smoke Test Endpoints

The smoke tests verify these critical endpoints:

1. **`/admin/media`** (expect 200)
2. **`/api/posters`** (200 with urls or 503 FEATURE_DISABLED)
3. **`/api/admin/run-migration-scan`** (JSON response or 500 if schema missing)
4. **Basic API endpoints** (`/api/events`, `/api/speakers`, `/api/donations/create-order`)

## 📊 Day-0 Watchpoints

After successful deployment, monitor:
- `/admin/media` loads correctly
- Dry scan runs without errors
- Alerts configured to ceo@faujnet.com
- Payment webhooks responding
- Poster generation within rate limits
- Resend email delivery healthy
- No 500 errors in logs

## 🔄 Rollback Procedure

If production smoke tests fail:
1. Go to Vercel Dashboard
2. Find the failed deployment
3. Click "Rollback" to last green deployment
4. Run fix tasks and retry

## 📝 Usage Examples

### Run Complete Pipeline
```bash
pnpm run master-runbook
```

### Run Individual Checks
```bash
pnpm run preflight
pnpm run self-check
pnpm run smoke:preview
pnpm run smoke:prod
```

### Test with Preview URL
```bash
PREVIEW_URL=https://xainik-git-feature-branch.vercel.app pnpm run smoke:preview
```

## 🎯 Success Criteria

- ✅ Preflight passes all checks
- ✅ Self-check shows no ❌ (warnings acceptable)
- ✅ Preview smoke green → merge → prod smoke green
- ✅ `/admin/media` healthy, dry scan works, alerts configured
- ✅ Rollback path verified (know where the Vercel "Rollback" button is)

This system ensures reliable, auditable deployments with comprehensive validation at every step.
