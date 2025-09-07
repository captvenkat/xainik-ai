#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

/**
 * CI Build Output Assertion for Server Functions
 * 
 * This script verifies that Next.js build output contains server functions
 * for API routes, ensuring they're not being statically exported.
 */

const API_ROUTES_TO_CHECK = [
  'health',
  'bookings/confirm',
  'bookings',
  'test'
];

function checkServerFunction(apiPath: string): boolean {
  const candidates = [
    `.next/server/app/api/${apiPath}/route.js`,
    `.next/server/app/api/${apiPath}/route.mjs`,
    `.next/server/app/api/${apiPath}/route/index.js`,
    `.next/server/app/api/${apiPath}/route/index.mjs`,
  ];
  
  const found = candidates.some(p => {
    const exists = fs.existsSync(p);
    if (exists) {
      console.log(`✅ Found server function: ${p}`);
    }
    return exists;
  });
  
  if (!found) {
    console.error(`❌ No server function found for /api/${apiPath}`);
    console.error(`   Checked paths: ${candidates.join(', ')}`);
    return false;
  }
  
  return true;
}

function main() {
  console.log('🔍 Checking for server functions in build output...');
  
  // Check if .next directory exists
  if (!fs.existsSync('.next')) {
    console.error('❌ .next directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Check if server directory exists
  if (!fs.existsSync('.next/server')) {
    console.error('❌ .next/server directory not found. Build may have failed.');
    process.exit(1);
  }
  
  let allPassed = true;
  
  for (const apiPath of API_ROUTES_TO_CHECK) {
    if (!checkServerFunction(apiPath)) {
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('✅ All server functions found in build output!');
    console.log('🚀 Ready for deployment with server functions.');
  } else {
    console.error('❌ Some server functions are missing from build output.');
    console.error('   This indicates a static export configuration issue.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
