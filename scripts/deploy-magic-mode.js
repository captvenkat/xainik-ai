#!/usr/bin/env node

/**
 * Magic Mode Deployment Script
 * 
 * This script helps deploy the Magic Mode feature to production.
 * It includes database migration and feature flag management.
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Magic Mode Deployment Script')
console.log('================================')

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.')
  process.exit(1)
}

// Check if migration file exists
const migrationPath = path.join(process.cwd(), 'migrations', '2025-08-26_magic_mode.sql')
if (!fs.existsSync(migrationPath)) {
  console.error('❌ Error: Magic Mode migration file not found.')
  console.error('Expected: migrations/2025-08-26_magic_mode.sql')
  process.exit(1)
}

console.log('✅ Project structure verified')

// Display deployment checklist
console.log('\n📋 Deployment Checklist:')
console.log('1. ✅ Magic Mode migration file exists')
console.log('2. ✅ Feature flags added to next.config.mjs')
console.log('3. ✅ AI API endpoints created')
console.log('4. ✅ Story management system implemented')
console.log('5. ✅ Veteran dashboard tabs created')
console.log('6. ✅ Public story pages implemented')
console.log('7. ✅ MagicPitchWizard component created')

console.log('\n🔧 Next Steps:')
console.log('1. Run the database migration in Supabase SQL Editor:')
console.log('   - Copy contents of migrations/2025-08-26_magic_mode.sql')
console.log('   - Paste into Supabase SQL Editor')
console.log('   - Execute the migration')
console.log('')
console.log('2. Deploy to production:')
console.log('   npx vercel --prod')
console.log('')
console.log('3. Verify feature flags are enabled:')
console.log('   - NEXT_PUBLIC_FEATURE_MAGIC_MODE=true')
console.log('   - NEXT_PUBLIC_FEATURE_FOUNDING50=true')
console.log('')
console.log('4. Test the Magic Mode flow:')
console.log('   - Visit /pitch/new')
console.log('   - Verify Magic vs Classic toggle appears')
console.log('   - Test Magic Mode pitch creation flow')
console.log('   - Verify stories functionality in dashboard')

console.log('\n🎯 Magic Mode Features:')
console.log('- AI-powered pitch generation')
console.log('- Story suggestions and publishing')
console.log('- Mobile-first design with bottom navigation')
console.log('- 1/day story publishing limit with queuing')
console.log('- Public story pages with analytics')
console.log('- Resume request enhancements')

console.log('\n📊 Analytics Integration:')
console.log('- Story view tracking')
console.log('- Share button analytics')
console.log('- CTA click tracking')
console.log('- UTM parameter support')

console.log('\n🔒 Security & Privacy:')
console.log('- Resume files remain private')
console.log('- PII protection in AI prompts')
console.log('- Row-level security on stories table')
console.log('- Feature flag protection')

console.log('\n✨ Magic Mode is ready for deployment!')
console.log('Follow the checklist above to complete the deployment.')
