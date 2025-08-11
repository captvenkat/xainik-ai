const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testEndorsementsIndividual() {
  console.log('🔍 Testing endorsements constraints individually...\n');
  
  // Test endorser_id constraint
  console.log('1️⃣ Testing endorser_id constraint...');
  try {
    const { data, error } = await supabase
      .from('endorsements')
      .select(`
        id,
        users!endorsements_endorser_id_fkey(name, role)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ endorser_id constraint working');
      console.log('   📊 Data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test veteran_id constraint
  console.log('\n2️⃣ Testing veteran_id constraint...');
  try {
    const { data, error } = await supabase
      .from('endorsements')
      .select(`
        id,
        users!endorsements_veteran_id_fkey(name, role)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ veteran_id constraint working');
      console.log('   📊 Data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }
  
  // Test alternative constraint names
  console.log('\n3️⃣ Testing alternative constraint names...');
  const alternatives = [
    'endorsements_endorser_id_users_id_fkey',
    'endorsements_veteran_id_users_id_fkey'
  ];
  
  for (const constraint of alternatives) {
    try {
      const { data, error } = await supabase
        .from('endorsements')
        .select(`
          id,
          users!${constraint}(name, role)
        `)
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${constraint}: ${error.message}`);
      } else {
        console.log(`   ✅ ${constraint}: WORKING!`);
        console.log(`   📊 Data:`, JSON.stringify(data, null, 2));
        break;
      }
    } catch (err) {
      console.log(`   ❌ ${constraint}: ${err.message}`);
    }
  }
}

testEndorsementsIndividual();
