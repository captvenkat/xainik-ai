const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPitchDataStructure() {
  console.log('🔍 Testing pitches data structure...\n');
  
  // First, let's see what tables exist and their structure
  console.log('1️⃣ Checking if pitches table has data...');
  try {
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('*')
      .limit(1);
    
    if (pitchesError) {
      console.log('   ❌ Error:', pitchesError.message);
    } else {
      console.log('   ✅ Pitches table accessible');
      if (pitches && pitches.length > 0) {
        console.log('   📊 Sample pitch:', pitches[0]);
      } else {
        console.log('   📊 Table is empty');
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Check users table
  console.log('\n2️⃣ Checking users table...');
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(1);
    
    if (usersError) {
      console.log('   ❌ Error:', usersError.message);
    } else {
      console.log('   ✅ Users table accessible');
      if (users && users.length > 0) {
        console.log('   📊 Sample user:', users[0]);
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test the actual join query
  console.log('\n3️⃣ Testing join query...');
  try {
    const { data, error } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        veteran_id,
        users!pitches_veteran_id_fkey(id, name, email)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Join query successful');
      console.log('   📊 Raw data:', JSON.stringify(data, null, 2));
      
      if (data && data.length > 0) {
        const item = data[0];
        console.log('   📊 Data structure:');
        console.log('     - id:', typeof item.id, item.id);
        console.log('     - title:', typeof item.title, item.title);
        console.log('     - veteran_id:', typeof item.veteran_id, item.veteran_id);
        console.log('     - users:', typeof item.users, item.users);
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
}

testPitchDataStructure();
