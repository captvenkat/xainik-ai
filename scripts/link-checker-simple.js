// link-checker-simple.js
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const url = require('url');

const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';
const visited = new Set();
const results = [];

function makeRequest(pageUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(pageUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(pageUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Link-Checker/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      console.error(`Request error for ${pageUrl}:`, err.message);
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function crawlPage(pageUrl) {
  if (visited.has(pageUrl)) return;
  visited.add(pageUrl);

  try {
    console.log(`Checking: ${pageUrl}`);
    const res = await makeRequest(pageUrl);
    const isSuccess = res.status >= 200 && res.status < 400;
    results.push({ url: pageUrl, status: res.status, ok: isSuccess });

    if (isSuccess && res.headers['content-type']?.includes('text/html')) {
      const $ = cheerio.load(res.body);

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
    console.log(`📄 Total: ${results.length} links.`);
    
    if (failed > 0) {
      console.log(`\n🔍 Failed URLs:`);
      results.filter(r => !r.ok).forEach(r => {
        console.log(`  - ${r.url} (${r.status})`);
      });
    }
    
    console.log(`\n`);
  }, 4000);
})();
