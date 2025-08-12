const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function checkConstraints() {
  console.log('🔍 Checking Database Constraints...')
  console.log('=====================================')
  
  try {
    // Check foreign key constraints for the veterans table
    console.log('\n🔗 Checking veterans table constraints...')
    
    const { data: constraints, error } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'veterans')
      .eq('constraint_type', 'FOREIGN KEY')
    
    if (error) {
      console.log(`❌ Error checking constraints: ${error.message}`)
    } else {
      console.log(`✅ Found ${constraints?.length || 0} foreign key constraints on veterans table`)
      constraints?.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}`)
      })
    }
    
    // Check the actual constraint details
    console.log('\n📋 Checking constraint details...')
    
    // Try to get the actual foreign key information
    const { data: keyColumns, error: keyError } = await supabase
      .from('information_schema.key_column_usage')
      .select('*')
      .eq('table_name', 'veterans')
    
    if (keyError) {
      console.log(`❌ Error checking key columns: ${keyError.message}`)
    } else {
      console.log(`✅ Found ${keyColumns?.length || 0} key columns on veterans table`)
      keyColumns?.forEach(key => {
        console.log(`   - Column: ${key.column_name}, Constraint: ${key.constraint_name}`)
      })
    }
    
    // Check the referenced columns
    const { data: refColumns, error: refError } = await supabase
      .from('information_schema.constraint_column_usage')
      .select('*')
      .eq('table_name', 'users')
    
    if (refError) {
      console.log(`❌ Error checking referenced columns: ${refError.message}`)
    } else {
      console.log(`✅ Found ${refColumns?.length || 0} referenced columns on users table`)
      refColumns?.forEach(ref => {
        console.log(`   - Column: ${ref.column_name}, Constraint: ${ref.constraint_name}`)
      })
    }
    
    // Try a different approach - check if we can query the veterans table directly
    console.log('\n🧪 Testing direct veterans table access...')
    try {
      const { data: veteranData, error: veteranError } = await supabase
        .from('veterans')
        .select('*')
        .limit(1)
      
      if (veteranError) {
        console.log(`❌ Direct veterans access: ${veteranError.message}`)
      } else {
        console.log(`✅ Direct veterans access: working`)
        if (veteranData && veteranData.length > 0) {
          console.log(`   - Sample data columns: ${Object.keys(veteranData[0]).join(', ')}`)
          console.log(`   - Sample data:`, JSON.stringify(veteranData[0], null, 2))
        } else {
          console.log(`   - Table is empty, checking structure...`)
          // Try to insert a test record to see the structure
          const { data: insertData, error: insertError } = await supabase
            .from('veterans')
            .insert({
              user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
              rank: 'test',
              service_branch: 'test'
            })
            .select()
          
          if (insertError) {
            console.log(`   - Insert error (expected): ${insertError.message}`)
            // This error should tell us about the constraint
            if (insertError.message.includes('foreign key')) {
              console.log(`   - Foreign key constraint detected`)
            }
          } else {
            console.log(`   - Insert successful (unexpected)`)
            // Clean up the test record
            await supabase.from('veterans').delete().eq('user_id', '00000000-0000-0000-0000-000000000000')
          }
        }
      }
    } catch (err) {
      console.log(`❌ Direct veterans access: ${err}`)
    }
    
    // Try to understand the relationship by looking at the pitches table
    console.log('\n🎯 Testing pitches table structure...')
    try {
      const { data: pitchData, error: pitchError } = await supabase
        .from('pitches')
        .select('*')
        .limit(1)
      
      if (pitchError) {
        console.log(`❌ Direct pitches access: ${pitchError.message}`)
      } else {
        console.log(`✅ Direct pitches access: working`)
        if (pitchData && pitchData.length > 0) {
          console.log(`   - Sample data columns: ${Object.keys(pitchData[0]).join(', ')}`)
          console.log(`   - Sample data:`, JSON.stringify(pitchData[0], null, 2))
        } else {
          console.log(`   - Table is empty`)
        }
      }
    } catch (err) {
      console.log(`❌ Direct pitches access: ${err}`)
    }
    
  } catch (error) {
    console.error('❌ Constraint check failed:', error)
  }
}

checkConstraints()
