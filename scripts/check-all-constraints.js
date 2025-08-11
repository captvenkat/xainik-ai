const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAllConstraints() {
  console.log('🔍 CHECKING ALL WORKING FOREIGN KEY CONSTRAINTS\n');
  console.log('================================================\n');
  
  // Test all possible constraint combinations
  const tests = [
    {
      name: 'resume_requests -> users (recruiter)',
      table: 'resume_requests',
      constraint: 'resume_requests_recruiter_id_fkey',
      select: 'id, users!resume_requests_recruiter_id_fkey(id, name, email)'
    },
    {
      name: 'resume_requests -> users (veteran)',
      table: 'resume_requests',
      constraint: 'resume_requests_veteran_id_fkey',
      select: 'id, users!resume_requests_veteran_id_fkey(id, name, email)'
    },
    {
      name: 'resume_requests -> pitches',
      table: 'resume_requests',
      constraint: 'resume_requests_pitch_id_fkey',
      select: 'id, pitches!resume_requests_pitch_id_fkey(id, title)'
    },
    {
      name: 'resume_requests -> recruiters',
      table: 'resume_requests',
      constraint: 'resume_requests_recruiter_id_fkey',
      select: 'id, recruiters!resume_requests_recruiter_id_fkey(user_id, company_name)'
    },
    {
      name: 'resume_requests -> veterans',
      table: 'resume_requests',
      constraint: 'resume_requests_veteran_id_fkey',
      select: 'id, veterans!resume_requests_veteran_id_fkey(user_id, rank, service_branch)'
    },
    {
      name: 'pitches -> users',
      table: 'pitches',
      constraint: 'pitches_veteran_id_fkey',
      select: 'id, title, users!pitches_veteran_id_fkey(id, name, email)'
    },
    {
      name: 'pitches -> veterans',
      table: 'pitches',
      constraint: 'pitches_veteran_id_fkey',
      select: 'id, title, veterans!pitches_veteran_id_fkey(user_id, rank, service_branch)'
    }
  ];
  
  for (const test of tests) {
    try {
      const { data, error } = await supabase
        .from(test.table)
        .select(test.select)
        .limit(1);
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: WORKING!`);
      }
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
    }
  }
  
  console.log('\n================================================');
  console.log('All constraint checks completed!');
}

checkAllConstraints();
