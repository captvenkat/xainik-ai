const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSampleImpactData() {
  try {
    console.log('📊 Adding sample impact analytics data...')
    
    // First, get a sample pitch and user
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id, user_id')
      .limit(1)
    
    if (!pitches || pitches.length === 0) {
      console.log('❌ No pitches found. Please create a pitch first.')
      return
    }
    
    const pitchId = pitches[0].id
    const userId = pitches[0].user_id
    
    console.log(`📝 Using pitch ID: ${pitchId}`)
    
    // Get or create a supporter user
    const { data: supporters } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'supporter')
      .limit(1)
    
    let supporterId
    if (!supporters || supporters.length === 0) {
      console.log('📝 Creating sample supporter...')
      const { data: newSupporter } = await supabase
        .from('users')
        .insert({
          name: 'Sample Supporter',
          email: 'supporter@example.com',
          role: 'supporter'
        })
        .select('id')
        .single()
      
      supporterId = newSupporter.id
    } else {
      supporterId = supporters[0].id
    }
    
    console.log(`👤 Using supporter ID: ${supporterId}`)
    
    // Add sample impact calls
    console.log('📞 Adding sample impact calls...')
    const sampleCalls = [
      {
        pitch_id: pitchId,
        supporter_id: supporterId,
        call_date: new Date().toISOString(),
        outcome: 'interested',
        notes: 'Veteran showed strong technical skills'
      },
      {
        pitch_id: pitchId,
        supporter_id: supporterId,
        call_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        outcome: 'follow_up',
        notes: 'Scheduled follow-up call for next week'
      }
    ]
    
    await supabase
      .from('impact_calls')
      .insert(sampleCalls)
    
    // Add sample impact outcomes
    console.log('🎯 Adding sample impact outcomes...')
    const sampleOutcomes = [
      {
        pitch_id: pitchId,
        supporter_id: supporterId,
        outcome_type: 'interview',
        outcome_date: new Date().toISOString(),
        value_usd: 5000,
        notes: 'Technical interview scheduled'
      },
      {
        pitch_id: pitchId,
        supporter_id: supporterId,
        outcome_type: 'job_offer',
        outcome_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        value_usd: 75000,
        notes: 'Software Engineer position offered'
      }
    ]
    
    await supabase
      .from('impact_outcomes')
      .insert(sampleOutcomes)
    
    // Add sample impact keywords
    console.log('🔑 Adding sample impact keywords...')
    const sampleKeywords = [
      {
        pitch_id: pitchId,
        keyword: 'React',
        confidence_score: 0.85,
        suggested_at: new Date().toISOString()
      },
      {
        pitch_id: pitchId,
        keyword: 'TypeScript',
        confidence_score: 0.78,
        suggested_at: new Date().toISOString()
      },
      {
        pitch_id: pitchId,
        keyword: 'Full Stack',
        confidence_score: 0.92,
        suggested_at: new Date().toISOString()
      }
    ]
    
    await supabase
      .from('impact_keywords')
      .insert(sampleKeywords)
    
    // Add sample impact nudges
    console.log('💡 Adding sample impact nudges...')
    const sampleNudges = [
      {
        pitch_id: pitchId,
        nudge_type: 'follow_up',
        title: 'Follow up with interested contacts',
        description: 'You have 3 contacts who showed interest. Consider reaching out to schedule calls.',
        priority: 'high',
        created_at: new Date().toISOString()
      },
      {
        pitch_id: pitchId,
        nudge_type: 'optimize',
        title: 'Optimize your pitch with keywords',
        description: 'Add "React" and "TypeScript" to your pitch to improve visibility.',
        priority: 'medium',
        created_at: new Date().toISOString()
      }
    ]
    
    await supabase
      .from('impact_nudges')
      .insert(sampleNudges)
    
    console.log('✅ Sample impact data added successfully!')
    console.log('')
    console.log('📊 Sample data includes:')
    console.log('- 2 impact calls (interested, follow_up)')
    console.log('- 2 impact outcomes (interview, job_offer)')
    console.log('- 3 suggested keywords (React, TypeScript, Full Stack)')
    console.log('- 2 AI nudges (follow_up, optimize)')
    console.log('')
    console.log('🌐 Now visit: http://localhost:3003/dashboard/veteran/impact')
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error)
  }
}

addSampleImpactData()
