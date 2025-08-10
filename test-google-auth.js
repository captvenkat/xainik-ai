// test-google-auth.js
// Test Google Auth configuration and functionality

import { chromium } from 'playwright';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

(async () => {
  console.log('🔍 Testing Google Auth Configuration...');
  console.log('=====================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to auth page
    console.log('📱 Navigating to auth page...');
    await page.goto(`${SITE_URL}/auth`);
    
    // Check if Google button is present
    console.log('🔍 Checking for Google sign-in button...');
    const googleButton = await page.locator('button:has-text("Continue with Google")');
    const isGoogleButtonVisible = await googleButton.isVisible();
    
    if (isGoogleButtonVisible) {
      console.log('✅ Google sign-in button is present');
      
      // Check if button is clickable
      const isEnabled = await googleButton.isEnabled();
      console.log(`📋 Button enabled: ${isEnabled}`);
      
      // Click the button to test OAuth flow
      console.log('🖱️  Clicking Google sign-in button...');
      await googleButton.click();
      
      // Wait a moment to see if OAuth popup appears
      await page.waitForTimeout(2000);
      
      // Check if we're redirected to Google OAuth
      const currentUrl = page.url();
      console.log(`🌐 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('accounts.google.com') || currentUrl.includes('oauth')) {
        console.log('✅ Google OAuth flow initiated successfully');
      } else {
        console.log('⚠️  No OAuth redirect detected - may need Supabase OAuth configuration');
      }
      
    } else {
      console.log('❌ Google sign-in button not found');
    }
    
    // Check for any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    if (errors.length > 0) {
      console.log('⚠️  Console errors found:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ No console errors');
    }
    
  } catch (error) {
    console.error('❌ Error testing Google Auth:', error);
  } finally {
    await browser.close();
  }
  
  console.log('\n📋 Google Auth Test Summary:');
  console.log('============================');
  console.log('1. Check if Google OAuth is configured in Supabase Dashboard');
  console.log('2. Verify Google Client ID and Secret are set in Supabase');
  console.log('3. Ensure redirect URLs are properly configured');
  console.log('4. Test the complete OAuth flow manually');
  
})();
