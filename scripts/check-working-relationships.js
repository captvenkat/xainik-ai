const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkWorkingRelationships() {
  console.log('🔍 CHECKING WORKING RELATIONSHIPS & DATA STRUCTURE\n');
  console.log('==================================================\n');
  
  // Test 1: Check the working resume_requests -> users relationship
  console.log('1️⃣ Testing resume_requests -> users (recruiter)...');
  try {
    const { data, error } = await supabase
      .from('resume_requests')
      .select(`
        id,
        recruiter_id,
        veteran_id,
        pitch_id,
        status,
        created_at,
        users!resume_requests_recruiter_id_fkey(id, name, email, role)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Query successful!');
      console.log('   📊 Data structure:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 2: Check the working resume_requests -> users (veteran) relationship
  console.log('\n2️⃣ Testing resume_requests -> users (veteran)...');
  try {
    const { data, error } = await supabase
      .from('resume_requests')
      .select(`
        id,
        users!resume_requests_veteran_id_fkey(id, name, email, role)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Query successful!');
      console.log('   📊 Data structure:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 3: Check the working resume_requests -> pitches relationship
  console.log('\n3️⃣ Testing resume_requests -> pitches...');
  try {
    const { data, error } = await supabase
      .from('resume_requests')
      .select(`
        id,
        pitches!resume_requests_pitch_id_fkey(id, title)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Query successful!');
      console.log('   📊 Data structure:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 4: Check the working pitches -> users relationship
  console.log('\n4️⃣ Testing pitches -> users...');
  try {
    const { data, error } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        veteran_id,
        users!pitches_veteran_id_fkey(id, name, email, role)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Query successful!');
      console.log('   📊 Data structure:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  console.log('\n==================================================');
  console.log('Working relationships check completed!');
}

checkWorkingRelationships();
