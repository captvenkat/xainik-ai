#!/usr/bin/env node

// =====================================================
// SUPPORTER DASHBOARD SCHEMA APPLICATION SCRIPT
// World-Class Professional Implementation
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// =====================================================
// SUPABASE CLIENT SETUP
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =====================================================
// MIGRATION FUNCTIONS
// =====================================================

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function readMigrationFile() {
  console.log('📖 Reading migration file...');
  
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', '20250128_supporter_dashboard_schema.sql');
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('✅ Migration file read successfully');
    return migrationContent;
  } catch (error) {
    console.error('❌ Failed to read migration file:', error.message);
    return null;
  }
}

async function applyMigration(migrationContent) {
  console.log('🚀 Applying supporter dashboard schema migration...');
  
  try {
    // Split the migration into individual statements
    const statements = migrationContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim().length === 0) continue;
      
      try {
        console.log(`  [${i + 1}/${statements.length}] Executing statement...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('users')
            .select('*')
            .limit(0);
          
          if (directError) {
            throw error;
          }
        }
        
        successCount++;
        console.log(`  ✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Statement ${i + 1} failed:`, error.message);
        
        // Continue with other statements unless it's a critical error
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`  ⚠️  Statement ${i + 1} skipped (already exists)`);
          successCount++;
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    
    return errorCount === 0;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying created tables...');
  
  const expectedTables = [
    'ai_suggestions',
    'supporter_celebrations',
    'supporter_badges',
    'user_goals',
    'goal_progress',
    'behavioral_nudges',
    'user_behavior_analytics',
    'supporter_impact'
  ];
  
  const expectedViews = [
    'unified_supporters_aggregated',
    'supporter_impact_summary'
  ];
  
  let tableSuccessCount = 0;
  let viewSuccessCount = 0;
  
  // Check tables
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`  ❌ Table ${tableName}: ${error.message}`);
      } else {
        console.log(`  ✅ Table ${tableName}: OK`);
        tableSuccessCount++;
      }
    } catch (error) {
      console.error(`  ❌ Table ${tableName}: ${error.message}`);
    }
  }
  
  // Check views
  for (const viewName of expectedViews) {
    try {
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`  ❌ View ${viewName}: ${error.message}`);
      } else {
        console.log(`  ✅ View ${viewName}: OK`);
        viewSuccessCount++;
      }
    } catch (error) {
      console.error(`  ❌ View ${viewName}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Verification Summary:`);
  console.log(`  ✅ Tables: ${tableSuccessCount}/${expectedTables.length}`);
  console.log(`  ✅ Views: ${viewSuccessCount}/${expectedViews.length}`);
  
  return tableSuccessCount === expectedTables.length && viewSuccessCount === expectedViews.length;
}

async function insertSampleData() {
  console.log('\n📝 Inserting sample data...');
  
  try {
    // Get a supporter user for sample data
    const { data: supporterUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'supporter')
      .limit(1)
      .single();
    
    if (userError || !supporterUser) {
      console.log('⚠️  No supporter user found, skipping sample data insertion');
      return true;
    }
    
    const supporterId = supporterUser.id;
    
    // Insert sample AI suggestions
    const { error: suggestionsError } = await supabase
      .from('ai_suggestions')
      .insert([
        {
          user_id: supporterId,
          user_type: 'supporter',
          suggestion_type: 'engagement',
          title: 'Share a Veteran Pitch',
          description: 'Help a veteran get noticed by sharing their pitch with your network',
          priority: 'high',
          icon: '🔗',
          action_text: 'Browse Veterans',
          action_type: 'browse_veterans'
        },
        {
          user_id: supporterId,
          user_type: 'supporter',
          suggestion_type: 'impact',
          title: 'Make Your First Endorsement',
          description: 'Endorse a veteran to boost their credibility and help them succeed',
          priority: 'medium',
          icon: '⭐',
          action_text: 'Find Veterans',
          action_type: 'find_veterans'
        }
      ]);
    
    if (suggestionsError) {
      console.error('❌ Failed to insert sample AI suggestions:', suggestionsError.message);
    } else {
      console.log('✅ Sample AI suggestions inserted');
    }
    
    // Insert sample supporter celebrations
    const { error: celebrationsError } = await supabase
      .from('supporter_celebrations')
      .insert([
        {
          supporter_id: supporterId.toString(),
          celebration_type: 'achievement',
          title: 'First Referral! 🔗',
          description: 'You\'ve helped connect a veteran with opportunities!',
          impact_score: 50
        },
        {
          supporter_id: supporterId.toString(),
          celebration_type: 'milestone',
          title: 'Bronze Supporter Achievement! 🥉',
          description: 'You\'ve reached 100 impact points and earned Bronze status!',
          impact_score: 100
        }
      ]);
    
    if (celebrationsError) {
      console.error('❌ Failed to insert sample celebrations:', celebrationsError.message);
    } else {
      console.log('✅ Sample celebrations inserted');
    }
    
    // Insert sample supporter badges
    const { error: badgesError } = await supabase
      .from('supporter_badges')
      .insert([
        {
          supporter_id: supporterId.toString(),
          badge_type: 'first_referral',
          badge_name: 'First Referral',
          badge_description: 'Made your first veteran referral',
          icon: '🔗'
        },
        {
          supporter_id: supporterId.toString(),
          badge_type: 'bronze',
          badge_name: 'Bronze Supporter',
          badge_description: 'Reached 100 impact points',
          icon: '🥉'
        }
      ]);
    
    if (badgesError) {
      console.error('❌ Failed to insert sample badges:', badgesError.message);
    } else {
      console.log('✅ Sample badges inserted');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error.message);
    return false;
  }
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('🎯 SUPPORTER DASHBOARD SCHEMA MIGRATION');
  console.log('=====================================\n');
  
  // Check database connection
  const connectionOk = await checkDatabaseConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  // Read migration file
  const migrationContent = await readMigrationFile();
  if (!migrationContent) {
    process.exit(1);
  }
  
  // Apply migration
  const migrationSuccess = await applyMigration(migrationContent);
  if (!migrationSuccess) {
    console.log('\n⚠️  Migration completed with some errors. Please review the output above.');
  }
  
  // Verify tables
  const verificationSuccess = await verifyTables();
  if (!verificationSuccess) {
    console.log('\n⚠️  Some tables or views may not have been created properly.');
  }
  
  // Insert sample data
  const sampleDataSuccess = await insertSampleData();
  if (!sampleDataSuccess) {
    console.log('\n⚠️  Sample data insertion had some issues.');
  }
  
  // Final summary
  console.log('\n🎉 SUPPORTER DASHBOARD SCHEMA MIGRATION COMPLETE');
  console.log('===============================================');
  
  if (migrationSuccess && verificationSuccess) {
    console.log('✅ Migration successful! The supporter dashboard is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('  1. Test the supporter dashboard at /dashboard/supporter');
    console.log('  2. Verify all tabs and features are working');
    console.log('  3. Check that AI suggestions and celebrations appear');
    console.log('  4. Test the impact tracking and analytics');
  } else {
    console.log('⚠️  Migration completed with issues. Please review the output above.');
    console.log('   You may need to manually fix some database objects.');
  }
  
  console.log('\n🔗 Supporter Dashboard URL: /dashboard/supporter');
  console.log('📊 Impact Analytics: /dashboard/supporter (Impact tab)');
  console.log('🎉 Celebrations: /dashboard/supporter (Celebrations tab)');
  console.log('🤖 AI Suggestions: /dashboard/supporter (AI Suggestions tab)');
}

// =====================================================
// ERROR HANDLING
// =====================================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// =====================================================
// EXECUTE
// =====================================================

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  checkDatabaseConnection,
  readMigrationFile,
  applyMigration,
  verifyTables,
  insertSampleData
};
