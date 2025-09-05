import { z } from 'zod';

export const OrganizerIntent = z.object({
  city: z.string(),
  date: z.string().optional(),
  audience_type: z.string(), // college|school|corporate|summit|govt|community
  audience_size: z.number().int().positive().optional(),
  format: z.string().optional(),     // keynote|seminar|workshop|panel
  delivery: z.string().optional(),   // in_person|virtual|hybrid
  budget_min: z.number().int().nonnegative().optional(),
  budget_max: z.number().int().nonnegative().optional(),
});

export const ShortlistResponse = z.object({
  speakers: z.array(z.object({
    speaker_id: z.string(),
    name: z.string(),
    poster_url: z.string().url().optional(),
    fee_band: z.object({ min: z.number(), max: z.number(), source: z.literal('db') }),
    availability_preview: z.array(z.string()),
    source: z.literal('db'),
  })),
  chips: z.array(z.string())
});

export const SpeakerOnboardResult = z.object({
  topics: z.array(z.string()),
  audiences: z.array(z.string()),
  fee_band_suggestion: z.object({ min: z.number(), max: z.number(), rationale: z.string(), source: z.literal('ai') }),
  poster_set: z.object({ hero: z.string().url(), square: z.string().url(), story: z.string().url() }),
  source: z.literal('ai')
});

export const DonationOffer = z.object({
  tiers: z.array(z.object({
    label: z.string(),
    amount: z.number().int().nonnegative()
  })),
  custom_allowed: z.boolean().default(true)
});

export type OrganizerIntent = z.infer<typeof OrganizerIntent>;
export type ShortlistResponse = z.infer<typeof ShortlistResponse>;
export type SpeakerOnboardResult = z.infer<typeof SpeakerOnboardResult>;
export type DonationOffer = z.infer<typeof DonationOffer>;
