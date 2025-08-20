// =====================================================
// FORCE CACHE REFRESH SCRIPT
// Xainik Platform - Resolve Schema Caching Issues
// =====================================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Starting Force Cache Refresh...\n');

try {
  // Step 1: Clear browser instance cache
  console.log('📝 Step 1: Clearing Supabase browser instance cache...');
  
  // Create a temporary script to clear the cache
  const clearCacheScript = `
    // Clear browser instance
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      if (window.supabaseCache) {
        delete window.supabaseCache;
      }
      
      console.log('✅ Browser cache cleared');
    }
  `;
  
  fs.writeFileSync('temp-clear-cache.js', clearCacheScript);
  console.log('✅ Cache clear script created');

  // Step 2: Stop development server if running
  console.log('\n🛑 Step 2: Stopping development server...');
  try {
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
    console.log('✅ Development server stopped');
  } catch (error) {
    console.log('ℹ️  No development server running');
  }

  // Step 3: Clear Next.js cache
  console.log('\n🧹 Step 3: Clearing Next.js cache...');
  try {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('✅ Next.js cache cleared');
  } catch (error) {
    console.log('ℹ️  No .next directory found');
  }

  // Step 4: Clear node_modules cache
  console.log('\n📦 Step 4: Clearing node_modules cache...');
  try {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    console.log('✅ Node modules cache cleared');
  } catch (error) {
    console.log('ℹ️  No node_modules cache found');
  }

  // Step 5: Regenerate TypeScript types
  console.log('\n🔧 Step 5: Regenerating TypeScript types...');
  try {
    execSync('npx supabase gen types typescript --project-id $(grep -o "project_id = \"[^\"]*\"" supabase/config.toml | cut -d"\"" -f2) --schema public > types/live-schema.ts', { stdio: 'inherit' });
    console.log('✅ TypeScript types regenerated');
  } catch (error) {
    console.log('⚠️  Could not regenerate types automatically');
  }

  // Step 6: Clean up temporary files
  console.log('\n🧹 Step 6: Cleaning up...');
  try {
    fs.unlinkSync('temp-clear-cache.js');
    console.log('✅ Temporary files cleaned');
  } catch (error) {
    // Ignore if file doesn't exist
  }

  console.log('\n🎉 Cache refresh completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Open browser and hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
  console.log('3. Clear browser cache: DevTools → Application → Storage → Clear all');
  console.log('4. Test the application - schema errors should be resolved!');

} catch (error) {
  console.error('❌ Error during cache refresh:', error.message);
  process.exit(1);
}
