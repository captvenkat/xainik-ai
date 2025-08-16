const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAvailabilityConstraint() {
  console.log('🔍 Checking availability constraint on pitches table...\n')

  try {
    // Try a direct query to see what values are accepted
    console.log('🧪 Testing different availability values...\n')
      
      const testValues = [
        'Immediate',
        '30 days', 
        '60 days',
        '90 days',
        'immediate',
        '30 Days',
        '60 Days',
        '90 Days'
      ]

      for (const value of testValues) {
        try {
          const { error } = await supabase
            .from('pitches')
            .insert({
              user_id: '4c5a525f-77d7-4350-b4e3-eb6459abecdc',
              title: `Test - ${value}`,
              pitch_text: 'Test pitch',
              skills: ['test'],
              job_type: 'full-time',
              availability: value,
              location: 'Test Location',
              is_active: true
            })

          if (error) {
            console.log(`❌ "${value}" - ${error.message}`)
          } else {
            console.log(`✅ "${value}" - ACCEPTED`)
            // Clean up the test record
            await supabase
              .from('pitches')
              .delete()
              .eq('title', `Test - ${value}`)
          }
        } catch (err) {
          console.log(`❌ "${value}" - ${err.message}`)
        }
      }
    for (const value of testValues) {
      try {
        const { error } = await supabase
          .from('pitches')
          .insert({
            user_id: '4c5a525f-77d7-4350-b4e3-eb6459abecdc',
            title: `Test - ${value}`,
            pitch_text: 'Test pitch',
            skills: ['test'],
            job_type: 'full-time',
            availability: value,
            location: 'Test Location',
            is_active: true
          })

        if (error) {
          console.log(`❌ "${value}" - ${error.message}`)
        } else {
          console.log(`✅ "${value}" - ACCEPTED`)
          // Clean up the test record
          await supabase
            .from('pitches')
            .delete()
            .eq('title', `Test - ${value}`)
        }
      } catch (err) {
        console.log(`❌ "${value}" - ${err.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkAvailabilityConstraint()
