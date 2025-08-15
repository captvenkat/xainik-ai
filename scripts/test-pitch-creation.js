const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPitchCreation() {
  console.log('🧪 Testing Pitch Creation...\n')

  try {
    // Test 1: Check if we can access pitches table
    console.log('📋 Test 1: Checking pitches table access...')
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('*')
      .limit(1)

    if (pitchesError) {
      console.error('❌ Error accessing pitches table:', pitchesError)
      return
    }
    console.log('✅ Pitches table accessible')

    // Test 2: Try to create a minimal pitch
    console.log('\n📋 Test 2: Testing minimal pitch creation...')
    const testPitchData = {
      user_id: '4c5a525f-77d7-4350-b4e3-eb6459abecdc', // Use the user ID from the error
      title: 'Test Pitch',
      pitch_text: 'This is a test pitch',
      skills: ['test-skill-1', 'test-skill-2', 'test-skill-3'],
      job_type: 'full-time',
      availability: 'Immediate',
      location: 'Test Location', // Add location field
      is_active: true
    }

    const { data: newPitch, error: createError } = await supabase
      .from('pitches')
      .insert(testPitchData)
      .select()

    if (createError) {
      console.error('❌ Error creating pitch:', createError)
      
      // Test 3: Check what fields are actually available
      console.log('\n📋 Test 3: Checking pitches table structure...')
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'pitches')
        .eq('table_schema', 'public')
        .order('ordinal_position')

      if (columnsError) {
        console.error('❌ Error fetching columns:', columnsError)
      } else {
        console.log('📝 Available pitches table columns:')
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
        })
      }
      
      return
    }

    console.log('✅ Pitch created successfully:', newPitch)

    // Test 4: Clean up - delete the test pitch
    console.log('\n📋 Test 4: Cleaning up test pitch...')
    const { error: deleteError } = await supabase
      .from('pitches')
      .delete()
      .eq('id', newPitch[0].id)

    if (deleteError) {
      console.error('⚠️  Error deleting test pitch:', deleteError)
    } else {
      console.log('✅ Test pitch deleted successfully')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testPitchCreation()
