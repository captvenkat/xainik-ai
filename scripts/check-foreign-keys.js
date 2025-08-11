const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkForeignKeys() {
  console.log('🔍 CHECKING FOREIGN KEY CONSTRAINTS\n');
  console.log('=====================================\n');
  
  // Test 1: Check pitches -> users relationship with different constraint names
  console.log('1️⃣ Testing pitches -> users with different constraint names...');
  
  const constraintNames = [
    'pitches_veteran_id_fkey',
    'pitches_veteran_id_users_id_fkey',
    'pitches_veteran_id_fkey',
    'pitches_veteran_id_users_id_fkey'
  ];
  
  for (const constraintName of constraintNames) {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .select(`
          id,
          title,
          users!${constraintName}(id, name, email)
        `)
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${constraintName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${constraintName}: WORKING!`);
        console.log(`   📊 Sample data:`, JSON.stringify(data, null, 2));
        break; // Found the working one
      }
    } catch (err) {
      console.log(`   ❌ ${constraintName}: ${err.message}`);
    }
  }
  
  // Test 2: Check resume_requests -> users relationship
  console.log('\n2️⃣ Testing resume_requests -> users relationship...');
  
  const resumeConstraints = [
    'resume_requests_recruiter_id_fkey',
    'resume_requests_veteran_id_fkey',
    'resume_requests_recruiter_id_users_id_fkey',
    'resume_requests_veteran_id_users_id_fkey'
  ];
  
  for (const constraintName of resumeConstraints) {
    try {
      const { data, error } = await supabase
        .from('resume_requests')
        .select(`
          id,
          users!${constraintName}(id, name, email)
        `)
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${constraintName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${constraintName}: WORKING!`);
        break;
      }
    } catch (err) {
      console.log(`   ❌ ${constraintName}: ${err.message}`);
    }
  }
  
  // Test 3: Check if we can create a test record to see the actual constraints
  console.log('\n3️⃣ Testing constraint creation...');
  try {
    // First, let's see what the actual table structure looks like
    const { data, error } = await supabase
      .from('resume_requests')
      .select('*')
      .limit(0);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Table structure accessible');
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  console.log('\n=====================================');
  console.log('Foreign key check completed!');
}

checkForeignKeys();
