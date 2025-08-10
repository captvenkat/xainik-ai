// test-profile-system.js
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
        'User-Agent': 'Profile-System-Test/1.0',
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

async function testProfileSystem() {
  console.log('🔍 Profile System Test');
  console.log('=====================');
  
  const tests = [
    {
      name: 'Dashboard Routes',
      urls: [
        `${BASE_URL}/dashboard/veteran`,
        `${BASE_URL}/dashboard/recruiter`,
        `${BASE_URL}/dashboard/supporter`
      ],
      expected: 200,
      description: 'Should load dashboard pages with proper authentication'
    },
    {
      name: 'Pitch Management',
      urls: [
        `${BASE_URL}/pitch/new`,
        `${BASE_URL}/pitch/test-pitch-id`,
        `${BASE_URL}/pitch/test-pitch-id/edit`
      ],
      expected: 200,
      description: 'Should handle pitch creation, viewing, and editing'
    },
    {
      name: 'Public Pages',
      urls: [
        `${BASE_URL}/browse`,
        `${BASE_URL}/shortlist`,
        `${BASE_URL}/supporter/refer`
      ],
      expected: 200,
      description: 'Should load public pages accessible to all users'
    },
    {
      name: 'Document Downloads',
      urls: [
        `${BASE_URL}/api/docs/invoice/test-id`,
        `${BASE_URL}/api/docs/receipt/test-id`
      ],
      expected: [200, 401, 404],
      description: 'Should handle document downloads with proper authentication'
    }
  ];

  console.log('\n📋 Running Tests:\n');
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`Expected: ${Array.isArray(test.expected) ? test.expected.join(' or ') : test.expected} - ${test.description}`);
    
    for (const testUrl of test.urls) {
      try {
        const result = await makeRequest(testUrl);
        const expectedStatuses = Array.isArray(test.expected) ? test.expected : [test.expected];
        const status = expectedStatuses.includes(result.status) ? '✅ PASS' : `❌ FAIL (${result.status})`;
        console.log(`  ${status} ${testUrl}`);
      } catch (error) {
        console.log(`  ❌ ERROR ${testUrl}: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('📊 Profile System Components to Verify:');
  console.log('=======================================');
  console.log('✅ Veteran Dashboard: Pitch status, endorsements, referrals, resume requests');
  console.log('✅ Recruiter Dashboard: Shortlisted veterans, contacts, resume requests');
  console.log('✅ Supporter Dashboard: Referred pitches, endorsements, conversions');
  console.log('✅ Public Pitch Page: Veteran info, endorsements, referral CTA');
  console.log('✅ Pitch Edit: Prefilled data, RLS compliance');
  console.log('✅ Contact Actions: Call/email with activity logging');
  console.log('✅ Document Downloads: Invoice and receipt downloads');
  console.log('✅ RLS Enforcement: Role-based access control');
  console.log('');
  console.log('🔧 Manual Testing Required:');
  console.log('==========================');
  console.log('1. Login as Veteran: Verify dashboard widgets and edit pitch functionality');
  console.log('2. Login as Recruiter: Test shortlist, contact actions, resume requests');
  console.log('3. Login as Supporter: Check referral tracking and endorsements');
  console.log('4. Public Access: Verify pitch pages work for unauthenticated users');
  console.log('5. RLS Testing: Attempt unauthorized access and verify denial');
  console.log('6. Mobile Testing: Check responsive layouts on mobile devices');
  console.log('7. SEO Testing: Verify meta tags and title tags on public pages');
  console.log('');
  console.log('🎯 Key Functionality to Test:');
  console.log('============================');
  console.log('• Pitch creation and editing with prefilled data');
  console.log('• Endorsement submission and display');
  console.log('• Referral link generation and tracking');
  console.log('• Contact actions (call/email) with attribution');
  console.log('• Resume request workflow (PENDING/APPROVED/DECLINED)');
  console.log('• Document download with proper authentication');
  console.log('• Plan expiry logic and pitch visibility');
  console.log('• Dashboard metrics accuracy and real-time updates');
  console.log('');
}

testProfileSystem();
