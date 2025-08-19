const puppeteer = require('puppeteer');

async function testVeteranDashboardSimple() {
  console.log('🚀 Testing Veteran Dashboard - Simple Load Test...\n');
  
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
    
    console.log('📋 Test 1: Accessing Veteran Dashboard Page');
    
    // Navigate to veteran dashboard
    await page.goto('http://localhost:3000/dashboard/veteran', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a bit for the page to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check for any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Check for network errors
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Wait a bit more to catch any errors
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check if we're redirected to auth page
    const isAuthPage = currentUrl.includes('/auth');
    console.log(`🔐 Redirected to auth: ${isAuthPage ? 'Yes' : 'No'}`);
    
    // Get page title
    const pageTitle = await page.title();
    console.log(`📄 Page Title: ${pageTitle}`);
    
    // Check for any error messages on the page
    const errorMessages = await page.evaluate(() => {
      const errorElements = Array.from(document.querySelectorAll('[class*="error"], [class*="Error"], .text-red-500, .text-red-600'));
      return errorElements.map(el => el.textContent.trim()).filter(text => text.length > 0);
    });
    
    // Check for database status indicators
    const databaseStatus = await page.evaluate(() => {
      const statusElements = Array.from(document.querySelectorAll('span, div, h3'));
      return statusElements
        .map(el => el.textContent.trim())
        .filter(text => text.includes('Database') || text.includes('Setup') || text.includes('System'))
        .slice(0, 5); // Get first 5 matches
    });
    
    // Results
    console.log('\n📊 TEST RESULTS:');
    console.log('================');
    
    if (isAuthPage) {
      console.log('✅ SUCCESS: Properly redirected to auth page when not authenticated');
    } else {
      console.log('❌ UNEXPECTED: Not redirected to auth page');
    }
    
    if (pageTitle.includes('Xainik')) {
      console.log('✅ SUCCESS: Page title contains Xainik');
    } else {
      console.log('❌ ISSUE: Page title does not contain Xainik');
    }
    
    if (consoleErrors.length === 0) {
      console.log('✅ SUCCESS: No console errors detected');
    } else {
      console.log(`❌ ISSUE: ${consoleErrors.length} console errors detected:`);
      consoleErrors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (networkErrors.length === 0) {
      console.log('✅ SUCCESS: No network errors (400/500) detected');
    } else {
      console.log(`❌ ISSUE: ${networkErrors.length} network errors detected:`);
      networkErrors.forEach(error => console.log(`   - ${error.status} ${error.statusText}: ${error.url}`));
    }
    
    if (errorMessages.length === 0) {
      console.log('✅ SUCCESS: No error messages displayed on page');
    } else {
      console.log(`❌ ISSUE: ${errorMessages.length} error messages on page:`);
      errorMessages.forEach(msg => console.log(`   - ${msg}`));
    }
    
    if (databaseStatus.length > 0) {
      console.log(`ℹ️  INFO: Database status indicators found:`);
      databaseStatus.forEach(status => console.log(`   - ${status}`));
    } else {
      console.log('ℹ️  INFO: No database status indicators found');
    }
    
    console.log('\n🎉 Simple Veteran Dashboard Test Completed!');
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      currentUrl,
      pageTitle,
      isAuthPage,
      consoleErrors,
      networkErrors,
      errorMessages,
      databaseStatus
    };
    
    const reportPath = `veteran-dashboard-simple-test-report-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testVeteranDashboardSimple().catch(console.error);
