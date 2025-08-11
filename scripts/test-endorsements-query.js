const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testEndorsementsQuery() {
  console.log('🔍 Testing endorsements constraint names...\n');
  
  const constraintNames = [
    'endorsements_endorser_id_fkey',
    'endorsements_veteran_id_fkey',
    'endorsements_endorser_id_users_id_fkey',
    'endorsements_veteran_id_users_id_fkey'
  ];
  
  for (const constraintName of constraintNames) {
    try {
      const { data, error } = await supabase
        .from('endorsements')
        .select(`
          id,
          veteran_id,
          endorser_id,
          text,
          created_at,
          users!${constraintName}(name, role)
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

testEndorsementsQuery();
