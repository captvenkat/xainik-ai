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

// Test User Credentials
const TEST_USER = {
  email: 'test-veteran@xainik.com',
  password: 'TestVeteran123!'
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
    await page.waitForSelector(selector, { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to check if element is clickable
async function isClickable(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    const element = await page.$(selector);
    if (!element) return false;
    
    const isVisible = await element.isVisible();
    const isEnabled = await element.evaluate(el => !el.disabled);
    return isVisible && isEnabled;
  } catch (error) {
    return false;
  }
}

async function testAuthenticatedVeteranDashboard() {
  console.log('🚀 Starting Accurate Authenticated Veteran Dashboard Testing...\n');
  
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
    
    // Test 1: Navigate to Dashboard (should redirect to auth if not logged in)
    console.log('📋 Test 1: Dashboard Access');
    try {
      await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
      
      // Check if we're redirected to auth page
      const currentUrl = page.url();
      const isAuthPage = currentUrl.includes('/auth');
      logTest('Redirects to auth when not authenticated', isAuthPage, null, { currentUrl });
      
    } catch (error) {
      logTest('Dashboard access', false, error);
    }
    
    // Test 2: Authentication Page
    console.log('\n📋 Test 2: Authentication Page');
    try {
      // Check if we're on auth page
      const authPageTitle = await page.title();
      logTest('Auth page loads', authPageTitle.includes('Xainik'), null, { title: authPageTitle });
      
      // Wait for auth form to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for email input field
      const emailInput = await elementExists(page, 'input[type="email"]');
      logTest('Email input field exists', emailInput);
      
      // Look for password input field
      const passwordInput = await elementExists(page, 'input[type="password"]');
      logTest('Password input field exists', passwordInput);
      
      // Look for submit button
      const submitButton = await elementExists(page, 'button[type="submit"]');
      logTest('Submit button exists', submitButton);
      
    } catch (error) {
      logTest('Authentication page', false, error);
    }
    
    // Test 3: Login Process
    console.log('\n📋 Test 3: Login Process');
    try {
      // Fill in login form
      await page.type('input[type="email"]', TEST_USER.email);
      await page.type('input[type="password"]', TEST_USER.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      
      // Check if redirected to dashboard
      const currentUrl = page.url();
      const isDashboard = currentUrl.includes('/dashboard/veteran');
      logTest('Login successful and redirected to dashboard', isDashboard, null, { currentUrl });
      
      // Wait for dashboard to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      logTest('Login process', false, error);
    }
    
    // Test 4: Dashboard Header and Navigation
    console.log('\n📋 Test 4: Dashboard Header and Navigation');
    try {
      // Check for welcome message
      const welcomeText = await page.$eval('h1', el => el.textContent).catch(() => '');
      logTest('Welcome message displays', welcomeText.includes('Welcome'), null, { welcomeText });
      
      // Check for veteran badge
      const veteranBadge = await elementExists(page, 'span:has-text("Active Veteran")');
      logTest('Veteran badge displays', veteranBadge);
      
      // Check for mission ready badge
      const missionBadge = await elementExists(page, 'span:has-text("Mission Ready")');
      logTest('Mission ready badge displays', missionBadge);
      
      // Check for navigation tabs
      const navTabs = await elementExists(page, 'nav');
      logTest('Navigation tabs container exists', navTabs);
      
    } catch (error) {
      logTest('Dashboard header and navigation', false, error);
    }
    
    // Test 5: Dashboard Tabs Navigation
    console.log('\n📋 Test 5: Dashboard Tabs Navigation');
    try {
      // Test Analytics Tab (should be active by default)
      const analyticsTab = await elementExists(page, 'button:has-text("Analytics")');
      logTest('Analytics tab exists', analyticsTab);
      
      if (analyticsTab) {
        // Check if analytics content is visible
        const analyticsContent = await elementExists(page, 'h2:has-text("Your Pitch Performance Analytics")');
        logTest('Analytics tab content loads', analyticsContent);
      }
      
      // Test Profile Tab
      const profileTab = await elementExists(page, 'button:has-text("Profile")');
      logTest('Profile tab exists', profileTab);
      
      if (profileTab) {
        await page.click('button:has-text("Profile")');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for profile content
        const profileContent = await elementExists(page, 'h2:has-text("Profile")');
        logTest('Profile tab content loads', profileContent);
      }
      
      // Test My Pitches Tab
      const pitchesTab = await elementExists(page, 'button:has-text("My Pitches")');
      logTest('My Pitches tab exists', pitchesTab);
      
      if (pitchesTab) {
        await page.click('button:has-text("My Pitches")');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for pitches content
        const pitchesContent = await elementExists(page, 'h2:has-text("My Pitches")');
        logTest('My Pitches tab content loads', pitchesContent);
      }
      
      // Test Mission Tab
      const missionTab = await elementExists(page, 'button:has-text("Mission")');
      logTest('Mission tab exists', missionTab);
      
      if (missionTab) {
        await page.click('button:has-text("Mission")');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for mission content
        const missionContent = await elementExists(page, 'h2:has-text("Mission Invitations")');
        logTest('Mission tab content loads', missionContent);
      }
      
      // Test Community Tab
      const communityTab = await elementExists(page, 'button:has-text("Community")');
      logTest('Community tab exists', communityTab);
      
      if (communityTab) {
        await page.click('button:has-text("Community")');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for community content
        const communityContent = await elementExists(page, 'h3:has-text("Community Suggestions")');
        logTest('Community tab content loads', communityContent);
      }
      
    } catch (error) {
      logTest('Dashboard tabs navigation', false, error);
    }
    
    // Test 6: Analytics Dashboard Features
    console.log('\n📋 Test 6: Analytics Dashboard Features');
    try {
      // Navigate back to Analytics tab
      await page.click('button:has-text("Analytics")');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for metrics cards
      const metricsCards = await elementExists(page, '.grid.grid-cols-1.md\\:grid-cols-4');
      logTest('Analytics metrics cards display', metricsCards);
      
      // Check for performance insights
      const performanceSection = await elementExists(page, 'h3:has-text("Career Transition Insights")');
      logTest('Performance insights section loads', performanceSection);
      
      // Check for success journey section
      const successJourney = await elementExists(page, 'h3:has-text("Your Success Journey")');
      logTest('Success journey section loads', successJourney);
      
    } catch (error) {
      logTest('Analytics dashboard features', false, error);
    }
    
    // Test 7: Profile Management
    console.log('\n📋 Test 7: Profile Management');
    try {
      // Navigate to Profile tab
      await page.click('button:has-text("Profile")');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for profile form fields
      const nameField = await elementExists(page, 'input[name="name"]');
      logTest('Name field exists in profile', nameField);
      
      const emailField = await elementExists(page, 'input[name="email"]');
      logTest('Email field exists in profile', emailField);
      
      // Check for edit functionality
      const editButton = await elementExists(page, 'button:has-text("Edit Profile")');
      logTest('Edit Profile button exists', editButton);
      
    } catch (error) {
      logTest('Profile management', false, error);
    }
    
    // Test 8: Pitch Management
    console.log('\n📋 Test 8: Pitch Management');
    try {
      // Navigate to My Pitches tab
      await page.click('button:has-text("My Pitches")');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for create new pitch button
      const createPitchButton = await elementExists(page, 'button:has-text("Create New Pitch")');
      logTest('Create New Pitch button exists', createPitchButton);
      
      if (createPitchButton) {
        // Test pitch creation navigation
        await page.click('button:has-text("Create New Pitch")');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        
        const isPitchCreationPage = page.url().includes('/pitch/new');
        logTest('Navigate to pitch creation page', isPitchCreationPage, null, { url: page.url() });
        
        // Go back to dashboard
        await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.click('button:has-text("My Pitches")');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      logTest('Pitch management', false, error);
    }
    
    // Test 9: Mission Invitation System
    console.log('\n📋 Test 9: Mission Invitation System');
    try {
      // Navigate to Mission tab
      await page.click('button:has-text("Mission")');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for mission invitation button
      const inviteButton = await elementExists(page, 'button:has-text("Invite Others to Join Mission")');
      logTest('Mission invitation button exists', inviteButton);
      
      if (inviteButton) {
        // Test invitation modal
        await page.click('button:has-text("Invite Others to Join Mission")');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if modal opens
        const modalExists = await elementExists(page, '.fixed.inset-0');
        logTest('Mission invitation modal opens', modalExists);
        
        if (modalExists) {
          // Test modal functionality
          const copyLinkButton = await elementExists(page, 'button:has-text("Copy Link")');
          logTest('Copy link button in modal', copyLinkButton);
          
          // Close modal
          const closeButton = await page.$('button:has-text("×")');
          if (closeButton) {
            await closeButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
    } catch (error) {
      logTest('Mission invitation system', false, error);
    }
    
    // Test 10: Community Features
    console.log('\n📋 Test 10: Community Features');
    try {
      // Navigate to Community tab
      await page.click('button:has-text("Community")');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for community suggestions
      const suggestionsHeader = await elementExists(page, 'h3:has-text("Community Suggestions")');
      logTest('Community suggestions section loads', suggestionsHeader);
      
      // Check for new suggestion button
      const newSuggestionButton = await elementExists(page, 'button:has-text("New Suggestion")');
      logTest('New Suggestion button exists', newSuggestionButton);
      
    } catch (error) {
      logTest('Community features', false, error);
    }
    
    // Test 11: Responsive Design
    console.log('\n📋 Test 11: Responsive Design');
    try {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mobileNav = await elementExists(page, 'nav');
      logTest('Mobile dashboard navigation works', mobileNav, null, { viewport: 'mobile' });
      
      // Test tablet viewport
      await page.setViewport({ width: 768, height: 1024 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const tabletNav = await elementExists(page, 'nav');
      logTest('Tablet dashboard navigation works', tabletNav, null, { viewport: 'tablet' });
      
      // Reset to desktop
      await page.setViewport({ width: 1280, height: 720 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      logTest('Responsive design', false, error);
    }
    
    // Test 12: Database Status Indicators
    console.log('\n📋 Test 12: Database Status Indicators');
    try {
      // Check for database status indicators
      const databaseStatus = await elementExists(page, 'span:has-text("Database Setup Required")') || 
                            await elementExists(page, 'span:has-text("System Ready")');
      logTest('Database status indicator displays', databaseStatus);
      
      // Check for setup instructions if database not ready
      const setupInstructions = await elementExists(page, 'h3:has-text("Database Setup Required")');
      logTest('Database setup instructions display when needed', setupInstructions);
      
    } catch (error) {
      logTest('Database status indicators', false, error);
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
  console.log('📊 ACCURATE AUTHENTICATED VETERAN DASHBOARD TEST REPORT');
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
  const reportPath = `accurate-veteran-dashboard-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return testResults;
}

// Run the test
testAuthenticatedVeteranDashboard().catch(console.error);

