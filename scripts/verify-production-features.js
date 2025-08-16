// =====================================================
// PRODUCTION FEATURES VERIFICATION SCRIPT
// Run this to check if new features are working
// =====================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyProductionFeatures() {
  console.log('🔍 Verifying Production Features...')
  console.log('=====================================')

  try {
    // 1. Check Community Suggestions
    console.log('\n📋 1. Checking Community Suggestions...')
    try {
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('community_suggestions')
        .select('*')
        .limit(1)
      
      if (suggestionsError) {
        console.log('   ❌ Community Suggestions Table Error:', suggestionsError.message)
      } else {
        console.log('   ✅ Community Suggestions Table: Working')
        console.log('   📊 Total suggestions:', suggestions?.length || 0)
      }
    } catch (error) {
      console.log('   ❌ Community Suggestions Error:', error.message)
    }

    // 2. Check Mission Invitations
    console.log('\n📋 2. Checking Mission Invitations...')
    try {
      const { data: invitations, error: invitationsError } = await supabase
        .from('mission_invitations')
        .select('*')
        .limit(1)
      
      if (invitationsError) {
        console.log('   ❌ Mission Invitations Table Error:', invitationsError.message)
      } else {
        console.log('   ✅ Mission Invitations Table: Working')
        console.log('   📊 Total invitations:', invitations?.length || 0)
      }
    } catch (error) {
      console.log('   ❌ Mission Invitations Error:', error.message)
    }

    // 3. Check Functions
    console.log('\n📋 3. Checking Database Functions...')
    try {
      // Test community suggestions function
      const { data: voteTest, error: voteError } = await supabase.rpc('vote_on_suggestion', {
        p_suggestion_id: '00000000-0000-0000-0000-000000000000',
        p_vote_type: 'upvote'
      })
      
      if (voteError) {
        console.log('   ❌ vote_on_suggestion Function Error:', voteError.message)
      } else {
        console.log('   ✅ vote_on_suggestion Function: Working')
      }
    } catch (error) {
      console.log('   ❌ Function Test Error:', error.message)
    }

    // 4. Check Views
    console.log('\n📋 4. Checking Database Views...')
    try {
      const { data: summary, error: summaryError } = await supabase
        .from('community_suggestions_summary')
        .select('*')
      
      if (summaryError) {
        console.log('   ❌ Community Suggestions Summary View Error:', summaryError.message)
      } else {
        console.log('   ✅ Community Suggestions Summary View: Working')
        console.log('   📊 Summary data:', summary?.[0] || 'No data')
      }
    } catch (error) {
      console.log('   ❌ View Test Error:', error.message)
    }

    // 5. Check RLS Policies
    console.log('\n📋 5. Checking RLS Policies...')
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_name', 'community_suggestions')
      
      if (policiesError) {
        console.log('   ❌ RLS Policies Check Error:', policiesError.message)
      } else {
        console.log('   ✅ RLS Policies: Found', policies?.length || 0, 'policies')
      }
    } catch (error) {
      console.log('   ❌ RLS Check Error:', error.message)
    }

    console.log('\n=====================================')
    console.log('🎯 VERIFICATION COMPLETE!')
    console.log('\nIf you see any ❌ errors above, the features won\'t work.')
    console.log('If you see all ✅ checks, the database is ready.')
    console.log('\nNext: Check if Vercel has deployed the latest code.')

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

verifyProductionFeatures()
