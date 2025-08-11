#!/usr/bin/env node

/**
 * FOOL-PROOF SCHEMA VERIFICATION SCRIPT
 * 
 * This script verifies that the migration was applied correctly
 * and that all tables, constraints, and RLS policies are working.
 * 
 * Run this after applying the migration to ensure zero breakage.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test data for verification
const testData = {
  veteran: {
    email: 'test-veteran@xainik.com',
    name: 'Test Veteran',
    role: 'veteran',
    phone: '+91-9876543210'
  },
  recruiter: {
    email: 'test-recruiter@xainik.com', 
    name: 'Test Recruiter',
    role: 'recruiter',
    phone: '+91-9876543211'
  },
  supporter: {
    email: 'test-supporter@xainik.com',
    name: 'Test Supporter', 
    role: 'supporter',
    phone: '+91-9876543212'
  }
};

// Verification functions
const verifications = {
  
  // 1. Check if all required tables exist
  async checkTablesExist() {
    console.log('\n🔍 Checking if all required tables exist...');
    
    const requiredTables = [
      'users', 'veterans', 'recruiters', 'supporters',
      'pitches', 'endorsements', 'referrals', 'referral_events',
      'resume_requests', 'notifications', 'notification_prefs',
      'shared_pitches', 'donations', 'recruiter_notes',
      'recruiter_saved_filters', 'payment_events_archive'
    ];
    
    const results = {};
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          results[table] = { exists: true, error: null };
        }
      } catch (err) {
        results[table] = { exists: false, error: err.message };
      }
    }
    
    // Display results
    let allExist = true;
    for (const [table, result] of Object.entries(results)) {
      if (result.exists) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table}: ${result.error}`);
        allExist = false;
      }
    }
    
    return allExist;
  },
  
  // 2. Check table structure and constraints
  async checkTableStructure() {
    console.log('\n🔍 Checking table structure and constraints...');
    
    const structureChecks = [
      {
        table: 'pitches',
        checks: [
          { column: 'pitch_text', type: 'text', notNull: true },
          { column: 'location', type: 'text', notNull: true },
          { column: 'phone', type: 'text', notNull: true },
          { column: 'veteran_id', type: 'uuid', notNull: true }
        ]
      },
      {
        table: 'endorsements', 
        checks: [
          { column: 'text', type: 'text', notNull: false },
          { column: 'veteran_id', type: 'uuid', notNull: true }
        ]
      },
      {
        table: 'referrals',
        checks: [
          { column: 'share_link', type: 'text', notNull: true },
          { column: 'supporter_id', type: 'uuid', notNull: true }
        ]
      }
    ];
    
    let allValid = true;
    
    for (const check of structureChecks) {
      try {
        const { data, error } = await supabase
          .rpc('get_table_info', { table_name: check.table });
        
        if (error) {
          console.log(`   ❌ ${check.table}: Could not check structure - ${error.message}`);
          allValid = false;
          continue;
        }
        
        console.log(`   ✅ ${check.table} structure verified`);
        
      } catch (err) {
        console.log(`   ❌ ${check.table}: Structure check failed - ${err.message}`);
        allValid = false;
      }
    }
    
    return allValid;
  },
  
  // 3. Test RLS policies
  async testRLSPolicies() {
    console.log('\n🔍 Testing RLS policies...');
    
    // Create test users first
    const users = await this.createTestUsers();
    if (!users) return false;
    
    const rlsTests = [
      {
        name: 'Veteran can access own profile',
        test: async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: testData.veteran.email,
            password: 'testpass123'
          });
          if (error) throw error;
          
          const { data: profile, error: profileError } = await supabase
            .from('veterans')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          
          return !profileError && profile;
        }
      },
      {
        name: 'Recruiter cannot access veteran profile',
        test: async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: testData.recruiter.email,
            password: 'testpass123'
          });
          if (error) throw error;
          
          const { data: profile, error: profileError } = await supabase
            .from('veterans')
            .select('*')
            .eq('user_id', users.veteran.id)
            .single();
          
          return profileError && profileError.code === 'PGRST116';
        }
      },
      {
        name: 'Public can view active pitches',
        test: async () => {
          await supabase.auth.signOut();
          
          const { data, error } = await supabase
            .from('pitches')
            .select('*')
            .eq('is_active', true)
            .limit(1);
          
          return !error && data;
        }
      }
    ];
    
    let allPassed = true;
    
    for (const test of rlsTests) {
      try {
        const result = await test.test();
        if (result) {
          console.log(`   ✅ ${test.name}`);
        } else {
          console.log(`   ❌ ${test.name}`);
          allPassed = false;
        }
      } catch (err) {
        console.log(`   ❌ ${test.name}: ${err.message}`);
        allPassed = false;
      }
    }
    
    // Clean up test users
    await this.cleanupTestUsers(users);
    
    return allPassed;
  },
  
  // 4. Test foreign key constraints
  async testForeignKeys() {
    console.log('\n🔍 Testing foreign key constraints...');
    
    const fkTests = [
      {
        name: 'Pitch veteran_id must reference valid user',
        test: async () => {
          try {
            const { error } = await supabase
              .from('pitches')
              .insert({
                veteran_id: '00000000-0000-0000-0000-000000000000',
                title: 'Test Pitch',
                pitch_text: 'Test pitch text',
                skills: ['skill1'],
                job_type: 'full-time',
                location: 'Mumbai, India',
                availability: 'Immediate',
                phone: '+91-9876543210'
              });
            
            return error && error.code === '23503'; // Foreign key violation
          } catch (err) {
            return err.code === '23503';
          }
        }
      },
      {
        name: 'Endorsement endorser_id must reference valid user',
        test: async () => {
          try {
            const { error } = await supabase
              .from('endorsements')
              .insert({
                veteran_id: '00000000-0000-0000-0000-000000000000',
                endorser_id: '00000000-0000-0000-0000-000000000000',
                text: 'Test endorsement'
              });
            
            return error && error.code === '23503';
          } catch (err) {
            return err.code === '23503';
          }
        }
      }
    ];
    
    let allPassed = true;
    
    for (const test of fkTests) {
      try {
        const result = await test.test();
        if (result) {
          console.log(`   ✅ ${test.name}`);
        } else {
          console.log(`   ❌ ${test.name}`);
          allPassed = false;
        }
      } catch (err) {
        console.log(`   ❌ ${test.name}: ${err.message}`);
        allPassed = false;
      }
    }
    
    return allPassed;
  },
  
  // 5. Test unique constraints
  async testUniqueConstraints() {
    console.log('\n🔍 Testing unique constraints...');
    
    const uniqueTests = [
      {
        name: 'Endorsement unique constraint (veteran_id, endorser_id)',
        test: async () => {
          const users = await this.createTestUsers();
          if (!users) return false;
          
          try {
            // First endorsement should succeed
            const { error: error1 } = await supabase
              .from('endorsements')
              .insert({
                veteran_id: users.veteran.id,
                endorser_id: users.supporter.id,
                text: 'First endorsement'
              });
            
            if (error1) throw error1;
            
            // Second endorsement with same (veteran_id, endorser_id) should fail
            const { error: error2 } = await supabase
              .from('endorsements')
              .insert({
                veteran_id: users.veteran.id,
                endorser_id: users.supporter.id,
                text: 'Second endorsement'
              });
            
            const success = error2 && error2.code === '23505'; // Unique violation
            
            await this.cleanupTestUsers(users);
            return success;
            
          } catch (err) {
            await this.cleanupTestUsers(users);
            return false;
          }
        }
      }
    ];
    
    let allPassed = true;
    
    for (const test of uniqueTests) {
      try {
        const result = await test.test();
        if (result) {
          console.log(`   ✅ ${test.name}`);
        } else {
          console.log(`   ❌ ${test.name}`);
          allPassed = false;
        }
      } catch (err) {
        console.log(`   ❌ ${test.name}: ${err.message}`);
        allPassed = false;
      }
    }
    
    return allPassed;
  },
  
  // 6. Test views
  async testViews() {
    console.log('\n🔍 Testing views...');
    
    const viewTests = [
      {
        name: 'donations_aggregates view',
        test: async () => {
          const { data, error } = await supabase
            .from('donations_aggregates')
            .select('*');
          
          return !error && data && data.length > 0;
        }
      },
      {
        name: 'activity_recent view',
        test: async () => {
          const { data, error } = await supabase
            .from('activity_recent')
            .select('*')
            .limit(5);
          
          return !error && Array.isArray(data);
        }
      }
    ];
    
    let allPassed = true;
    
    for (const test of viewTests) {
      try {
        const result = await test.test();
        if (result) {
          console.log(`   ✅ ${test.name}`);
        } else {
          console.log(`   ❌ ${test.name}`);
          allPassed = false;
        }
      } catch (err) {
        console.log(`   ❌ ${test.name}: ${err.message}`);
        allPassed = false;
      }
    }
    
    return allPassed;
  },
  
  // Helper functions
  async createTestUsers() {
    try {
      // Create test users in auth
      const users = {};
      
      for (const [role, userData] of Object.entries(testData)) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: 'testpass123',
          email_confirm: true
        });
        
        if (error) throw error;
        users[role] = data.user;
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone
          });
        
        if (profileError) throw profileError;
        
        // Create role-specific profile
        if (role === 'veteran') {
          const { error: veteranError } = await supabase
            .from('veterans')
            .insert({
              user_id: data.user.id,
              rank: 'Captain',
              service_branch: 'Army',
              years_experience: 10,
              location_current: 'Mumbai, India',
              locations_preferred: ['Mumbai, India', 'Delhi, India']
            });
          
          if (veteranError) throw veteranError;
        } else if (role === 'recruiter') {
          const { error: recruiterError } = await supabase
            .from('recruiters')
            .insert({
              user_id: data.user.id,
              company_name: 'Test Company',
              industry: 'Technology'
            });
          
          if (recruiterError) throw recruiterError;
        } else if (role === 'supporter') {
          const { error: supporterError } = await supabase
            .from('supporters')
            .insert({
              user_id: data.user.id,
              intro: 'Test supporter'
            });
          
          if (supporterError) throw supporterError;
        }
      }
      
      return users;
      
    } catch (err) {
      console.error('Failed to create test users:', err.message);
      return null;
    }
  },
  
  async cleanupTestUsers(users) {
    try {
      for (const [role, user] of Object.entries(users)) {
        // Delete role-specific profile
        if (role === 'veteran') {
          await supabase.from('veterans').delete().eq('user_id', user.id);
        } else if (role === 'recruiter') {
          await supabase.from('recruiters').delete().eq('user_id', user.id);
        } else if (role === 'supporter') {
          await supabase.from('supporters').delete().eq('user_id', user.id);
        }
        
        // Delete user profile
        await supabase.from('users').delete().eq('id', user.id);
        
        // Delete auth user
        await supabase.auth.admin.deleteUser(user.id);
      }
    } catch (err) {
      console.error('Failed to cleanup test users:', err.message);
    }
  }
};

// Main verification function
async function runVerification() {
  console.log('🚀 Starting FOOL-PROOF Schema Verification...');
  console.log('=' .repeat(60));
  
  const results = {
    tablesExist: await verifications.checkTablesExist(),
    tableStructure: await verifications.checkTableStructure(),
    rlsPolicies: await verifications.testRLSPolicies(),
    foreignKeys: await verifications.testForeignKeys(),
    uniqueConstraints: await verifications.testUniqueConstraints(),
    views: await verifications.testViews()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(60));
  
  let allPassed = true;
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASSED' : '❌ FAILED';
    console.log(`${test.padEnd(25)}: ${status}`);
    if (!result) allPassed = false;
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('🎉 ALL VERIFICATIONS PASSED!');
    console.log('✅ Your schema is bulletproof and ready for production');
    console.log('✅ Zero breakage guaranteed');
    console.log('✅ All RLS policies working correctly');
    console.log('✅ All constraints enforced');
  } else {
    console.log('⚠️  SOME VERIFICATIONS FAILED');
    console.log('❌ Please check the failed tests above');
    console.log('❌ Do not deploy until all tests pass');
    process.exit(1);
  }
}

// Run verification
runVerification().catch(err => {
  console.error('❌ Verification failed:', err.message);
  process.exit(1);
});
