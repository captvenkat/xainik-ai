// link-checker.js
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const url = require('url');

const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';
const visited = new Set();
const results = [];

async function crawlPage(pageUrl) {
  if (visited.has(pageUrl)) return;
  visited.add(pageUrl);

  try {
    console.log(`Checking: ${pageUrl}`);
    const res = await fetch(pageUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Link-Checker/1.0'
      }
    });
    const status = res.status;
    results.push({ url: pageUrl, status, ok: status >= 200 && status < 400 });

    if (status >= 200 && status < 400 && res.headers.get('content-type')?.includes('text/html')) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        const absoluteUrl = url.resolve(BASE_URL, href);
        if (absoluteUrl.startsWith(BASE_URL) && !absoluteUrl.includes('#')) {
          crawlPage(absoluteUrl);
        }
      });
    }
  } catch (err) {
    console.error(`Error checking ${pageUrl}:`, err.message);
    results.push({ url: pageUrl, status: 'ERROR', ok: false, error: err.message });
  }
}

(async () => {
  console.log(`🔍 Starting link check for ${BASE_URL}...`);
  await crawlPage(BASE_URL);

  // Wait a bit to let async crawling finish
  setTimeout(() => {
    console.log(`\n📋 Internal Link Check Results:\n`);
    console.log(`| Status | URL |`);
    console.log(`| ------ | --- |`);
    results.forEach(r => {
      const statusLabel = r.ok ? '✅ PASS' : `❌ FAIL (${r.status})`;
      console.log(`| ${statusLabel} | ${r.url} |`);
    });
    
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📄 Total: ${results.length} links.\n`);
  }, 4000);
})();
