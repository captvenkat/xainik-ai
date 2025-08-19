const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyProductionFix() {
  console.log('🔧 Applying Production Database Fix...\n');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-missing-tables-production.sql', 'utf8');
    
    console.log('📝 Executing Production SQL migration...');
    
    // Split the SQL into individual statements and execute them
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log(`🔄 Executing: ${statement.substring(0, 50)}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement failed: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (e) {
          console.log(`⚠️  Statement error: ${e.message}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 MIGRATION RESULTS:');
    console.log('====================');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 PRODUCTION FIX APPLIED SUCCESSFULLY!');
      console.log('📋 Tables created/updated:');
      console.log('  - users (with proper relationships)');
      console.log('  - referrals (with foreign keys)');
      console.log('  - referral_events (with foreign keys)');
      console.log('  - community_suggestions (with user relationships)');
      console.log('  - All existing tables updated with proper foreign keys');
      console.log('\n🔒 RLS policies enabled');
      console.log('📊 Indexes created for performance');
      console.log('👁️  Views created for easier querying');
      console.log('\n✅ All 400 Bad Request errors should now be resolved!');
    } else {
      console.log('\n⚠️  Some statements failed. Please check the Supabase SQL Editor manually.');
      console.log('📝 File to copy: fix-missing-tables-production.sql');
    }
    
  } catch (error) {
    console.error('❌ Failed to apply production fix:', error);
    console.log('\n📝 Please copy and paste the contents of fix-missing-tables-production.sql into your Supabase SQL Editor');
  }
}

applyProductionFix().catch(console.error);
