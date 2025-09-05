# Xainik — SSOT (Project Spec)

## Product
AI-first speakers marketplace (organizers, speakers, donors). Voice-or-text chat entry (hybrid), Explore grid for browsing, Inbox for threads, Me for dashboards.

## Non-negotiables
- 10% service fee (PG fee absorbed inside 10%).
- No listing fee.
- Facts ONLY from DB; creative from AI.
- Mobile-first, thumb-operated, WebP images, lazy-loading.
- Larger-than-life speaker visuals (Runware posters) + 30s voice pitch.
- Donor tiers: ₹1,000 / ₹2,500 / ₹5,000 / ₹7,500 / ₹10,000 / Custom.
- Impact counters: Speakers Onboarded, Talks Delivered, Audience Reached, Donations Raised.

## Core Flows
- Organizer → Intent → AI asks for missing (date/budget/format/delivery) → shortlist(3) from DB → thread → quote accept → pay (Razorpay) → auto-invoice → payout 90% to speaker.
- Speaker → Onboard (LinkedIn/PDF) → AI suggests topics/audiences/fee band → Runware posters → 30s voice pitch → publish.
- Donor → Choose tier → pay → receipt PDF emailed → dashboard shows history.

## Data Model (authoritative nouns)
Users, Speakers, Media, Events, Quotes, Bookings, Payments, Payouts, Invoices, Donations, Notifications, MessageThreads, Messages, Audit, FeatureFlags.

## API Contracts (authoritative)
OrganizerIntent, ShortlistResponse, SpeakerOnboardResult, DonationOffer, QuoteAction, BookingReceipt.

## Definition of Done
- Spec updated (this file + SPEC.yaml)
- Prisma migration generated
- Zod contracts updated
- API handlers updated with Zod validation
- UI wired (chips/buttons minimal)
- Contract tests + minimal e2e
- CI green
- Spec Compliance Report attached in PR
