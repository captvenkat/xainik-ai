const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deepDatabaseCheck() {
  console.log('🔍 DEEP DATABASE RELATIONSHIP CHECK\n');
  console.log('=====================================\n');
  
  // Test 1: Check if pitches table has veteran_id
  console.log('1️⃣ Testing pitches -> users relationship...');
  try {
    const { data, error } = await supabase
      .from('pitches')
      .select('id, veteran_id')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ pitches table accessible');
      if (data && data.length > 0) {
        console.log('   📊 Sample data:', data[0]);
      } else {
        console.log('   📊 Table is empty');
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 2: Check if users table has the right columns
  console.log('\n2️⃣ Testing users table structure...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ users table accessible');
      if (data && data.length > 0) {
        console.log('   📊 Sample data:', data[0]);
      } else {
        console.log('   📊 Table is empty');
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 3: Check the actual foreign key relationship
  console.log('\n3️⃣ Testing foreign key relationship...');
  try {
    const { data, error } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        users!pitches_veteran_id_fkey(id, name, email)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Foreign key relationship working');
      console.log('   📊 Sample data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 4: Check resume_requests table structure
  console.log('\n4️⃣ Testing resume_requests table...');
  try {
    const { data, error } = await supabase
      .from('resume_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ resume_requests table accessible');
      if (data && data.length > 0) {
        console.log('   📊 Sample data:', data[0]);
      } else {
        console.log('   📊 Table is empty');
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 5: Check notifications table structure
  console.log('\n5️⃣ Testing notifications table...');
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ notifications table accessible');
      if (data && data.length > 0) {
        console.log('   📊 Sample data:', data[0]);
      } else {
        console.log('   📊 Table is empty');
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 6: Check if we can actually query with joins
  console.log('\n6️⃣ Testing complex join queries...');
  try {
    const { data, error } = await supabase
      .from('resume_requests')
      .select(`
        id,
        recruiter_id,
        veteran_id,
        pitch_id,
        status,
        created_at
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Basic resume_requests query working');
      if (data && data.length > 0) {
        console.log('   📊 Sample data:', data[0]);
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test 7: Check what tables actually exist
  console.log('\n7️⃣ Checking all available tables...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ users table exists');
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  console.log('\n=====================================');
  console.log('Deep check completed!');
}

deepDatabaseCheck();
