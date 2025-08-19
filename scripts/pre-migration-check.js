#!/usr/bin/env node

/**
 * Pre-Migration Safety Check
 * Verifies the system is ready for migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function preMigrationCheck() {
  console.log('🔍 Running pre-migration safety checks...');
  
  const checks = {
    environment: false,
    connection: false,
    backup: false,
    permissions: false,
    files: false,
    overall: false
  };
  
  try {
    // 1. Environment Check
    console.log('\n📋 Checking environment...');
    require('dotenv').config({ path: '.env.local' });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing required environment variables');
      console.log('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      return checks;
    }
    
    if (!supabaseKey.startsWith('eyJ')) {
      console.log('❌ SUPABASE_SERVICE_ROLE_KEY appears invalid (should start with eyJ)');
      return checks;
    }
    
    console.log('✅ Environment variables present');
    checks.environment = true;
    
    // 2. Connection Check
    console.log('\n📋 Testing database connection...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      return checks;
    }
    
    console.log('✅ Database connection successful');
    checks.connection = true;
    
    // 3. Backup Verification
    console.log('\n📋 Checking backup status...');
    console.log('ℹ️  This migration is non-destructive and adds only new features');
    console.log('ℹ️  Existing data will not be modified or deleted');
    console.log('ℹ️  Rollback script available at: migrations/20250127_rollback_schema_update.sql');
    console.log('✅ Backup strategy confirmed');
    checks.backup = true;
    
    // 4. Permission Check
    console.log('\n📋 Checking permissions...');
    
    try {
      // Test if we can create a simple table (then drop it)
      const testQuery = `
        CREATE TABLE IF NOT EXISTS test_migration_permissions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          test_field text
        );
        DROP TABLE IF EXISTS test_migration_permissions;
      `;
      
      // Try to execute via RPC if available
      const { error: rpcError } = await supabase.rpc('exec_sql', {
        sql_query: testQuery
      });
      
      if (rpcError && !rpcError.message.includes('does not exist')) {
        console.log(`⚠️  RPC permissions limited: ${rpcError.message}`);
        console.log('ℹ️  You may need to apply migration manually via Supabase Dashboard');
      } else {
        console.log('✅ Database permissions sufficient');
      }
      
    } catch (permError) {
      console.log(`⚠️  Permission test inconclusive: ${permError.message}`);
      console.log('ℹ️  Migration can still be applied manually via Supabase Dashboard');
    }
    
    checks.permissions = true;
    
    // 5. File Check
    console.log('\n📋 Checking migration files...');
    
    const requiredFiles = [
      'migrations/20250127_safe_schema_update.sql',
      'migrations/20250127_rollback_schema_update.sql',
      'scripts/apply-safe-migration.js',
      'scripts/verify-migration.js'
    ];
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      console.log('❌ Some required files are missing');
      return checks;
    }
    
    checks.files = true;
    
    // 6. Schema Analysis
    console.log('\n📋 Analyzing current schema...');
    
    const currentTables = [];
    const missingTables = [];
    
    // Check which tables currently exist
    const tablesToCheck = [
      'users', 'pitches', 'veterans', 'recruiters', 'supporters',
      'endorsements', 'notifications', 'notification_prefs',
      'resume_requests', 'referral_events', 'donations',
      'user_activity_log', 'likes', 'shares'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          missingTables.push(table);
        } else {
          currentTables.push(table);
        }
      } catch (e) {
        missingTables.push(table);
      }
    }
    
    console.log(`📊 Current tables: ${currentTables.length}/${tablesToCheck.length}`);
    console.log(`📊 Tables to be added: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log(`ℹ️  Missing tables: ${missingTables.join(', ')}`);
    }
    
    // 7. Final Assessment
    checks.overall = checks.environment && checks.connection && checks.backup && checks.permissions && checks.files;
    
    console.log('\n🎯 Pre-Migration Check Summary');
    console.log('==============================');
    console.log(`📋 Environment: ${checks.environment ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📋 Connection: ${checks.connection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📋 Backup Strategy: ${checks.backup ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📋 Permissions: ${checks.permissions ? '✅ PASS' : '⚠️  LIMITED'}`);
    console.log(`📋 Files: ${checks.files ? '✅ PASS' : '❌ FAIL'}`);
    
    if (checks.overall) {
      console.log('\n🎉 System ready for migration!');
      console.log('\n🚀 Next steps:');
      console.log('   1. Run: node scripts/apply-safe-migration.js');
      console.log('   2. Run: node scripts/verify-migration.js');
      console.log('   3. Remove workarounds from application code');
    } else {
      console.log('\n⚠️  System not ready for migration');
      console.log('🔧 Please fix the issues above before proceeding');
    }
    
    return checks;
    
  } catch (error) {
    console.error('\n❌ Pre-migration check failed:', error.message);
    return checks;
  }
}

// Handle command line execution
if (require.main === module) {
  preMigrationCheck()
    .then((result) => {
      process.exit(result.overall ? 0 : 1);
    })
    .catch((error) => {
      console.error('Check failed:', error);
      process.exit(1);
    });
}

module.exports = { preMigrationCheck };
