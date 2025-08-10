// quick-audit.js
// Crawl internal links, check status codes, console errors, failed requests.
// Usage: SITE_URL=https://yoursite.com node quick-audit.js

import { chromium } from 'playwright';

const START_URL = process.env.SITE_URL || 'http://localhost:3000';
const MAX_PAGES = 50;
const seen = new Set();
const queue = [START_URL];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const results = [];

  while (queue.length && seen.size < MAX_PAGES) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    const errors = [];
    const fails = [];

    page.removeAllListeners();
    page.on('console', msg => msg.type() === 'error' && errors.push(msg.text()));
    page.on('requestfailed', req => fails.push(req.url()));

    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = resp?.status() || 'ERR';
      console.log(`${status} ${url}`);

      // Extract internal links
      const hrefs = await page.$$eval('a[href]', as =>
        as.map(a => new URL(a.href, location.origin).href)
      );
      hrefs.filter(h => h.startsWith(START_URL)).forEach(h => {
        if (!seen.has(h)) queue.push(h);
      });

      results.push({ url, status, errors, fails });
    } catch (err) {
      results.push({ url, status: 'NAV_ERROR', errors: [String(err)], fails });
    }
  }

  await browser.close();

  console.log(`\n=== Audit Report (${results.length} pages) ===`);
  results.forEach(r => {
    if (r.status !== 200 || r.errors.length || r.fails.length) {
      console.log(`\n${r.url}`);
      console.log(` Status: ${r.status}`);
      if (r.errors.length) console.log(` Console Errors:`, r.errors.slice(0, 3));
      if (r.fails.length) console.log(` Failed Requests:`, r.fails.slice(0, 3));
    }
  });
})();
