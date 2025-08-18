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

async function testAuthenticatedVeteranDashboard() {
  console.log('🚀 Starting Authenticated Veteran Dashboard Comprehensive Testing...\n');
  
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
    
    // Test 1: Authentication Flow
    console.log('📋 Test 1: Authentication Flow');
    try {
      // Navigate to auth page
      await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2' });
      
      // Check if auth page loads
      const authPageTitle = await page.title();
      logTest('Auth page loads', authPageTitle.includes('Xainik'), null, { title: authPageTitle });
      
      // Wait for auth form to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for sign in form
      const signInFormExists = await elementExists(page, 'form');
      logTest('Sign in form exists', signInFormExists);
      
    } catch (error) {
      logTest('Authentication flow', false, error);
    }
    
    // Test 2: Login Process
    console.log('\n📋 Test 2: Login Process');
    try {
      // Fill in login form
      await page.type('input[type="email"]', TEST_USER.email);
      await page.type('input[type="password"]', TEST_USER.password);
      
      // Submit form
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        
        // Wait for redirect
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        
        // Check if redirected to dashboard
        const currentUrl = page.url();
        const isDashboard = currentUrl.includes('/dashboard');
        logTest('Login successful and redirected to dashboard', isDashboard, null, { currentUrl });
        
      } else {
        logTest('Login form submission', false, new Error('Submit button not found'));
      }
      
    } catch (error) {
      logTest('Login process', false, error);
    }
    
    // Test 3: Dashboard Tabs Navigation
    console.log('\n📋 Test 3: Dashboard Tabs Navigation');
    try {
      // Wait for dashboard to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test Analytics Tab
      const analyticsTab = await elementExists(page, 'button:has-text("Analytics")');
      const analyticsClickable = analyticsTab ? await isClickable(page, 'button:has-text("Analytics")') : false;
      logTest('Analytics tab exists and clickable', analyticsTab && analyticsClickable);
      
      if (analyticsClickable) {
        await page.click('button:has-text("Analytics")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for analytics content
        const analyticsContent = await elementExists(page, '.bg-gradient-to-r');
        logTest('Analytics tab content loads', analyticsContent);
      }
      
      // Test Profile Tab
      const profileTab = await elementExists(page, 'button:has-text("Profile")');
      const profileClickable = profileTab ? await isClickable(page, 'button:has-text("Profile")') : false;
      logTest('Profile tab exists and clickable', profileTab && profileClickable);
      
      if (profileClickable) {
        await page.click('button:has-text("Profile")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for profile form
        const profileForm = await elementExists(page, 'input[name="name"]');
        logTest('Profile tab form loads', profileForm);
      }
      
      // Test My Pitches Tab
      const pitchesTab = await elementExists(page, 'button:has-text("My Pitches")');
      const pitchesClickable = pitchesTab ? await isClickable(page, 'button:has-text("My Pitches")') : false;
      logTest('My Pitches tab exists and clickable', pitchesTab && pitchesClickable);
      
      if (pitchesClickable) {
        await page.click('button:has-text("My Pitches")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for pitches content
        const pitchesContent = await elementExists(page, 'h2');
        logTest('My Pitches tab content loads', pitchesContent);
      }
      
      // Test Mission Tab
      const missionTab = await elementExists(page, 'button:has-text("Mission")');
      const missionClickable = missionTab ? await isClickable(page, 'button:has-text("Mission")') : false;
      logTest('Mission tab exists and clickable', missionTab && missionClickable);
      
      if (missionClickable) {
        await page.click('button:has-text("Mission")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for mission content
        const missionContent = await elementExists(page, 'h2');
        logTest('Mission tab content loads', missionContent);
      }
      
      // Test Community Tab
      const communityTab = await elementExists(page, 'button:has-text("Community")');
      const communityClickable = communityTab ? await isClickable(page, 'button:has-text("Community")') : false;
      logTest('Community tab exists and clickable', communityTab && communityClickable);
      
      if (communityClickable) {
        await page.click('button:has-text("Community")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for community content
        const communityContent = await elementExists(page, 'h3');
        logTest('Community tab content loads', communityContent);
      }
      
    } catch (error) {
      logTest('Dashboard tabs navigation', false, error);
    }
    
    // Test 4: Profile Management
    console.log('\n📋 Test 4: Profile Management');
    try {
      // Navigate to Profile tab
      await page.click('button:has-text("Profile")');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile data is loaded
      const nameField = await page.$eval('input[name="name"]', el => el.value).catch(() => '');
      logTest('Profile data loads correctly', nameField.length > 0, null, { nameField });
      
      // Test edit functionality
      const editButton = await elementExists(page, 'button:has-text("Edit Profile")');
      logTest('Edit Profile button exists', editButton);
      
      if (editButton) {
        await page.click('button:has-text("Edit Profile")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if form becomes editable
        const isEditable = await page.$eval('input[name="name"]', el => !el.disabled).catch(() => false);
        logTest('Profile form becomes editable', isEditable);
        
        // Test form validation
        const saveButton = await elementExists(page, 'button:has-text("Save Changes")');
        logTest('Save Changes button appears', saveButton);
      }
      
    } catch (error) {
      logTest('Profile management', false, error);
    }
    
    // Test 5: Pitch Management
    console.log('\n📋 Test 5: Pitch Management');
    try {
      // Navigate to My Pitches tab
      await page.click('button:has-text("My Pitches")');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if pitches are displayed
      const pitchesList = await elementExists(page, '.grid');
      logTest('Pitches list displays', pitchesList);
      
      // Check for Create New Pitch button
      const createPitchButton = await elementExists(page, 'button:has-text("Create New Pitch")');
      logTest('Create New Pitch button exists', createPitchButton);
      
      if (createPitchButton) {
        // Test pitch creation flow
        await page.click('button:has-text("Create New Pitch")');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        
        const isPitchCreationPage = page.url().includes('/pitch/new');
        logTest('Navigate to pitch creation page', isPitchCreationPage, null, { url: page.url() });
        
        // Go back to dashboard
        await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.click('button:has-text("My Pitches")');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      logTest('Pitch management', false, error);
    }
    
    // Test 6: Mission Invitation System
    console.log('\n📋 Test 6: Mission Invitation System');
    try {
      // Navigate to Mission tab
      await page.click('button:has-text("Mission")');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for mission invitation button
      const inviteButton = await elementExists(page, 'button:has-text("Invite Others to Join Mission")');
      logTest('Mission invitation button exists', inviteButton);
      
      if (inviteButton) {
        // Test invitation modal
        await page.click('button:has-text("Invite Others to Join Mission")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if modal opens
        const modalExists = await elementExists(page, '.fixed.inset-0');
        logTest('Mission invitation modal opens', modalExists);
        
        if (modalExists) {
          // Test modal functionality
          const copyLinkButton = await elementExists(page, 'button:has-text("Copy Link")');
          logTest('Copy link button in modal', copyLinkButton);
          
          const shareButtons = await elementExists(page, 'button:has-text("WhatsApp")');
          logTest('Social sharing buttons in modal', shareButtons);
          
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
    
    // Test 7: Community Features
    console.log('\n📋 Test 7: Community Features');
    try {
      // Navigate to Community tab
      await page.click('button:has-text("Community")');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for community suggestions
      const suggestionsHeader = await elementExists(page, 'h3:has-text("Community Suggestions")');
      logTest('Community suggestions section loads', suggestionsHeader);
      
      // Check for new suggestion button
      const newSuggestionButton = await elementExists(page, 'button:has-text("New Suggestion")');
      logTest('New Suggestion button exists', newSuggestionButton);
      
      if (newSuggestionButton) {
        // Test suggestion form
        await page.click('button:has-text("New Suggestion")');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const suggestionForm = await elementExists(page, 'textarea');
        logTest('Suggestion form appears', suggestionForm);
      }
      
    } catch (error) {
      logTest('Community features', false, error);
    }
    
    // Test 8: Analytics Dashboard
    console.log('\n📋 Test 8: Analytics Dashboard');
    try {
      // Navigate to Analytics tab
      await page.click('button:has-text("Analytics")');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for analytics components
      const metricsCards = await elementExists(page, '.grid.grid-cols-1.md\\:grid-cols-4');
      logTest('Analytics metrics cards display', metricsCards);
      
      const chartsSection = await elementExists(page, '.grid.grid-cols-1.lg\\:grid-cols-2');
      logTest('Analytics charts section displays', chartsSection);
      
      const performanceSection = await elementExists(page, 'h3:has-text("Performance")');
      logTest('Performance insights section loads', performanceSection);
      
    } catch (error) {
      logTest('Analytics dashboard', false, error);
    }
    
    // Test 9: Responsive Design (Authenticated)
    console.log('\n📋 Test 9: Responsive Design (Authenticated)');
    try {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mobileTabs = await elementExists(page, 'nav');
      logTest('Mobile dashboard navigation works', mobileTabs, null, { viewport: 'mobile' });
      
      // Test tablet viewport
      await page.setViewport({ width: 768, height: 1024 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tabletTabs = await elementExists(page, 'nav');
      logTest('Tablet dashboard navigation works', tabletTabs, null, { viewport: 'tablet' });
      
      // Reset to desktop
      await page.setViewport({ width: 1280, height: 720 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logTest('Responsive design (authenticated)', false, error);
    }
    
    // Test 10: Logout Functionality
    console.log('\n📋 Test 10: Logout Functionality');
    try {
      // Look for logout or user menu
      const userMenu = await elementExists(page, '[data-testid="user-menu"]') || 
                      await elementExists(page, 'button:has-text("Sign Out")') ||
                      await elementExists(page, 'button:has-text("Logout")');
      
      logTest('User menu or logout button exists', userMenu);
      
      // Test logout if available
      if (userMenu) {
        await page.click(userMenu);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if redirected to auth page
        const currentUrl = page.url();
        const isLoggedOut = currentUrl.includes('/auth');
        logTest('Logout redirects to auth page', isLoggedOut, null, { currentUrl });
      }
      
    } catch (error) {
      logTest('Logout functionality', false, error);
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
  console.log('📊 AUTHENTICATED VETERAN DASHBOARD COMPREHENSIVE TEST REPORT');
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
  const reportPath = `authenticated-veteran-dashboard-complete-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return testResults;
}

// Run the test
testAuthenticatedVeteranDashboard().catch(console.error);

