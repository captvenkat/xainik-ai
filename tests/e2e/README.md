# Playwright E2E Tests

This directory contains end-to-end tests for the Xainik platform using Playwright.

## Setup

1. Install Playwright:
```bash
npm i -D @playwright/test
npx playwright install chromium
```

2. Create `.env.test` file (optional):
```bash
BASE_URL=http://localhost:3000
```

## Test Structure

- `smoke.spec.ts` - Basic smoke tests for homepage, footer, and static files
- `crawl.spec.ts` - Link crawler that checks internal links up to depth 2
- `functional.spec.ts` - Functional tests for key user flows
- `utils/links.ts` - Utility functions for link crawling

## Running Tests

### Local Development
```bash
# Run all tests against localhost
npm run test:e2e:local

# Or with environment variable
BASE_URL=http://localhost:3000 npx playwright test
```

### Production Testing
```bash
# Run against production (read-only tests)
npm run test:e2e:prod

# Or with environment variable
BASE_URL=https://xainik.com npx playwright test
```

### Specific Test Files
```bash
# Run only smoke tests
npx playwright test smoke.spec.ts

# Run only functional tests
npx playwright test functional.spec.ts

# Run only link crawler
npx playwright test crawl.spec.ts
```

### Debug Mode
```bash
# Run with browser visible
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

## Test Coverage

### Smoke Tests
- Homepage renders with key CTAs
- Footer appears once with correct contact info
- Sitemap and robots.txt return 200

### Link Crawler
- Crawls internal links up to depth 2
- Reports broken links with status codes
- Deduplicates URLs and strips hash fragments

### Functional Tests
- Browse page filters work and update URL
- Pricing page shows CTAs
- Donations page has form elements
- Pitch detail pages have contact buttons (if pitches exist)

## Configuration

The tests are configured in `playwright.config.ts`:
- Uses Chromium browser
- 30-second timeout per test
- Headless mode by default
- HTML reporter for failed tests
- Base URL from environment variable

## Notes

- The link crawler test has a 2-minute timeout due to the number of pages it needs to check
- Functional tests are designed to be non-destructive and read-only
- Tests will skip gracefully if required elements don't exist (e.g., no pitch cards)
- All tests use semantic selectors (getByRole, getByLabel) for better maintainability
