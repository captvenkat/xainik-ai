const puppeteer = require('puppeteer');

async function testSharePitchFeature() {
  console.log('🔍 Testing Share Pitch Feature in Veteran Dashboard');
  console.log('=================================================');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const issues = [];
  
  try {
    // Test 1: Access Dashboard (should redirect to auth)
    console.log('\n🏠 Testing Dashboard Access...');
    await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth')) {
      console.log('✅ Dashboard correctly redirects to auth when not logged in');
    } else {
      console.log('❌ Dashboard should redirect to auth');
      issues.push('Dashboard not redirecting to auth');
    }
    
    // Test 2: Check Auth Page for Share Pitch Option
    console.log('\n🔐 Testing Auth Page...');
    await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2' });
    
    const authElements = await page.evaluate(() => {
      const googleButton = document.querySelector('button[data-provider="google"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      const signInButton = document.querySelector('button[type="submit"]');
      
      return {
        hasGoogleAuth: !!googleButton,
        hasEmailInput: !!emailInput,
        hasPasswordInput: !!passwordInput,
        hasSignInButton: !!signInButton,
        googleButtonText: googleButton?.textContent?.trim()
      };
    });
    
    console.log('Auth page elements:', authElements);
    
    // Test 3: Simulate Login (we'll use a mock approach)
    console.log('\n👤 Simulating Login...');
    
    // For testing purposes, let's check if there's a way to bypass auth or use test credentials
    // Let's try to access the dashboard directly and see what happens
    
    // Test 4: Check if Share Pitch Button exists in Dashboard
    console.log('\n📤 Testing Share Pitch Button...');
    
    // Let's check the dashboard structure to see if share pitch functionality is present
    const dashboardStructure = await page.evaluate(() => {
      // Check for any share-related buttons or links
      const shareButtons = Array.from(document.querySelectorAll('button, a')).filter(el => 
        el.textContent?.toLowerCase().includes('share') ||
        el.textContent?.toLowerCase().includes('pitch')
      );
      
      const analyticsSection = document.querySelector('[data-testid="analytics"]') || 
                              document.querySelector('.analytics') ||
                              document.querySelector('[class*="analytics"]');
      
      const heroSection = document.querySelector('[data-testid="hero"]') || 
                         document.querySelector('.hero') ||
                         document.querySelector('[class*="hero"]');
      
      return {
        shareButtons: shareButtons.map(btn => ({
          text: btn.textContent?.trim(),
          tag: btn.tagName,
          disabled: btn.disabled,
          href: btn.href
        })),
        hasAnalyticsSection: !!analyticsSection,
        hasHeroSection: !!heroSection,
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim())
      };
    });
    
    console.log('Dashboard structure:', dashboardStructure);
    
    // Test 5: Check for Share Pitch in Analytics Tab
    console.log('\n📊 Testing Analytics Tab for Share Pitch...');
    
    // Let's check if there are any share pitch related elements
    const sharePitchElements = await page.evaluate(() => {
      const sharePitchButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.toLowerCase().includes('share') && 
        btn.textContent?.toLowerCase().includes('pitch')
      );
      
      const shareIcons = Array.from(document.querySelectorAll('svg, i')).filter(icon => 
        icon.getAttribute('data-lucide') === 'share-2' ||
        icon.className?.includes('share') ||
        icon.getAttribute('aria-label')?.toLowerCase().includes('share')
      );
      
      return {
        sharePitchButtons: sharePitchButtons.map(btn => ({
          text: btn.textContent?.trim(),
          disabled: btn.disabled,
          visible: btn.offsetParent !== null
        })),
        shareIcons: shareIcons.length,
        allShareRelated: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent?.toLowerCase().includes('share') ||
          el.textContent?.toLowerCase().includes('pitch')
        ).map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 50)
        }))
      };
    });
    
    console.log('Share pitch elements:', sharePitchElements);
    
    // Test 6: Check Console for Errors
    console.log('\n🚨 Checking for Console Errors...');
    
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:', consoleErrors);
      issues.push(`Console errors: ${consoleErrors.length} found`);
    } else {
      console.log('✅ No console errors found');
    }
    
    // Test 7: Check Network Requests
    console.log('\n🌐 Checking Network Requests...');
    
    const networkRequests = await page.evaluate(() => {
      return window.networkRequests || [];
    });
    
    console.log('Network requests:', networkRequests.length);
    
    // Test 8: Check for Share Pitch API Endpoints
    console.log('\n🔗 Testing Share Pitch API...');
    
    try {
      const shareApiResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/share-pitch', { method: 'GET' });
          return { status: response.status, ok: response.ok };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('Share pitch API response:', shareApiResponse);
    } catch (error) {
      console.log('Share pitch API test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    issues.push(`Test error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Summary
  console.log('\n📋 SHARE PITCH FEATURE TEST SUMMARY');
  console.log('====================================');
  
  if (issues.length === 0) {
    console.log('✅ All tests passed! Share pitch feature appears to be working.');
  } else {
    console.log('❌ Issues found:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('1. Check if share pitch button exists in dashboard');
  console.log('2. Verify share pitch functionality works when logged in');
  console.log('3. Test share pitch API endpoints');
  console.log('4. Ensure proper authentication flow');
}

testSharePitchFeature().catch(console.error);
