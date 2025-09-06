# Scripts Directory

This directory contains utility scripts for the Xainik project.

## Media Migration

### `migrate-media.ts`

Batch converts legacy images to WebP format with multiple sizes (hero, card, thumb).

#### Usage

```bash
# Dry run to see what would be converted
pnpm tsx scripts/migrate-media.ts --dry

# Convert up to 100 records
pnpm tsx scripts/migrate-media.ts --limit 100

# Convert only poster media for a specific speaker
pnpm tsx scripts/migrate-media.ts --speaker abc123 --kinds poster

# Convert all photo and poster media
pnpm tsx scripts/migrate-media.ts --kinds poster,photo

# Full migration (default limit: 1000)
pnpm tsx scripts/migrate-media.ts
```

#### Options

- `--dry` - Dry run mode (no changes made)
- `--limit N` - Maximum number of records to process (default: 1000)
- `--speaker SPEAKER_ID` - Process only media for specific speaker
- `--kinds poster,photo` - Comma-separated list of media kinds to process
- `--maxWidth N` - Maximum width for resizing (default: 2000)
- `--help` - Show help message

#### What it does

1. Queries media records that are not WebP or missing size variants
2. Downloads the original image
3. Converts to WebP with 3 sizes: hero (1600w), card (800w), thumb (320w)
4. Uploads to Supabase Storage under new naming convention
5. Updates the media record with new URLs and metadata
6. Marks old URLs as archived (doesn't delete them)
7. Creates audit log entry

## Policy Checking

### `check-webp-policy.ts`

Validates that all media records comply with WebP-only policy.

#### Usage

```bash
# Check WebP policy compliance
pnpm tsx scripts/check-webp-policy.ts
```

#### What it checks

- All media records have `mime: "image/webp"`
- All records have size variants (hero, card, thumb)
- URLs contain `.webp` extension
- Required metadata is present (source, version)

## Spec Validation

### `spec-check.ts`

Validates that Prisma schema matches the SPEC.yaml definition.

### `find-dead.ts`

Identifies potentially unused files in the codebase.

### `codemod-guards.ts`

Ensures all API handlers use Zod validation.

## Running Scripts

All scripts can be run using:

```bash
# Using npm scripts (recommended)
npm run webp:check
npm run media:migrate -- --dry

# Direct execution
pnpm tsx scripts/script-name.ts [options]
```

## Environment Requirements

Scripts require the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Make sure these are set in your `.env` file before running scripts.
