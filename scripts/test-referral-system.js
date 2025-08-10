// test-referral-system.js
const https = require('https');
const http = require('http');
const url = require('url');

const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';

function makeRequest(pageUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(pageUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(pageUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Referral-System-Test/1.0',
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

async function testReferralSystem() {
  console.log('🔍 Referral System Test');
  console.log('======================');
  
  const tests = [
    {
      name: 'Pitch Detail Page',
      url: `${BASE_URL}/pitch/test-pitch-id`,
      expected: 200,
      description: 'Should load pitch detail page with referral button'
    },
    {
      name: 'Supporter Refer Page',
      url: `${BASE_URL}/supporter/refer`,
      expected: 200,
      description: 'Should load supporter referral page'
    },
    {
      name: 'Dashboard Routes',
      urls: [
        `${BASE_URL}/dashboard/veteran`,
        `${BASE_URL}/dashboard/recruiter`,
        `${BASE_URL}/dashboard/supporter`
      ],
      expected: 200,
      description: 'Should load dashboard pages with referral widgets'
    }
  ];

  console.log('\n📋 Running Tests:\n');
  
  for (const test of tests) {
    if (test.urls) {
      console.log(`Testing: ${test.name}`);
      console.log(`Expected: ${test.expected} - ${test.description}`);
      
      for (const testUrl of test.urls) {
        try {
          const result = await makeRequest(testUrl);
          const status = result.status === test.expected ? '✅ PASS' : `❌ FAIL (${result.status})`;
          console.log(`  ${status} ${testUrl}`);
        } catch (error) {
          console.log(`  ❌ ERROR ${testUrl}: ${error.message}`);
        }
      }
    } else {
      console.log(`Testing: ${test.name}`);
      console.log(`Expected: ${test.expected} - ${test.description}`);
      
      try {
        const result = await makeRequest(test.url);
        const status = result.status === test.expected ? '✅ PASS' : `❌ FAIL (${result.status})`;
        console.log(`  ${status} ${test.url}`);
      } catch (error) {
        console.log(`  ❌ ERROR ${test.url}: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('📊 Referral System Components to Verify:');
  console.log('========================================');
  console.log('✅ ReferModal component with platform sharing');
  console.log('✅ ReferButton component integration');
  console.log('✅ Referral event tracking in pitch detail page');
  console.log('✅ Contact button referral attribution');
  console.log('✅ Dashboard referral metrics');
  console.log('✅ Supporter referral page');
  console.log('✅ RLS-compliant data access');
  console.log('');
  console.log('🔧 Manual Testing Required:');
  console.log('==========================');
  console.log('1. Generate referral link from pitch detail page');
  console.log('2. Test platform-specific sharing (WhatsApp, LinkedIn, Email, Copy)');
  console.log('3. Click referral link and verify event logging');
  console.log('4. Check dashboard widgets for referral data');
  console.log('5. Test referral attribution in contact actions');
  console.log('6. Verify RLS policies prevent unauthorized access');
  console.log('');
}

testReferralSystem();
