import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyUserTrigger() {
  console.log('🔧 Applying User Creation Trigger...')
  
  try {
    // Read the migration SQL
    const migrationSQL = fs.readFileSync('migrations/20250127_add_user_creation_trigger.sql', 'utf8')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      
      // Try alternative approach - execute SQL directly
      console.log('🔄 Trying alternative approach...')
      
      // Create function
      const { error: funcError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO public.users (id, email, name, role)
            VALUES (
              NEW.id,
              NEW.email,
              COALESCE(NEW.raw_user_meta_data->>'full_name', 
                       NEW.raw_user_meta_data->>'name', 
                       split_part(NEW.email, '@', 1), 
                       'User'),
              'veteran'
            );
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
      
      if (funcError) {
        console.error('❌ Function creation failed:', funcError)
      } else {
        console.log('✅ Function created successfully')
        
        // Create trigger
        const { error: triggerError } = await supabase.rpc('exec_sql', {
          sql: `
            DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
            CREATE TRIGGER on_auth_user_created
              AFTER INSERT ON auth.users
              FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
          `
        })
        
        if (triggerError) {
          console.error('❌ Trigger creation failed:', triggerError)
        } else {
          console.log('✅ Trigger created successfully')
        }
      }
    } else {
      console.log('✅ Migration applied successfully')
    }
    
    // Test the trigger by checking if it exists
    console.log('\n🔍 Testing trigger...')
    const { data: triggers, error: testError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation')
      .eq('trigger_name', 'on_auth_user_created')
    
    if (testError) {
      console.error('❌ Trigger test failed:', testError)
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Trigger exists and is active')
    } else {
      console.log('⚠️  Trigger not found')
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

applyUserTrigger()
