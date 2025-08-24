#!/usr/bin/env node

// =====================================================
// CHECK LIVE SCHEMA - See What Actually Exists
// Script: scripts/check-live-schema.js
// Purpose: Check actual columns in live database
// =====================================================

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkLiveSchema() {
  console.log('🔍 Checking Live Database Schema')
  console.log('================================')
  console.log(`Target: ${url}`)
  
  try {
    // Check users table structure
    console.log('\n1️⃣ Users Table Structure...')
    
    const { data: usersSample, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError)
      return
    }
    
    if (usersSample && usersSample.length > 0) {
      const user = usersSample[0]
      console.log('✅ Users table accessible')
      console.log('📊 Available columns:')
      Object.keys(user).forEach(key => {
        console.log(`   - ${key}: ${typeof user[key]} (${user[key] === null ? 'null' : 'has value'})`)
      })
    }
    
    // Check pitches table structure
    console.log('\n2️⃣ Pitches Table Structure...')
    
    const { data: pitchesSample, error: pitchesError } = await supabase
      .from('pitches')
      .select('*')
      .limit(1)
    
    if (pitchesError) {
      console.error('❌ Error accessing pitches table:', pitchesError)
    } else if (pitchesSample && pitchesSample.length > 0) {
      const pitch = pitchesSample[0]
      console.log('✅ Pitches table accessible')
      console.log('📊 Available columns:')
      Object.keys(pitch).forEach(key => {
        console.log(`   - ${key}: ${typeof pitch[key]} (${pitch[key] === null ? 'null' : 'has value'})`)
      })
    }
    
    // Check referrals table structure
    console.log('\n3️⃣ Referrals Table Structure...')
    
    const { data: referralsSample, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .limit(1)
    
    if (referralsError) {
      console.error('❌ Error accessing referrals table:', referralsError)
    } else if (referralsSample && referralsSample.length > 0) {
      const referral = referralsSample[0]
      console.log('✅ Referrals table accessible')
      console.log('📊 Available columns:')
      Object.keys(referral).forEach(key => {
        console.log(`   - ${key}: ${typeof referral[key]} (${referral[key] === null ? 'null' : 'has value'})`)
      })
    }
    
    // Check endorsements table structure
    console.log('\n4️⃣ Endorsements Table Structure...')
    
    const { data: endorsementsSample, error: endorsementsError } = await supabase
      .from('endorsements')
      .select('*')
      .limit(1)
    
    if (endorsementsError) {
      console.error('❌ Error accessing endorsements table:', endorsementsError)
    } else if (endorsementsSample && endorsementsSample.length > 0) {
      const endorsement = endorsementsSample[0]
      console.log('✅ Endorsements table accessible')
      console.log('📊 Available columns:')
      Object.keys(endorsement).forEach(key => {
        console.log(`   - ${key}: ${typeof endorsement[key]} (${endorsement[key] === null ? 'null' : 'has value'})`)
      })
    }
    
    // Check referral_events table structure
    console.log('\n5️⃣ Referral Events Table Structure...')
    
    const { data: eventsSample, error: eventsError } = await supabase
      .from('referral_events')
      .select('*')
      .limit(1)
    
    if (eventsError) {
      console.error('❌ Error accessing referral_events table:', eventsError)
    } else if (eventsSample && eventsSample.length > 0) {
      const event = eventsSample[0]
      console.log('✅ Referral events table accessible')
      console.log('📊 Available columns:')
      Object.keys(event).forEach(key => {
        console.log(`   - ${key}: ${typeof event[key]} (${event[key] === null ? 'null' : 'has value'})`)
      })
    }
    
    console.log('\n🎯 Schema Analysis Complete!')
    console.log('============================')
    console.log('Now I can see exactly what columns exist')
    console.log('and fix the code to match the live schema')
    
  } catch (error) {
    console.error('❌ Schema check failed:', error)
    process.exit(1)
  }
}

// Run the check
checkLiveSchema().catch(console.error)
