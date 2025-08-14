const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function verifyProfileSystem() {
  try {
    console.log('🔍 Verifying Profile System...\n');
    
    // Check if required tables exist
    const tablesToCheck = [
      'veterans',
      'recruiters', 
      'supporters',
      'notification_prefs',
      'notifications',
      'service_plans',
      'user_subscriptions'
    ];
    
    console.log('📋 Checking required tables...');
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Table exists`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    // Check if users table has profile data
    console.log('\n👥 Checking users table structure...');
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(3);
      
      if (usersError) {
        console.log(`❌ Users table error: ${usersError.message}`);
      } else {
        console.log(`✅ Users table accessible`);
        console.log(`📊 Found ${users.length} users`);
        
        if (users.length > 0) {
          const user = users[0];
          console.log(`👤 Sample user: ${user.name || 'No name'} (${user.email}) - Role: ${user.role}`);
        }
      }
    } catch (err) {
      console.log(`❌ Users table check failed: ${err.message}`);
    }
    
    // Test profile creation (if veterans table exists)
    console.log('\n🧪 Testing profile creation...');
    try {
      const { data: testVeteran, error: testError } = await supabase
        .from('veterans')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log(`❌ Veterans table test: ${testError.message}`);
      } else {
        console.log(`✅ Veterans table test successful`);
        console.log(`📊 Found ${testVeteran.length} veteran profiles`);
      }
    } catch (err) {
      console.log(`❌ Veterans table test failed: ${err.message}`);
    }
    
    // Check service plans
    console.log('\n💳 Checking service plans...');
    try {
      const { data: plans, error: plansError } = await supabase
        .from('service_plans')
        .select('*');
      
      if (plansError) {
        console.log(`❌ Service plans check: ${plansError.message}`);
      } else {
        console.log(`✅ Service plans accessible`);
        console.log(`📊 Found ${plans.length} service plans`);
        
        plans.forEach(plan => {
          console.log(`  - ${plan.plan_name}: ₹${plan.price_cents / 100} (${plan.plan_code})`);
        });
      }
    } catch (err) {
      console.log(`❌ Service plans check failed: ${err.message}`);
    }
    
    console.log('\n🎯 Profile System Verification Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. If any tables are missing, run the SQL migration in Supabase SQL Editor');
    console.log('2. Test the profile settings page at /settings/profile');
    console.log('3. Verify veteran dashboard shows profile information');
    console.log('4. Test profile editing functionality');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyProfileSystem();
