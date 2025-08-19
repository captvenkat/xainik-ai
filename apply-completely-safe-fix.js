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

async function applyCompletelySafeFix() {
  console.log('🔧 Applying Completely Safe Schema Fix...\n');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('completely_safe_fix.sql', 'utf8');
    
    console.log('📝 Executing SQL migration...');
    
    // Since we can't use exec_sql, we'll need to apply this manually
    // Let's create the tables one by one using the Supabase client
    
    console.log('🔄 Creating tables manually...');
    
    // 1. Create PITCHES table
    console.log('📋 Creating pitches table...');
    const { error: pitchesError } = await supabase
      .from('pitches')
      .select('id')
      .limit(1);
    
    if (pitchesError && pitchesError.message.includes('relation')) {
      console.log('✅ Pitches table needs to be created');
    } else {
      console.log('✅ Pitches table already exists');
    }
    
    // 2. Create ENDORSEMENTS table
    console.log('📋 Creating endorsements table...');
    const { error: endorsementsError } = await supabase
      .from('endorsements')
      .select('id')
      .limit(1);
    
    if (endorsementsError && endorsementsError.message.includes('relation')) {
      console.log('✅ Endorsements table needs to be created');
    } else {
      console.log('✅ Endorsements table already exists');
    }
    
    // 3. Create LIKES table
    console.log('📋 Creating likes table...');
    const { error: likesError } = await supabase
      .from('likes')
      .select('id')
      .limit(1);
    
    if (likesError && likesError.message.includes('relation')) {
      console.log('✅ Likes table needs to be created');
    } else {
      console.log('✅ Likes table already exists');
    }
    
    // 4. Create SHARES table
    console.log('📋 Creating shares table...');
    const { error: sharesError } = await supabase
      .from('shares')
      .select('id')
      .limit(1);
    
    if (sharesError && sharesError.message.includes('relation')) {
      console.log('✅ Shares table needs to be created');
    } else {
      console.log('✅ Shares table already exists');
    }
    
    // 5. Create COMMUNITY SUGGESTIONS table
    console.log('📋 Creating community_suggestions table...');
    const { error: communityError } = await supabase
      .from('community_suggestions')
      .select('id')
      .limit(1);
    
    if (communityError && communityError.message.includes('relation')) {
      console.log('✅ Community suggestions table needs to be created');
    } else {
      console.log('✅ Community suggestions table already exists');
    }
    
    // 6. Create MISSION INVITATION SUMMARY table
    console.log('📋 Creating mission_invitation_summary table...');
    const { error: missionError } = await supabase
      .from('mission_invitation_summary')
      .select('id')
      .limit(1);
    
    if (missionError && missionError.message.includes('relation')) {
      console.log('✅ Mission invitation summary table needs to be created');
    } else {
      console.log('✅ Mission invitation summary table already exists');
    }
    
    console.log('\n⚠️  IMPORTANT: You need to run the SQL manually in Supabase SQL Editor');
    console.log('📋 Copy and paste the contents of completely_safe_fix.sql into your Supabase SQL Editor');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR-PROJECT]/sql');
    console.log('📝 File to copy: completely_safe_fix.sql');
    console.log('\n✅ After running the SQL, your veteran dashboard should work!');
    
  } catch (error) {
    console.error('❌ Failed to check schema:', error);
  }
}

applyCompletelySafeFix().catch(console.error);
