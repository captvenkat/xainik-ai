// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('Homepage renders OK & shows key CTAs', async ({ page, baseURL }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Xainik/i);
  await expect(page.locator('h1')).toContainText(/Fastest Hiring Platform/i);
  await expect(page.getByRole('link', { name: /Post My Pitch/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Browse Veterans/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Refer a Pitch/i })).toBeVisible();
});

test('Footer rendered once and has updated contact', async ({ page }) => {
  await page.goto('/');
  const footers = page.locator('footer');
  await expect(footers).toHaveCount(1);
  await expect(page.locator('footer a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:ceo@faujnet.com');
});

test('/sitemap.xml & /robots.txt return 200', async ({ request }) => {
  const sm = await request.get('/sitemap.xml');
  expect(sm.status()).toBe(200);
  const rb = await request.get('/robots.txt');
  expect(rb.status()).toBe(200);
});
