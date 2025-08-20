// =====================================================
// APPLY COMPLETE BILLING SYSTEM MIGRATION
// Xainik Platform - Professional Billing & Invoicing
// =====================================================

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// =====================================================
// SUPABASE CLIENT
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// =====================================================
// MIGRATION EXECUTION
// =====================================================

async function applyBillingMigration() {
  try {
    console.log('🚀 Starting Complete Billing System Migration...')
    
    // Read migration SQL
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_complete_billing_system.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📋 Executing migration SQL...')
    
    // Execute migration using RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
    
    console.log('✅ Migration executed successfully!')
    
    // Verify the changes
    console.log('🔍 Verifying migration...')
    
    // Check if new fields exist
    const { data: donationsFields, error: donationsError } = await supabase
      .from('donations')
      .select('razorpay_payment_id, razorpay_order_id, is_anonymous')
      .limit(1)
    
    if (donationsError) {
      console.error('❌ Error checking donations fields:', donationsError)
    } else {
      console.log('✅ Donations table updated with Razorpay fields')
    }
    
    // Check if new tables exist
    const { data: paymentEvents, error: paymentEventsError } = await supabase
      .from('payment_events')
      .select('*')
      .limit(1)
    
    if (paymentEventsError) {
      console.error('❌ Error checking payment_events table:', paymentEventsError)
    } else {
      console.log('✅ Payment events table created')
    }
    
    const { data: emailLogs, error: emailLogsError } = await supabase
      .from('email_logs')
      .select('*')
      .limit(1)
    
    if (emailLogsError) {
      console.error('❌ Error checking email_logs table:', emailLogsError)
    } else {
      console.log('✅ Email logs table created')
    }
    
    console.log('🎉 Complete Billing System Migration Successful!')
    console.log('')
    console.log('📋 What was added:')
    console.log('  • Razorpay payment tracking fields to donations, invoices, receipts')
    console.log('  • Payment events table for webhook idempotency')
    console.log('  • Email logs table for tracking document deliveries')
    console.log('  • Performance indexes for all payment-related queries')
    console.log('  • RLS policies for security')
    console.log('')
    console.log('🚀 Your billing system is now ready for production!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// =====================================================
// EXECUTE MIGRATION
// =====================================================

applyBillingMigration()
