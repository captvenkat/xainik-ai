# CURSOR MASTER PROMPT — XAINIK "MAGIC MODE" (APPEND-ONLY, MOBILE-FIRST)

## 0) HARD GUARDRAILS (read first, enforce)

* **Append-only.** Do **NOT** rename, move, or delete existing files, routes, tables, columns, components, or env keys.
* **No assumptions.** If unclear, insert `// TODO(cursor): clarify with maintainer` and stop at that boundary. Do not invent types, paths, or DB tables.
* **Feature-flagged.** New UI is visible only when `NEXT_PUBLIC_FEATURE_MAGIC_MODE === "true"`.
* **Private resumes.** Resume files must remain in **private storage**; never expose raw URLs.
* **No PWA.** Do not add service workers or web app manifests.
* **Global nav untouched.** Do **not** modify `src/components/Navigation.tsx`.
* **Versioned APIs.** New endpoints under `/api/xainik/*`. You may **extend** `/api/track-event` minimally to accept `story_id` if it already exists.
* **DB migrations.** Use `IF NOT EXISTS`. No destructive ALTER/DROP. Mirror pitches' RLS on new tables.
* **Mobile-first.** All new screens/components use single column, `max-w-[480px] mx-auto px-4`, large touch targets (≥44px).

---

## 1) ENV FLAGS (append to `.env.example`, don't change existing keys)

```
NEXT_PUBLIC_FEATURE_MAGIC_MODE=true
NEXT_PUBLIC_FEATURE_FOUNDING50=true
```

---

## 2) ROUTING (add, do not replace)

Keep existing routes. **Add** only:

* Public story page: `src/app/pitch/[id]/[storySlug]/page.tsx`
* Veteran dashboard tabs if missing:

  * `src/app/dashboard/veteran/stories/page.tsx`
  * `src/app/dashboard/veteran/supporters/page.tsx`
  * `src/app/dashboard/veteran/analytics/page.tsx`

**Enhance (append)**

* `src/app/pitch/new/page.tsx` → add Magic vs Classic toggle (Magic default if flag on).
  Do **not** remove existing fields; Classic section must still render exactly as is.

---

## 3) UI COMPONENTS (new, app-like, mobile-first)

Create (do not touch global nav):

```
src/components/AppContainer.tsx
src/components/BottomNav.tsx                // render only on /dashboard/veteran*
src/components/veteran/ObjectivePicker.tsx  // chips from AI
src/components/veteran/ChipGroup.tsx        // reusable chip selector, max={3}, allowCustom
src/components/veteran/AutoPitch.tsx        // title (<=80) + summary (<=300)
src/components/veteran/StorySuggestions.tsx  // 3 cards: title/angle/outline; Use/More/Edit
src/components/veteran/StoryCard.tsx
src/components/veteran/StoryModal.tsx
```

---

## 4) MAGIC FLOW (zero-typing, minimal friction)

**MagicPitchWizard** (inside `/pitch/new/page.tsx`), all wrapped in `<AppContainer>`:

1. **Resume Upload** (reuse existing uploader)
2. **ObjectivePicker** → AI chips
3. **Preferences (ChipGroup)**
4. **AutoPitch** → title + summary approve/regenerate/edit
5. **Daily Story Suggestions** → 3 cards, publish 1/day, queue extras

---

## 5) AI API (server-side only) — new endpoints & prompt flow

```
src/app/api/xainik/ai/suggest-objectives/route.ts
src/app/api/xainik/ai/auto-pitch/route.ts
src/app/api/xainik/ai/suggest-stories/route.ts
src/app/api/xainik/ai/expand-story/route.ts
```

Prompt templates:  
- **Suggest Objectives** → 6–8 chips  
- **Auto Pitch** → title (≤80), summary (≤300)  
- **Suggest Stories** → 3 items with title/angle/outline  
- **Expand Story** → summary + body_md (120–180 words)  

---

## 6) STORIES API (CRUD & publish/queue)

```
src/app/api/xainik/stories/route.ts
src/app/api/xainik/stories/[id]/publish/route.ts
src/app/api/xainik/stories/[pitchId]/route.ts
```

Behavior: enforce 1/day publish; queue extras for 00:05 IST.

---

## 7) PUBLIC STORY PAGE (append route)

`src/app/pitch/[id]/[storySlug]/page.tsx` → SSR fetch + render story, track analytics, share buttons.  
Append "More About Me" to `/pitch/[id]`.

---

## 8) ANALYTICS

Extend `/api/track-event` to accept `story_id` OR add:

```
src/app/api/xainik/analytics/route.ts
```

Helper: `src/lib/metrics/emit.ts`.

---

## 9) RESUME CONSENT + RECRUITER REASON

- Add `reason` column to `resume_requests`.  
- Auto-generate tailored PDF with expiring watermarked link.

---

## 10) DATABASE (append-only migration)

`supabase/migrations/2025-08-26_magic_mode.sql`:

```sql
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text not null,
  body_md text not null,
  source_spans jsonb,
  status text not null check (status in ('draft','queued','published')) default 'draft',
  scheduled_for date,
  published_at timestamptz,
  created_at timestamptz default now()
);
create unique index if not exists stories_pitch_slug_uidx on public.stories(pitch_id, slug);

alter table if exists public.pitches
  add column if not exists objective text,
  add column if not exists preferences jsonb default '{}';

alter table if exists public.analytics_events
  add column if not exists story_id uuid null references public.stories(id) on delete set null;

alter table if exists public.resume_requests
  add column if not exists reason text;

-- TODO(cursor): mirror RLS from pitches to stories
```

---

## 11) TYPES

`src/types/xainik.ts` with:  
- PitchId, StoryId  
- StoryCandidate, StoryPublic  
- AnalyticsEvent  
- AutoPitchInput, AutoPitchOutput

---

## 12) AI QUALITY + REGENERATION

- Temperature: 0.4 pitch, 0.6 stories  
- Char limits enforced  
- Regeneration avoids duplicates  
- Timeout 12s + retry once  
- Cache last 3 results for 10m  
- Strip PII

---

## 13) UX RULES

- Chips everywhere  
- Counters on title/summary  
- 1/day publish, extras queued  
- All new pages wrapped in `<AppContainer>`  
- Share buttons with auto-UTM

---

## 14) ACCEPTANCE CHECKLIST

- Classic flow unchanged  
- `/pitch/new` shows Magic vs Classic  
- Magic flow works end-to-end  
- Daily story suggestions, 1/day publish  
- Public pitch shows stories  
- Public story renders, analytics logs story_id  
- Resume request requires reason, tailored PDF  
- Global nav untouched  
- Mobile Lighthouse ≥90

---

## 19) ACCEPTANCE CHECKLIST VERIFICATION

Add `scripts/verify_magic_mode.ts` → static checks for env, routes, components, APIs, migration, types.  
Append script to `package.json`:  

```json
"verify:magic": "ts-node --compiler-options '{\"module\":\"commonjs\"}' scripts/verify_magic_mode.ts"
```

Add `docs/ACCEPTANCE.md`.

---

## 20) FINAL SUMMARY & NEXT STEPS

Create `docs/MAGIC_MODE_SUMMARY.md` with overview, file list, runbook, privacy notes.  

Helper commands:

```bash
find . -name "*.tsx" -o -name "*.ts" -o -name "*.sql" | grep -E "(magic|story|xainik)" | head -20
find src -name "*.tsx" -o -name "*.ts" | grep -E "(magic|story|xainik|veteran)" | sort
```

---

**End of Master Prompt. Follow exactly. If unclear, insert `// TODO(cursor)` instead of guessing.**
