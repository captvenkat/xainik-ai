// dashboard-link-checker.js
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const url = require('url');

const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';
const visited = new Set();
const results = [];

// Dashboard routes to check
const dashboardRoutes = [
  '/dashboard/veteran',
  '/dashboard/recruiter', 
  '/dashboard/supporter',
  '/dashboard/admin'
];

// Routes that should exist based on dashboard links
const expectedRoutes = [
  '/pitch/new',
  '/pricing',
  '/browse',
  '/shortlist',
  '/supporter/refer',
  '/donations',
  '/support',
  '/contact',
  '/terms',
  '/privacy'
];

function makeRequest(pageUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(pageUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(pageUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Dashboard-Link-Checker/1.0',
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

async function checkRoute(route) {
  const pageUrl = `${BASE_URL}${route}`;
  
  try {
    console.log(`Checking: ${pageUrl}`);
    const res = await makeRequest(pageUrl);
    const isSuccess = res.status >= 200 && res.status < 400;
    results.push({ url: pageUrl, status: res.status, ok: isSuccess, route });
    
    return { route, status: res.status, ok: isSuccess };
  } catch (err) {
    console.error(`Error checking ${pageUrl}:`, err.message);
    results.push({ url: pageUrl, status: 'ERROR', ok: false, route, error: err.message });
    return { route, status: 'ERROR', ok: false };
  }
}

async function checkDashboardLinks() {
  console.log(`🔍 Dashboard Link Check for ${BASE_URL}`);
  console.log('=====================================');
  
  // Check dashboard routes
  console.log('\n📋 Dashboard Routes:');
  console.log('| Route | Status |');
  console.log('| ----- | ------ |');
  
  for (const route of dashboardRoutes) {
    const result = await checkRoute(route);
    const statusLabel = result.ok ? '✅ PASS' : `❌ FAIL (${result.status})`;
    console.log(`| ${route} | ${statusLabel} |`);
  }
  
  // Check expected routes
  console.log('\n📋 Expected Routes (from dashboard links):');
  console.log('| Route | Status |');
  console.log('| ----- | ------ |');
  
  for (const route of expectedRoutes) {
    const result = await checkRoute(route);
    const statusLabel = result.ok ? '✅ PASS' : `❌ FAIL (${result.status})`;
    console.log(`| ${route} | ${statusLabel} |`);
  }
  
  // Summary
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📄 Total: ${results.length} routes.`);
  
  if (failed > 0) {
    console.log(`\n🔍 Failed Routes:`);
    results.filter(r => !r.ok).forEach(r => {
      console.log(`  - ${r.route} (${r.status})`);
    });
  }
  
  console.log(`\n`);
}

checkDashboardLinks();
