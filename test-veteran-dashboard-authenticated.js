const puppeteer = require('puppeteer');
const fs = require('fs');

// Test Results Storage
const testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  errors: [],
  details: {}
};

// Helper function to log test results
function logTest(testName, passed, error = null, details = {}) {
  testResults.totalTests++;
  if (passed) {
    testResults.passedTests++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    testResults.failedTests++;
    console.log(`❌ FAIL: ${testName}`);
    if (error) {
      console.log(`   Error: ${error.message}`);
      testResults.errors.push({ test: testName, error: error.message });
    }
  }
  testResults.details[testName] = { passed, error: error?.message, details };
}

// Helper function to check if element exists
async function elementExists(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to check if element is clickable
async function isClickable(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    const element = await page.$(selector);
    if (!element) return false;
    
    const isVisible = await element.isVisible();
    const isEnabled = await element.evaluate(el => !el.disabled);
    return isVisible && isEnabled;
  } catch (error) {
    return false;
  }
}

async function testVeteranDashboardAuthenticated() {
  console.log('🚀 Starting Authenticated Veteran Dashboard Testing...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Test 1: Access veteran dashboard page
    console.log('📋 Test 1: Accessing Veteran Dashboard Page');
    try {
      await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Check if page loads without errors
      const pageTitle = await page.title();
      logTest('Dashboard page loads', pageTitle.includes('Xainik'), null, { title: pageTitle });
      
      // Check for loading state
      const loadingExists = await elementExists(page, '.animate-spin');
      logTest('Loading spinner appears', loadingExists);
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      logTest('Dashboard page loads', false, error);
    }
    
    // Test 2: Check authentication requirement
    console.log('\n📋 Test 2: Authentication Check');
    try {
      const currentUrl = page.url();
      const pageContent = await page.content();
      
      if (pageContent.includes('Authentication required') || pageContent.includes('Please sign in')) {
        logTest('Authentication required message', true, null, { message: 'Auth required as expected' });
      } else if (currentUrl.includes('/auth')) {
        logTest('Redirected to auth page', true, null, { redirectUrl: currentUrl });
      } else {
        logTest('Authentication check', false, new Error('No auth check found'));
      }
    } catch (error) {
      logTest('Authentication check', false, error);
    }
    
    // Test 3: Test navigation links
    console.log('\n📋 Test 3: Navigation Links Test');
    try {
      const navLinks = [
        { selector: 'a[href="/"]', name: 'Home link' },
        { selector: 'a[href="/browse"]', name: 'Browse link' },
        { selector: 'a[href="/pricing"]', name: 'Pricing link' },
        { selector: 'a[href="/support-the-mission"]', name: 'Support link' },
        { selector: 'a[href="/donations"]', name: 'Donations link' },
        { selector: 'a[href="/about"]', name: 'About link' },
        { selector: 'a[href="/contact"]', name: 'Contact link' },
        { selector: 'a[href="/auth"]', name: 'Sign In link' }
      ];
      
      for (const link of navLinks) {
        const exists = await elementExists(page, link.selector);
        const clickable = exists ? await isClickable(page, link.selector) : false;
        logTest(link.name, exists && clickable, null, { exists, clickable });
      }
    } catch (error) {
      logTest('Navigation links test', false, error);
    }
    
    // Test 4: Test footer links
    console.log('\n📋 Test 4: Footer Links Test');
    try {
      const footerLinks = [
        { selector: 'footer a[href="/browse"]', name: 'Footer Browse link' },
        { selector: 'footer a[href="/pricing"]', name: 'Footer Pricing link' },
        { selector: 'footer a[href="/support-the-mission"]', name: 'Footer Support link' },
        { selector: 'footer a[href="/donations"]', name: 'Footer Donations link' },
        { selector: 'footer a[href="/about"]', name: 'Footer About link' },
        { selector: 'footer a[href="/contact"]', name: 'Footer Contact link' },
        { selector: 'footer a[href="/terms"]', name: 'Footer Terms link' },
        { selector: 'footer a[href="/privacy"]', name: 'Footer Privacy link' },
        { selector: 'footer a[href="mailto:ceo@faujnet.com"]', name: 'Footer Email link' }
      ];
      
      for (const link of footerLinks) {
        const exists = await elementExists(page, link.selector);
        const clickable = exists ? await isClickable(page, link.selector) : false;
        logTest(link.name, exists && clickable, null, { exists, clickable });
      }
    } catch (error) {
      logTest('Footer links test', false, error);
    }
    
    // Test 5: Test dashboard content sections
    console.log('\n📋 Test 5: Dashboard Content Sections Test');
    try {
      const contentSections = [
        { selector: 'h1', name: 'Dashboard header' },
        { selector: '.bg-gradient-to-br', name: 'Gradient background' },
        { selector: 'nav', name: 'Navigation bar' },
        { selector: 'footer', name: 'Footer section' }
      ];
      
      for (const section of contentSections) {
        const exists = await elementExists(page, section.selector);
        logTest(section.name, exists, null, { exists });
      }
    } catch (error) {
      logTest('Dashboard content sections test', false, error);
    }
    
    // Test 6: Test page performance
    console.log('\n📋 Test 6: Page Performance Test');
    try {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
      const loadTime = Date.now() - startTime;
      
      const performanceGood = loadTime < 5000; // Less than 5 seconds
      logTest('Page load time', performanceGood, null, { loadTime: `${loadTime}ms` });
      
    } catch (error) {
      logTest('Page performance test', false, error);
    }
    
    // Test 7: Test accessibility
    console.log('\n📋 Test 7: Accessibility Test');
    try {
      // Check for alt text on images
      const images = await page.$$('img');
      const imagesWithAlt = await page.$$('img[alt]');
      const altTextRatio = images.length > 0 ? imagesWithAlt.length / images.length : 1;
      
      logTest('Image alt text', altTextRatio > 0.8, null, { 
        totalImages: images.length, 
        imagesWithAlt: imagesWithAlt.length,
        ratio: altTextRatio 
      });
      
      // Check for proper heading structure
      const h1Count = await page.$$eval('h1', els => els.length);
      const h2Count = await page.$$eval('h2', els => els.length);
      
      logTest('Heading structure', h1Count > 0, null, { h1Count, h2Count });
      
    } catch (error) {
      logTest('Accessibility test', false, error);
    }
    
    // Test 8: Test SEO elements
    console.log('\n📋 Test 8: SEO Elements Test');
    try {
      const title = await page.title();
      const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');
      const canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => '');
      
      logTest('Page title exists', title.length > 0, null, { title });
      logTest('Meta description exists', description.length > 0, null, { description });
      logTest('Canonical URL exists', canonical.length > 0, null, { canonical });
      
    } catch (error) {
      logTest('SEO elements test', false, error);
    }
    
    // Test 9: Test responsive design
    console.log('\n📋 Test 9: Responsive Design Test');
    try {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mobileNavExists = await elementExists(page, 'button.md\\:hidden');
      logTest('Mobile navigation button', mobileNavExists, null, { viewport: 'mobile' });
      
      // Test tablet viewport
      await page.setViewport({ width: 768, height: 1024 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tabletNavExists = await elementExists(page, 'nav');
      logTest('Tablet navigation', tabletNavExists, null, { viewport: 'tablet' });
      
      // Reset to desktop
      await page.setViewport({ width: 1280, height: 720 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logTest('Responsive design test', false, error);
    }
    
    // Test 10: Test error handling
    console.log('\n📋 Test 10: Error Handling Test');
    try {
      // Test 404 page
      await page.goto('http://localhost:3000/dashboard/veteran/nonexistent', { waitUntil: 'networkidle2' });
      const pageContent = await page.content();
      const is404 = pageContent.includes('404') || pageContent.includes('Not Found');
      logTest('404 error handling', is404, null, { url: '/dashboard/veteran/nonexistent' });
      
      // Go back to main dashboard
      await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
      
    } catch (error) {
      logTest('Error handling test', false, error);
    }
    
    // Test 11: Test browser compatibility
    console.log('\n📋 Test 11: Browser Compatibility Test');
    try {
      // Check if page works without JavaScript (basic test)
      const jsEnabled = await page.evaluate(() => typeof window !== 'undefined');
      logTest('JavaScript enabled', jsEnabled, null, { jsEnabled });
      
      // Check for console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      logTest('No console errors', consoleErrors.length === 0, null, { errorCount: consoleErrors.length });
      
    } catch (error) {
      logTest('Browser compatibility test', false, error);
    }
    
    // Test 12: Test link functionality
    console.log('\n📋 Test 12: Link Functionality Test');
    try {
      // Test clicking on a navigation link
      const browseLink = await page.$('a[href="/browse"]');
      if (browseLink) {
        await browseLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        const newUrl = page.url();
        logTest('Browse link navigation', newUrl.includes('/browse'), null, { newUrl });
        
        // Go back to dashboard
        await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
      } else {
        logTest('Browse link navigation', false, new Error('Browse link not found'));
      }
      
    } catch (error) {
      logTest('Link functionality test', false, error);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    testResults.errors.push({ test: 'Test Suite', error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Generate test report
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUTHENTICATED VETERAN DASHBOARD TEST REPORT');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`Passed: ${testResults.passedTests}`);
  console.log(`Failed: ${testResults.failedTests}`);
  console.log(`Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.test}: ${error.error}`);
    });
  }
  
  // Save detailed report
  const reportPath = `authenticated-veteran-dashboard-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return testResults;
}

// Run the test
testVeteranDashboardAuthenticated().catch(console.error);

