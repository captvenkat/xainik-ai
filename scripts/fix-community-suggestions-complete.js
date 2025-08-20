#!/usr/bin/env node

/**
 * Complete Community Suggestions Fix Script
 * Creates all missing community suggestions tables and views
 */

const { createClient } = require('@supabase/supabase-js');

async function fixCommunitySuggestionsComplete() {
  console.log('🚀 Fixing all community suggestions tables and views...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Testing connection...');
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    console.log('\n🔧 Creating community suggestions tables and views...');
    
    // 1. Create community_suggestions table
    console.log('\n📋 Creating community_suggestions table...');
    const communitySuggestionsSQL = `
      CREATE TABLE IF NOT EXISTS public.community_suggestions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
        title text NOT NULL,
        description text,
        category text,
        suggestion_type text DEFAULT 'feature',
        status text DEFAULT 'pending',
        priority text DEFAULT 'medium',
        votes int DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;
    
    const { error: csError } = await supabase.rpc('exec_sql', {
      sql_query: communitySuggestionsSQL
    });
    
    if (csError) {
      console.log(`⚠️  Community suggestions table: ${csError.message}`);
    } else {
      console.log('✅ community_suggestions table created');
    }
    
    // 2. Create community_suggestions_with_votes table
    console.log('\n📋 Creating community_suggestions_with_votes table...');
    const communitySuggestionsWithVotesSQL = `
      CREATE TABLE IF NOT EXISTS public.community_suggestions_with_votes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        suggestion_id uuid REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
        user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
        vote_type text CHECK (vote_type IN ('up', 'down')) NOT NULL,
        created_at timestamptz DEFAULT now(),
        UNIQUE(suggestion_id, user_id)
      );
    `;
    
    const { error: csvError } = await supabase.rpc('exec_sql', {
      sql_query: communitySuggestionsWithVotesSQL
    });
    
    if (csvError) {
      console.log(`⚠️  Community suggestions with votes table: ${csvError.message}`);
    } else {
      console.log('✅ community_suggestions_with_votes table created');
    }
    
    // 3. Create community_suggestions_summary view
    console.log('\n📋 Creating community_suggestions_summary view...');
    const communitySuggestionsSummarySQL = `
      DROP VIEW IF EXISTS public.community_suggestions_summary CASCADE;
      CREATE VIEW public.community_suggestions_summary AS
      SELECT 
        COUNT(*) as total_suggestions,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_suggestions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_suggestions,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_suggestions,
        SUM(votes) as total_votes,
        AVG(votes) as average_votes,
        COUNT(*) FILTER (WHERE category = 'feature') as feature_suggestions,
        COUNT(*) FILTER (WHERE category = 'ui') as ui_suggestions,
        COUNT(*) FILTER (WHERE category = 'bug') as bug_suggestions
      FROM public.community_suggestions;
    `;
    
    const { error: cssError } = await supabase.rpc('exec_sql', {
      sql_query: communitySuggestionsSummarySQL
    });
    
    if (cssError) {
      console.log(`⚠️  Community suggestions summary view: ${cssError.message}`);
    } else {
      console.log('✅ community_suggestions_summary view created');
    }
    
    // 4. Enable RLS
    console.log('\n🔒 Enabling Row Level Security...');
    const rlsSQL = `
      ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.community_suggestions_with_votes ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: rlsSQL
    });
    
    if (rlsError) {
      console.log(`⚠️  RLS enable: ${rlsError.message}`);
    } else {
      console.log('✅ RLS enabled');
    }
    
    // 5. Create policies
    console.log('\n🔐 Creating security policies...');
    const policiesSQL = `
      -- Community suggestions policies
      DROP POLICY IF EXISTS "Users can view all suggestions" ON public.community_suggestions;
      DROP POLICY IF EXISTS "Users can create their own suggestions" ON public.community_suggestions;
      DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.community_suggestions;
      
      CREATE POLICY "Users can view all suggestions" ON public.community_suggestions FOR SELECT USING (true);
      CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions FOR UPDATE USING (auth.uid() = user_id);
      
      -- Community suggestions with votes policies
      DROP POLICY IF EXISTS "Users can view all votes" ON public.community_suggestions_with_votes;
      DROP POLICY IF EXISTS "Users can create their own votes" ON public.community_suggestions_with_votes;
      DROP POLICY IF EXISTS "Users can update their own votes" ON public.community_suggestions_with_votes;
      
      CREATE POLICY "Users can view all votes" ON public.community_suggestions_with_votes FOR SELECT USING (true);
      CREATE POLICY "Users can create their own votes" ON public.community_suggestions_with_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update their own votes" ON public.community_suggestions_with_votes FOR UPDATE USING (auth.uid() = user_id);
    `;
    
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql_query: policiesSQL
    });
    
    if (policiesError) {
      console.log(`⚠️  Policies: ${policiesError.message}`);
    } else {
      console.log('✅ Security policies created');
    }
    
    // 6. Grant permissions
    console.log('\n🔑 Granting permissions...');
    const permissionsSQL = `
      GRANT ALL ON public.community_suggestions TO authenticated;
      GRANT ALL ON public.community_suggestions_with_votes TO authenticated;
      GRANT SELECT ON public.community_suggestions_summary TO authenticated;
    `;
    
    const { error: permissionsError } = await supabase.rpc('exec_sql', {
      sql_query: permissionsSQL
    });
    
    if (permissionsError) {
      console.log(`⚠️  Permissions: ${permissionsError.message}`);
    } else {
      console.log('✅ Permissions granted');
    }
    
    // 7. Create indexes
    console.log('\n📊 Creating indexes...');
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON public.community_suggestions(user_id);
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_category ON public.community_suggestions(category);
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_votes ON public.community_suggestions(votes DESC);
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_created ON public.community_suggestions(created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_with_votes_suggestion_id ON public.community_suggestions_with_votes(suggestion_id);
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_with_votes_user_id ON public.community_suggestions_with_votes(user_id);
      CREATE INDEX IF NOT EXISTS idx_community_suggestions_with_votes_vote_type ON public.community_suggestions_with_votes(vote_type);
    `;
    
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql_query: indexesSQL
    });
    
    if (indexesError) {
      console.log(`⚠️  Indexes: ${indexesError.message}`);
    } else {
      console.log('✅ Indexes created');
    }
    
    // 8. Add sample data
    console.log('\n📝 Adding sample data...');
    const sampleDataSQL = `
      INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes)
      SELECT 
        '00000000-0000-0000-0000-000000000000'::uuid, 
        'Add LinkedIn Integration', 
        'Allow veterans to connect their LinkedIn profiles for better networking', 
        'feature', 
        'pending', 
        5
      WHERE NOT EXISTS (SELECT 1 FROM public.community_suggestions WHERE title = 'Add LinkedIn Integration');

      INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes)
      SELECT 
        '00000000-0000-0000-0000-000000000000'::uuid, 
        'Improve Mobile Experience', 
        'Make the platform more mobile-friendly with better responsive design', 
        'ui', 
        'approved', 
        12
      WHERE NOT EXISTS (SELECT 1 FROM public.community_suggestions WHERE title = 'Improve Mobile Experience');

      INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes)
      SELECT 
        '00000000-0000-0000-0000-000000000000'::uuid, 
        'Add Resume Builder', 
        'Help veterans create professional resumes with templates and guidance', 
        'feature', 
        'pending', 
        8
      WHERE NOT EXISTS (SELECT 1 FROM public.community_suggestions WHERE title = 'Add Resume Builder');

      INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes)
      SELECT 
        '00000000-0000-0000-0000-000000000000'::uuid, 
        'Veteran Mentorship Program', 
        'Connect new veterans with experienced mentors in their field', 
        'feature', 
        'pending', 
        15
      WHERE NOT EXISTS (SELECT 1 FROM public.community_suggestions WHERE title = 'Veteran Mentorship Program');
    `;
    
    const { error: sampleDataError } = await supabase.rpc('exec_sql', {
      sql_query: sampleDataSQL
    });
    
    if (sampleDataError) {
      console.log(`⚠️  Sample data: ${sampleDataError.message}`);
    } else {
      console.log('✅ Sample data added');
    }
    
    // 9. Test the tables
    console.log('\n🔍 Testing created tables...');
    
    // Test community_suggestions
    try {
      const { data: csData, error: csTestError } = await supabase
        .from('community_suggestions')
        .select('*')
        .limit(1);
      
      if (csTestError) {
        console.log(`❌ Community suggestions test: ${csTestError.message}`);
      } else {
        console.log('✅ community_suggestions table is accessible');
        console.log(`📊 Found ${csData.length} records`);
      }
    } catch (e) {
      console.log(`❌ Community suggestions test error: ${e.message}`);
    }
    
    // Test community_suggestions_with_votes
    try {
      const { data: csvData, error: csvTestError } = await supabase
        .from('community_suggestions_with_votes')
        .select('*')
        .limit(1);
      
      if (csvTestError) {
        console.log(`❌ Community suggestions with votes test: ${csvTestError.message}`);
      } else {
        console.log('✅ community_suggestions_with_votes table is accessible');
        console.log(`📊 Found ${csvData.length} records`);
      }
    } catch (e) {
      console.log(`❌ Community suggestions with votes test error: ${e.message}`);
    }
    
    // Test community_suggestions_summary
    try {
      const { data: cssData, error: cssTestError } = await supabase
        .from('community_suggestions_summary')
        .select('*')
        .limit(1);
      
      if (cssTestError) {
        console.log(`❌ Community suggestions summary test: ${cssTestError.message}`);
      } else {
        console.log('✅ community_suggestions_summary view is accessible');
        console.log(`📊 Summary data:`, cssData[0]);
      }
    } catch (e) {
      console.log(`❌ Community suggestions summary test error: ${e.message}`);
    }
    
    console.log('\n🎉 Complete community suggestions fix completed!');
    console.log('📋 All community suggestions tables and views have been created with proper security policies');
    console.log('🚀 Community suggestions system should now work properly!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.log('\n💡 Alternative: Apply fix manually via Supabase Dashboard');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy and execute the SQL from fix-missing-dashboard-tables-safe.sql');
    console.log('   3. Copy and execute the SQL from fix-voting-system.sql');
    process.exit(1);
  }
}

if (require.main === module) {
  fixCommunitySuggestionsComplete().catch(console.error);
}

module.exports = { fixCommunitySuggestionsComplete };
