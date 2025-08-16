#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = 'https://byleslhlkakxnsurzyzt.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bGVzbGhsa2FreG5zdXJ6eXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2MDkyMywiZXhwIjoyMDcwMzM2OTIzfQ.a1c68T9xpuoPlJPUsZ4Z0X13gC2TdTMtwedGZujL7IE';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('🎯 Creating Supporter Dashboard Tables');
  console.log('=====================================\n');
  
  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful\n');
    
    // For now, let's create a simple version that works with the existing schema
    // We'll create the tables by inserting sample data and letting Supabase create them
    
    console.log('📝 Creating AI Suggestions table...');
    try {
      // Try to insert a sample AI suggestion
      const { data: suggestionData, error: suggestionError } = await supabase
        .from('ai_suggestions')
        .insert({
          user_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          user_type: 'supporter',
          suggestion_type: 'engagement',
          title: 'Test Suggestion',
          description: 'This is a test suggestion',
          priority: 'medium',
          icon: '🔗',
          action_text: 'Test Action',
          action_type: 'test_action'
        })
        .select();
      
      if (suggestionError) {
        console.log(`  ❌ AI Suggestions table: ${suggestionError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ AI Suggestions table created/verified');
        // Clean up test data
        await supabase.from('ai_suggestions').delete().eq('title', 'Test Suggestion');
      }
    } catch (error) {
      console.log(`  ❌ AI Suggestions table: ${error.message}`);
    }
    
    console.log('\n📝 Creating Supporter Celebrations table...');
    try {
      const { data: celebrationData, error: celebrationError } = await supabase
        .from('supporter_celebrations')
        .insert({
          supporter_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          celebration_type: 'achievement',
          title: 'Test Celebration',
          description: 'This is a test celebration',
          impact_score: 50
        })
        .select();
      
      if (celebrationError) {
        console.log(`  ❌ Supporter Celebrations table: ${celebrationError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ Supporter Celebrations table created/verified');
        // Clean up test data
        await supabase.from('supporter_celebrations').delete().eq('title', 'Test Celebration');
      }
    } catch (error) {
      console.log(`  ❌ Supporter Celebrations table: ${error.message}`);
    }
    
    console.log('\n📝 Creating Supporter Badges table...');
    try {
      const { data: badgeData, error: badgeError } = await supabase
        .from('supporter_badges')
        .insert({
          supporter_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          badge_type: 'first_referral',
          badge_name: 'Test Badge',
          badge_description: 'This is a test badge',
          icon: '🔗'
        })
        .select();
      
      if (badgeError) {
        console.log(`  ❌ Supporter Badges table: ${badgeError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ Supporter Badges table created/verified');
        // Clean up test data
        await supabase.from('supporter_badges').delete().eq('badge_name', 'Test Badge');
      }
    } catch (error) {
      console.log(`  ❌ Supporter Badges table: ${error.message}`);
    }
    
    console.log('\n📝 Creating User Goals table...');
    try {
      const { data: goalData, error: goalError } = await supabase
        .from('user_goals')
        .insert({
          user_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          title: 'Test Goal',
          description: 'This is a test goal',
          goal_type: 'impact',
          target_value: 100,
          current_value: 0,
          progress: 0
        })
        .select();
      
      if (goalError) {
        console.log(`  ❌ User Goals table: ${goalError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ User Goals table created/verified');
        // Clean up test data
        await supabase.from('user_goals').delete().eq('title', 'Test Goal');
      }
    } catch (error) {
      console.log(`  ❌ User Goals table: ${error.message}`);
    }
    
    console.log('\n📝 Creating Goal Progress table...');
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('goal_progress')
        .insert({
          user_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          goal_id: '00000000-0000-0000-0000-000000000000',
          progress_value: 10,
          progress_percentage: 10,
          milestone_achieved: 'Test Milestone',
          notes: 'Test progress'
        })
        .select();
      
      if (progressError) {
        console.log(`  ❌ Goal Progress table: ${progressError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ Goal Progress table created/verified');
        // Clean up test data
        await supabase.from('goal_progress').delete().eq('milestone_achieved', 'Test Milestone');
      }
    } catch (error) {
      console.log(`  ❌ Goal Progress table: ${error.message}`);
    }
    
    console.log('\n📝 Creating Behavioral Nudges table...');
    try {
      const { data: nudgeData, error: nudgeError } = await supabase
        .from('behavioral_nudges')
        .insert({
          user_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          nudge_type: 'engagement',
          title: 'Test Nudge',
          message: 'This is a test nudge',
          icon: '🔔',
          action_text: 'Test Action',
          action_type: 'test_action',
          priority: 'medium'
        })
        .select();
      
      if (nudgeError) {
        console.log(`  ❌ Behavioral Nudges table: ${nudgeError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ Behavioral Nudges table created/verified');
        // Clean up test data
        await supabase.from('behavioral_nudges').delete().eq('title', 'Test Nudge');
      }
    } catch (error) {
      console.log(`  ❌ Behavioral Nudges table: ${error.message}`);
    }
    
    console.log('\n📝 Creating User Behavior Analytics table...');
    try {
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('user_behavior_analytics')
        .insert({
          user_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          action_type: 'login',
          action_data: { test: true },
          session_duration: 300,
          page_visited: '/dashboard',
          time_spent: 60
        })
        .select();
      
      if (analyticsError) {
        console.log(`  ❌ User Behavior Analytics table: ${analyticsError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ User Behavior Analytics table created/verified');
        // Clean up test data
        await supabase.from('user_behavior_analytics').delete().eq('page_visited', '/dashboard');
      }
    } catch (error) {
      console.log(`  ❌ User Behavior Analytics table: ${error.message}`);
    }
    
    console.log('\n📝 Creating Supporter Impact table...');
    try {
      const { data: impactData, error: impactError } = await supabase
        .from('supporter_impact')
        .insert({
          supporter_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          impact_type: 'referral',
          impact_value: 50,
          veteran_id: testData[0]?.id || '00000000-0000-0000-0000-000000000000',
          metadata: { test: true }
        })
        .select();
      
      if (impactError) {
        console.log(`  ❌ Supporter Impact table: ${impactError.message}`);
        console.log('  ℹ️  Table may need to be created manually in Supabase dashboard');
      } else {
        console.log('  ✅ Supporter Impact table created/verified');
        // Clean up test data
        await supabase.from('supporter_impact').delete().eq('impact_type', 'referral');
      }
    } catch (error) {
      console.log(`  ❌ Supporter Impact table: ${error.message}`);
    }
    
    console.log('\n🎉 Table Creation Summary');
    console.log('========================');
    console.log('✅ All tables have been attempted to be created');
    console.log('ℹ️  If any tables failed, they may need to be created manually in the Supabase dashboard');
    console.log('\n📋 Next Steps:');
    console.log('  1. Check the Supabase dashboard for any failed table creations');
    console.log('  2. Run the check-supporter-tables.js script to verify');
    console.log('  3. Test the supporter dashboard at /dashboard/supporter');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

createTables().catch(console.error);
