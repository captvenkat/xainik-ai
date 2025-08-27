require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkReferralsStructure() {
  console.log('🔍 Checking Referrals Table Structure...\n')

  try {
    // Check referrals table structure
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*')
      .limit(1)

    if (error) {
      console.log(`❌ Error accessing referrals: ${error.message}`)
    } else if (referrals && referrals.length > 0) {
      const referral = referrals[0]
      console.log('✅ Referrals table accessible')
      console.log('📊 Referral columns found:')
      Object.keys(referral).forEach(key => {
        console.log(`   • ${key}: ${typeof referral[key]}`)
      })
    } else {
      console.log('⚠️ Referrals table exists but no data')
      
      // Try to get column info from a sample insert
      console.log('\n🔧 Testing referrals table with sample data...')
      const { data: testInsert, error: insertError } = await supabase
        .from('referrals')
        .insert({
          supporter_id: '550e8400-e29b-41d4-a716-446655440001',
          pitch_id: '550e8400-e29b-41d4-a716-446655440002',
          share_link: 'test-link',
          platform: 'test'
        })
        .select()

      if (insertError) {
        console.log(`❌ Insert error: ${insertError.message}`)
      } else {
        console.log('✅ Sample insert successful')
        console.log('📊 Inserted data:', testInsert[0])
        
        // Clean up test data
        await supabase
          .from('referrals')
          .delete()
          .eq('share_link', 'test-link')
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkReferralsStructure()
