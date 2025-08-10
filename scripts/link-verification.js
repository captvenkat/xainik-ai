#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Required routes from spec
const requiredRoutes = [
  // Core pages
  '/',
  '/browse',
  '/pitch/[id]',
  '/pitch/new',
  '/pricing',
  '/donations',
  '/support',
  '/endorse/[pitchId]',
  '/about',
  '/contact',
  '/support-the-mission',
  '/terms',
  '/privacy',
  
  // Dashboards
  '/dashboard/veteran',
  '/dashboard/recruiter',
  '/dashboard/supporter',
  '/dashboard/admin',
  
  // API routes
  '/api/razorpay/webhook',
  '/api/docs/invoice/[id]',
  '/api/docs/receipt/[id]',
  '/api/cron/expire',
  
  // Additional routes
  '/auth',
  '/refer/opened',
  '/refer/sent',
  '/supporter/refer',
  '/shortlist',
  '/resume-request/success'
];

// Check if page files exist
function checkPageExists(route) {
  const appDir = path.join(__dirname, '..', 'src', 'app');
  
  // Convert route to file path
  let filePath = route;
  
  // Handle dynamic routes - keep the brackets for directory matching
  // filePath = filePath.replace(/\[([^\]]+)\]/g, '$1');
  
  // Handle API routes
  if (filePath.startsWith('/api/')) {
    filePath = filePath.replace('/api/', 'api/');
    filePath = path.join(appDir, filePath, 'route.ts');
  } else {
    // Remove leading slash
    filePath = filePath.substring(1);
    filePath = path.join(appDir, filePath, 'page.tsx');
  }
  
  // Also check for page.js
  const jsPath = filePath.replace('.tsx', '.js');
  
  return {
    route,
    exists: fs.existsSync(filePath) || fs.existsSync(jsPath),
    path: filePath,
    jsPath: jsPath
  };
}

// Check all routes
function verifyRoutes() {
  console.log('🔍 Verifying Required Routes\n');
  
  const results = requiredRoutes.map(checkPageExists);
  
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  
  console.log(`✅ Found ${existing.length} routes:`);
  existing.forEach(r => {
    console.log(`   ${r.route}`);
  });
  
  console.log(`\n❌ Missing ${missing.length} routes:`);
  missing.forEach(r => {
    console.log(`   ${r.route}`);
  });
  
  console.log(`\n📊 Summary: ${existing.length}/${results.length} routes exist (${Math.round(existing.length/results.length*100)}%)`);
  
  return { existing, missing };
}

// Check CTAs and links
function checkCTAs() {
  console.log('\n🔗 Checking CTAs and Links\n');
  
  const ctaChecks = [
    { name: 'Post My Pitch', target: '/auth then /pitch/new', type: 'veteran' },
    { name: 'Request Resume', target: 'recruiter-only, else /auth with recruiter role', type: 'recruiter' },
    { name: 'Refer This Veteran\'s Pitch', target: 'supporter-only modal', type: 'supporter' },
    { name: 'Phone tel:', target: 'mobile: tel:, desktop: tooltip', type: 'contact' }
  ];
  
  ctaChecks.forEach(cta => {
    console.log(`   ${cta.name} → ${cta.target} (${cta.type})`);
  });
}

// Check role-based access
function checkRoleGates() {
  console.log('\n🛡️ Checking Role-Based Access\n');
  
  const roleChecks = [
    { route: '/dashboard/veteran', roles: ['veteran'] },
    { route: '/dashboard/recruiter', roles: ['recruiter'] },
    { route: '/dashboard/supporter', roles: ['supporter'] },
    { route: '/dashboard/admin', roles: ['admin'] },
    { route: '/pitch/new', roles: ['veteran'] },
    { route: '/endorse/[pitchId]', roles: ['supporter'] }
  ];
  
  roleChecks.forEach(check => {
    console.log(`   ${check.route} → ${check.roles.join(', ')}`);
  });
}

// Main verification
function main() {
  console.log('🚀 Xainik Site Route Verification\n');
  console.log('=' .repeat(50));
  
  const { existing, missing } = verifyRoutes();
  checkCTAs();
  checkRoleGates();
  
  console.log('\n' + '=' .repeat(50));
  
  if (missing.length === 0) {
    console.log('🎉 All required routes exist!');
  } else {
    console.log(`⚠️  ${missing.length} routes need to be created.`);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Create missing route files');
  console.log('2. Implement role-based access control');
  console.log('3. Wire up CTAs and navigation');
  console.log('4. Test end-to-end functionality');
}

if (require.main === module) {
  main();
}

module.exports = { verifyRoutes, checkCTAs, checkRoleGates };
