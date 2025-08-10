// site-audit.js
// Crawl internal links, check HTTP status, console errors, failed requests,
// and quick UX/SEO a11y lint: title/H1/meta, <img alt>, bad hrefs, tel/mailto.
// Usage: SITE_URL=http://localhost:3000 node site-audit.js

import { chromium } from 'playwright';

const BASE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const MAX_PAGES = Number(process.env.MAX_PAGES || 200);
const TIMEOUT_MS = Number(process.env.PAGE_TIMEOUT || 15000);

const seen = new Set();
const queue = [BASE];
const results = [];

function isInternal(href) {
  if (!href) return false;
  try {
    const u = new URL(href, BASE);
    return u.origin === new URL(BASE).origin;
  } catch { return false; }
}

function normalize(href) {
  return new URL(href, BASE).toString().replace(/#.*$/, '');
}

function pad(str, n){ return (str + ' '.repeat(n)).slice(0,n); }

(async () => {
  console.log(`🔍 Starting site audit at ${BASE} (max ${MAX_PAGES} pages)…`);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  while (queue.length && seen.size < MAX_PAGES) {
    const url = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const issues = {
      url, status: null,
      consoleErrors: [],
      requestFails: [],
      seo: [],
      a11y: [],
      links: [],
    };

    // Collect console + failed network
    page.removeAllListeners();
    page.on('console', msg => {
      if (['error'].includes(msg.type())) issues.consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => issues.consoleErrors.push(String(err)));
    page.on('requestfailed', req => {
      const r = req.response();
      issues.requestFails.push({
        url: req.url(),
        method: req.method(),
        err: req.failure()?.errorText || 'failed'
      });
    });

    try {
      const resp = await page.goto(url, { timeout: TIMEOUT_MS, waitUntil: 'domcontentloaded' });
      issues.status = resp ? resp.status() : 'NO_RESPONSE';

      // Basic DOM audit
      const audit = await page.evaluate(() => {
        const out = {
          title: document.title || '',
          hasH1: !!document.querySelector('h1'),
          metaDesc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
          imgsMissingAlt: [],
          badLinks: [],
          telBad: [],
          mailBad: []
        };

        // images without alt
        document.querySelectorAll('img').forEach(img => {
          const alt = img.getAttribute('alt');
          if (alt === null || alt.trim() === '') {
            out.imgsMissingAlt.push(img.getAttribute('src') || '(inline data)');
          }
        });

        // anchors with empty/placeholder href
        document.querySelectorAll('a').forEach(a => {
          const href = a.getAttribute('href') || '';
          if (href === '' || href === '#' || href === 'javascript:void(0)') {
            out.badLinks.push((a.textContent || '').trim().slice(0,60));
          }
          if (href.startsWith('tel:')) {
            const num = href.replace('tel:', '').trim();
            if (!/^\+?\d[\d\s\-().]{6,}$/.test(num)) out.telBad.push(href);
          }
          if (href.startsWith('mailto:')) {
            const em = href.replace('mailto:', '').split('?')[0];
            if (!/.+@.+\..+/.test(em)) out.mailBad.push(href);
          }
        });

        return out;
      });

      // SEO issues
      if (!audit.title || audit.title.trim().length < 5) issues.seo.push('Missing/short <title>');
      if (!audit.hasH1) issues.seo.push('Missing <h1>');
      if (!audit.metaDesc || audit.metaDesc.trim().length < 20) issues.seo.push('Missing/short meta description');
      if (!audit.canonical) issues.seo.push('Missing <link rel="canonical">');

      // a11y issues
      if (audit.imgsMissingAlt.length) issues.a11y.push(`Images missing alt: ${audit.imgsMissingAlt.length}`);
      if (audit.badLinks.length) issues.a11y.push(`Anchors with bad href (#/empty/js): ${audit.badLinks.length}`);
      if (audit.telBad.length) issues.a11y.push(`Bad tel: links: ${audit.telBad.length}`);
      if (audit.mailBad.length) issues.a11y.push(`Bad mailto: links: ${audit.mailBad.length}`);

      // Extract internal links to crawl
      const hrefs = await page.$$eval('a[href]', as =>
        Array.from(as).map(a => a.getAttribute('href')).filter(Boolean)
      );
      hrefs
        .map(h => normalize(h))
        .filter(h => isInternal(h))
        .forEach(h => { if (!seen.has(h)) queue.push(h); });

    } catch (e) {
      issues.consoleErrors.push(`NAV_ERROR: ${String(e)}`);
      if (issues.status === null) issues.status = 'NAV_ERROR';
    }

    results.push(issues);
    console.log(`• ${issues.status || 'ERR'}  ${url}`);
  }

  await browser.close();

  // Print summary table
  console.log('\n📋 Page Audit Summary');
  console.log('| Status | Console | NetFail | SEO | A11y | URL |');
  console.log('|-------:|--------:|--------:|----:|-----:|-----|');
  results.forEach(r => {
    const ok = (typeof r.status === 'number') ? (r.status >= 200 && r.status < 400) : false;
    const statusLabel = ok ? `✅ ${r.status}` : `❌ ${r.status}`;
    console.log(`| ${pad(statusLabel,8)} | ${pad(String(r.consoleErrors.length),7)} | ${pad(String(r.requestFails.length),7)} | ${pad(String(r.seo.length),4)} | ${pad(String(r.a11y.length),5)} | ${r.url} |`);
  });

  // Print top issues detail (brief)
  const topIssues = results.filter(r =>
    (typeof r.status !== 'number' || r.status >= 400) ||
    r.consoleErrors.length || r.requestFails.length || r.seo.length || r.a11y.length
  );

  if (topIssues.length) {
    console.log('\n🔎 Details (problem pages):\n');
    topIssues.forEach(r => {
      console.log(`\n— ${r.url}`);
      if (typeof r.status !== 'number' || r.status >= 400) console.log(`  • HTTP: ${r.status}`);
      if (r.consoleErrors.length) console.log(`  • Console: ${r.consoleErrors.slice(0,3).join(' | ')}`);
      if (r.requestFails.length) console.log(`  • Failed requests: ${r.requestFails.slice(0,3).map(f => f.url).join(' | ')}`);
      if (r.seo.length) console.log(`  • SEO: ${r.seo.join('; ')}`);
      if (r.a11y.length) console.log(`  • A11y: ${r.a11y.join('; ')}`);
    });
  }

  console.log(`\n✅ Checked ${results.length} pages (crawled up to ${MAX_PAGES}).`);
})();
