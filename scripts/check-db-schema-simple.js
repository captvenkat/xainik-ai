const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking current database schema...\n');
    
    // Check if tables exist by trying to query them
    const tables = [
      'users',
      'user_profiles', 
      'pitches',
      'endorsements',
      'referrals',
      'referral_events',
      'resume_requests',
      'notification_prefs',
      'notifications',
      'service_plans',
      'user_subscriptions',
      'invoices',
      'receipts',
      'payment_events',
      'donations',
      'recruiter_notes',
      'recruiter_saved_filters',
      'user_activity_log',
      'migration_audit',
      'user_permissions'
    ];
    
    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          results[table] = { exists: true, count: data?.length || 0 };
        }
      } catch (err) {
        results[table] = { exists: false, error: err.message };
      }
    }
    
    console.log('📊 Database Schema Status:');
    console.log('========================\n');
    
    let existingTables = 0;
    let missingTables = 0;
    
    for (const [table, result] of Object.entries(results)) {
      if (result.exists) {
        console.log(`✅ ${table} - EXISTS`);
        existingTables++;
      } else {
        console.log(`❌ ${table} - MISSING (${result.error})`);
        missingTables++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`- Existing tables: ${existingTables}`);
    console.log(`- Missing tables: ${missingTables}`);
    console.log(`- Total expected: ${tables.length}`);
    
    // Check specific important tables
    console.log('\n🔍 Key Tables Analysis:');
    if (results.users?.exists) {
      console.log('✅ Users table - Core user management');
    } else {
      console.log('❌ Users table - CRITICAL MISSING');
    }
    
    if (results.user_profiles?.exists) {
      console.log('✅ User profiles table - Extended profile data');
    } else {
      console.log('❌ User profiles table - Profile data missing');
    }
    
    if (results.pitches?.exists) {
      console.log('✅ Pitches table - Core pitch functionality');
    } else {
      console.log('❌ Pitches table - CRITICAL MISSING');
    }
    
    if (results.notification_prefs?.exists) {
      console.log('✅ Notification preferences - User settings');
    } else {
      console.log('❌ Notification preferences - Settings missing');
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();
