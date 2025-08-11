const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkExactColumns() {
  console.log('🔍 Checking EXACT column names...\n');
  
  const tables = ['users', 'resume_requests', 'notifications', 'recruiter_notes', 'recruiter_saved_filters'];
  
  for (const table of tables) {
    try {
      // Get table info from information_schema
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table)
        .order('ordinal_position');
      
      if (colError) {
        console.log(`❌ ${table}: ${colError.message}`);
      } else {
        console.log(`✅ ${table}:`);
        columns.forEach(col => {
          console.log(`   ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
        });
        console.log('');
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

checkExactColumns();
