const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLikePitchQuery() {
  console.log('🔍 Testing likePitch query constraint names...\n');
  
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
          likes_count,
          veteran_id,
          users!${constraintName}(name)
        `)
        .limit(1);
      
      if (error) {
        console.log(`❌ ${constraintName}: ${error.message}`);
      } else {
        console.log(`✅ ${constraintName}: WORKING!`);
        console.log(`📊 Data structure:`, JSON.stringify(data, null, 2));
        break;
      }
    } catch (err) {
      console.log(`❌ ${constraintName}: ${err.message}`);
    }
  }
}

testLikePitchQuery();
