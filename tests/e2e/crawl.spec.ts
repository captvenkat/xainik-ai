// tests/e2e/crawl.spec.ts
import { test, expect } from '@playwright/test';
import { isInternal, normalize } from './utils/links';

test('Crawl internal links up to depth=2 and verify 200', async ({ page, request, baseURL }) => {
  test.setTimeout(120_000);
  const base = new URL(baseURL!);
  const start = [`${base}/`, `${base}/browse`, `${base}/pricing`, `${base}/donations`];

  const queue: { url: string; depth: number; referer?: string }[] = start.map(u => ({ url: u, depth: 0 }));
  const visited = new Set<string>();
  const failures: { url: string; status: number; referer?: string }[] = [];

  while (queue.length) {
    const { url, depth, referer } = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    const res = await request.get(url.replace(base.origin, ''));
    const status = res.status();
    if (status >= 400) failures.push({ url, status, referer });
    if (depth >= 2) continue;

    // parse links on-page
    await page.goto(url);
    const hrefs = await page.$$eval('a[href]', as => as.map(a => (a as HTMLAnchorElement).getAttribute('href') || ''));
    for (const href of hrefs) {
      if (!href) continue;
      if (!isInternal(href, base)) continue;
      const next = normalize(href, base);
      if (!visited.has(next)) queue.push({ url: next, depth: depth + 1, referer: url });
    }
  }

  // Report
  if (failures.length) {
    console.table(failures);
  }
  expect(failures, `Broken internal links:\n${failures.map(f => `${f.status} ${f.url} ← ${f.referer || ''}`).join('\n')}`).toHaveLength(0);
});
