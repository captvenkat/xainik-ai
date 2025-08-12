import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('👤 Creating User Record...')
console.log('==========================')

if (!url || !anonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function createUserRecord() {
  try {
    // The user ID from the error logs
    const userId = '713e1683-8089-4dfc-ac29-b0f1b2d6c787'
    
    console.log(`Creating user record for ID: ${userId}`)
    
    // Create the user record
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'test@example.com', // You can update this
        name: 'Test User',
        role: 'veteran' // Default role
      }, {
        onConflict: 'id'
      })
      .select()
    
    if (error) {
      console.error('❌ Error creating user:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    } else {
      console.log('✅ User created successfully:', data)
      
      // Test if we can now query the user
      console.log('\n🔍 Testing user query...')
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', userId)
        .single()
      
      if (queryError) {
        console.error('❌ User query still failing:', queryError)
      } else {
        console.log('✅ User query successful:', userData)
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

createUserRecord()
