#!/usr/bin/env node

/**
 * Check Actual Database State
 * This script checks what actually exists in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkActualDatabaseState() {
  console.log('🔍 Checking Actual Database State...');
  console.log('=====================================');
  
  try {
    // Try to get tables using a different approach
    console.log('\n📋 Checking what tables exist...');
    
    // Test common table names
    const commonTables = [
      'users', 'pitches', 'endorsements', 'likes', 'shares', 
      'community_suggestions', 'mission_invitation_summary',
      'veterans', 'recruiters', 'supporters', 'referrals',
      'donations', 'invoices', 'receipts', 'email_logs'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const tableName of commonTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          missingTables.push(tableName);
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          existingTables.push(tableName);
          console.log(`✅ ${tableName}: exists`);
        }
      } catch (err) {
        missingTables.push(tableName);
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }
    
    console.log(`\n📊 Summary: ${existingTables.length} tables exist, ${missingTables.length} missing`);
    
    // Check table structures for existing tables
    console.log('\n🔍 Checking table structures...');
    
    for (const tableName of existingTables) {
      try {
        // Try to get column information by selecting all columns
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error && data && data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`\n📋 ${tableName} columns:`);
          columns.forEach(col => console.log(`   - ${col}`));
        }
      } catch (err) {
        console.log(`⚠️  Could not get structure for ${tableName}: ${err.message}`);
      }
    }
    
    // Check for views
    console.log('\n👁️  Checking for views...');
    try {
      const { data, error } = await supabase
        .from('community_suggestions_summary')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ community_suggestions_summary view: ${error.message}`);
      } else {
        console.log(`✅ community_suggestions_summary view: exists`);
      }
    } catch (err) {
      console.log(`❌ community_suggestions_summary view: ${err.message}`);
    }
    
    // Check RLS policies
    console.log('\n🔒 Checking RLS policies...');
    for (const tableName of existingTables) {
      try {
        // Try to insert a test record to see if RLS blocks it
        const testData = getTestData(tableName);
        const { error } = await supabase
          .from(tableName)
          .insert(testData);
        
        if (error && error.message.includes('policy')) {
          console.log(`✅ ${tableName}: RLS policies working`);
        } else if (error) {
          console.log(`⚠️  ${tableName}: ${error.message}`);
        } else {
          console.log(`⚠️  ${tableName}: No RLS policies or they're not working`);
        }
      } catch (err) {
        console.log(`❌ ${tableName} RLS check: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database state check failed:', error.message);
  }
}

function getTestData(tableName) {
  const baseData = {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  switch (tableName) {
    case 'users':
      return {
        ...baseData,
        email: 'test@example.com',
        name: 'Test User',
        role: 'veteran'
      };
    case 'pitches':
      return {
        ...baseData,
        title: 'Test Pitch',
        pitch_text: 'Test pitch text',
        skills: ['test'],
        job_type: 'full-time',
        location: 'Test Location',
        availability: 'Immediate',
        phone: '1234567890'
      };
    case 'endorsements':
      return {
        ...baseData,
        veteran_id: '00000000-0000-0000-0000-000000000000',
        endorser_id: '00000000-0000-0000-0000-000000000000',
        text: 'Test endorsement'
      };
    case 'likes':
      return {
        ...baseData,
        user_id: '00000000-0000-0000-0000-000000000000',
        pitch_id: '00000000-0000-0000-0000-000000000000'
      };
    case 'shares':
      return {
        ...baseData,
        user_id: '00000000-0000-0000-0000-000000000000',
        pitch_id: '00000000-0000-0000-0000-000000000000',
        platform: 'test',
        share_link: 'https://test.com'
      };
    case 'community_suggestions':
      return {
        ...baseData,
        user_id: '00000000-0000-0000-0000-000000000000',
        suggestion_type: 'feature',
        title: 'Test suggestion',
        description: 'Test description'
      };
    case 'mission_invitation_summary':
      return {
        ...baseData,
        user_id: '00000000-0000-0000-0000-000000000000',
        total_invitations_sent: 0,
        total_invitations_accepted: 0,
        total_invitations_declined: 0,
        total_invitations_pending: 0
      };
    default:
      return baseData;
  }
}

// Run the check
checkActualDatabaseState().catch(error => {
  console.error('❌ Database state check failed:', error);
  process.exit(1);
});
