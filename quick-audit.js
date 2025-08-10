// quick-audit.js
// Crawl internal links, check status codes, console errors, failed requests.
// Usage: SITE_URL=https://yoursite.com node quick-audit.js

const puppeteer = require('puppeteer');
const fs = require('fs');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function runAudit() {
  console.log('🔍 Starting comprehensive Xainik audit...');
  console.log('=====================================');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    pages: [],
    errors: [],
    seoIssues: [],
    consoleErrors: [],
    failedRequests: []
  };

  const pagesToCheck = [
    '/',
    '/browse',
    '/pricing',
    '/donations',
    '/about',
    '/contact',
    '/support',
    '/terms',
    '/privacy',
    '/support-the-mission'
  ];

  for (const page of pagesToCheck) {
    try {
      const pageInstance = await browser.newPage();
      
      // Listen for console errors
      pageInstance.on('console', msg => {
        if (msg.type() === 'error') {
          results.consoleErrors.push({
            page,
            error: msg.text()
          });
        }
      });

      // Listen for failed requests
      pageInstance.on('requestfailed', request => {
        results.failedRequests.push({
          page,
          url: request.url(),
          error: request.failure().errorText
        });
      });

      const url = `${SITE_URL}${page}`;
      console.log(`Checking: ${url}`);
      
      const response = await pageInstance.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      const status = response.status();
      
      // Check SEO elements
      const title = await pageInstance.title();
      const description = await pageInstance.$eval('meta[name="description"]', el => el?.content || null);
      const canonical = await pageInstance.$eval('link[rel="canonical"]', el => el?.href || null);
      const h1Count = await pageInstance.$$eval('h1', els => els.length);
      
      const seoIssues = [];
      if (!title || title === 'Xainik - Veteran Hiring Platform') {
        seoIssues.push('Missing or default title');
      }
      if (!description) {
        seoIssues.push('Missing meta description');
      }
      if (!canonical) {
        seoIssues.push('Missing canonical URL');
      }
      if (h1Count === 0) {
        seoIssues.push('No H1 found');
      } else if (h1Count > 1) {
        seoIssues.push(`Multiple H1s found (${h1Count})`);
      }

      results.pages.push({
        url,
        status,
        title,
        description: description?.substring(0, 100) + '...',
        canonical,
        h1Count,
        seoIssues
      });

      if (seoIssues.length > 0) {
        results.seoIssues.push({
          page,
          issues: seoIssues
        });
      }

      await pageInstance.close();
      
    } catch (error) {
      results.errors.push({
        page,
        error: error.message
      });
      console.error(`Error checking ${page}:`, error.message);
    }
  }

  await browser.close();

  // Generate report
  console.log('\n📊 AUDIT RESULTS');
  console.log('================');
  
  console.log('\n✅ Page Status:');
  results.pages.forEach(page => {
    const status = page.status === 200 ? '✅' : '❌';
    console.log(`${status} ${page.url} - ${page.status}`);
  });

  console.log('\n🔍 SEO Issues:');
  if (results.seoIssues.length === 0) {
    console.log('✅ No SEO issues found');
  } else {
    results.seoIssues.forEach(issue => {
      console.log(`❌ ${issue.page}: ${issue.issues.join(', ')}`);
    });
  }

  console.log('\n🚨 Console Errors:');
  if (results.consoleErrors.length === 0) {
    console.log('✅ No console errors found');
  } else {
    results.consoleErrors.forEach(error => {
      console.log(`❌ ${error.page}: ${error.error}`);
    });
  }

  console.log('\n🌐 Failed Requests:');
  if (results.failedRequests.length === 0) {
    console.log('✅ No failed requests found');
  } else {
    results.failedRequests.forEach(req => {
      console.log(`❌ ${req.page}: ${req.url} - ${req.error}`);
    });
  }

  console.log('\n📈 Summary:');
  console.log(`- Pages checked: ${results.pages.length}`);
  console.log(`- Pages with 200 status: ${results.pages.filter(p => p.status === 200).length}`);
  console.log(`- SEO issues: ${results.seoIssues.length}`);
  console.log(`- Console errors: ${results.consoleErrors.length}`);
  console.log(`- Failed requests: ${results.failedRequests.length}`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    siteUrl: SITE_URL,
    results
  };

  fs.writeFileSync('audit-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: audit-report.json');

  return results;
}

// Run the audit
runAudit().catch(console.error);
