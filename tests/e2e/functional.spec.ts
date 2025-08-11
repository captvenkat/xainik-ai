// tests/e2e/functional.spec.ts
import { test, expect } from '@playwright/test';

test('Browse page filters render and update URL', async ({ page }) => {
  await page.goto('/browse');
  await expect(page.getByRole('heading', { name: /Browse Veterans/i })).toBeVisible();

  // Click on filters to expand them
  await page.getByRole('button', { name: /Filters/i }).click();
  
  const jobType = page.getByLabel(/Job Type/i);
  if (await jobType.isVisible()) {
    await jobType.selectOption({ label: 'Full-time' }).catch(() => {});
    await expect(page).toHaveURL(/jobType=full-time/);
  }
});

test('Pricing page CTAs exist', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.getByRole('heading', { name: /Simple, Transparent Pricing/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Choose Plan/i })).toBeVisible();
});

test('Donations page shows form', async ({ page }) => {
  await page.goto('/donations');
  await expect(page.getByRole('textbox', { name: /Name/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /Email/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Donate/i })).toBeVisible();
});

test('Sample pitch detail has call/email buttons (if any pitch exists)', async ({ page, request }) => {
  // Try open first active pitch from sitemap or browse listing
  const browse = await request.get('/browse');
  if (browse.status() >= 400) test.skip(true, 'Browse not available');
  await page.goto('/browse');
  const firstCard = page.locator('[data-test="pitch-card"]').first();
  const exists = await firstCard.count();
  test.skip(exists === 0, 'No pitch cards to test');

  await firstCard.click();
  await expect(page).toHaveURL(/\/pitch\//);
  const callBtn = page.getByRole('link', { name: /Call/i });
  const emailBtn = page.getByRole('link', { name: /Email/i });
  await expect(callBtn).toBeVisible();
  await expect(emailBtn).toBeVisible();
});
