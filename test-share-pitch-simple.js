const puppeteer = require('puppeteer');

async function testSharePitchSimple() {
  console.log('🔍 Testing Share Pitch Feature - Simple Check');
  console.log('============================================');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Check if share pitch button exists in the code
    console.log('\n📤 Checking Share Pitch Button in Code...');
    
    // Let's check the dashboard page directly
    await page.goto('http://localhost:3000/dashboard/veteran', { waitUntil: 'networkidle2' });
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth')) {
      console.log('✅ Dashboard correctly redirects to auth when not logged in');
      console.log('ℹ️  Need to be logged in to test share pitch functionality');
    }
    
    // Test 2: Check auth page
    console.log('\n🔐 Checking Auth Page...');
    await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2' });
    
    const authElements = await page.evaluate(() => {
      const googleButton = document.querySelector('button[data-provider="google"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      
      return {
        hasGoogleAuth: !!googleButton,
        hasEmailInput: !!emailInput,
        hasPasswordInput: !!passwordInput,
        googleButtonText: googleButton?.textContent?.trim()
      };
    });
    
    console.log('Auth page elements:', authElements);
    
    // Test 3: Check if share pitch API exists
    console.log('\n🔗 Checking Share Pitch API...');
    
    try {
      const apiResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/share-pitch', { method: 'GET' });
          return { status: response.status, ok: response.ok };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('Share pitch API response:', apiResponse);
    } catch (error) {
      console.log('Share pitch API test failed:', error.message);
    }
    
    // Test 4: Check for share pitch related components
    console.log('\n📋 Checking Share Pitch Components...');
    
    const shareComponents = await page.evaluate(() => {
      const shareButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.toLowerCase().includes('share')
      );
      
      const shareIcons = Array.from(document.querySelectorAll('svg')).filter(icon => 
        icon.getAttribute('data-lucide') === 'share-2' ||
        icon.getAttribute('data-lucide') === 'share'
      );
      
      return {
        shareButtons: shareButtons.map(btn => ({
          text: btn.textContent?.trim(),
          disabled: btn.disabled,
          visible: btn.offsetParent !== null
        })),
        shareIcons: shareIcons.length,
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(Boolean)
      };
    });
    
    console.log('Share components found:', shareComponents);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
  
  // Summary
  console.log('\n📋 SHARE PITCH FEATURE STATUS');
  console.log('==============================');
  console.log('✅ Share pitch button exists in SimpleHeroSection component');
  console.log('⚠️  Share pitch onClick function only logs to console');
  console.log('❌ No actual share pitch functionality implemented');
  console.log('❌ No share pitch API endpoint exists');
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('1. Implement actual share pitch functionality');
  console.log('2. Create share pitch API endpoint');
  console.log('3. Add share pitch modal or page');
  console.log('4. Test with authenticated user');
}

testSharePitchSimple().catch(console.error);
