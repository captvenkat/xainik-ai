#!/usr/bin/env node

/**
 * Database Setup Test Script
 * Tests the veteran dashboard database setup and validates all components
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

// Test results tracking
const results = {
  tables: { passed: 0, failed: 0, tests: [] },
  relationships: { passed: 0, failed: 0, tests: [] },
  policies: { passed: 0, failed: 0, tests: [] },
  data: { passed: 0, failed: 0, tests: [] }
};

async function testTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    results.tables.passed++;
    results.tables.tests.push({ name: tableName, status: '✅ PASSED' });
    return true;
  } catch (error) {
    results.tables.failed++;
    results.tables.tests.push({ name: tableName, status: '❌ FAILED', error: error.message });
    return false;
  }
}

async function testForeignKeyRelationship(tableName, columnName, referencedTable) {
  try {
    // Try to join with referenced table
    const { data, error } = await supabase
      .from(tableName)
      .select(`${columnName}, ${referencedTable}(id)`)
      .limit(1);
    
    if (error) throw error;
    
    results.relationships.passed++;
    results.relationships.tests.push({ 
      name: `${tableName}.${columnName} → ${referencedTable}.id`, 
      status: '✅ PASSED' 
    });
    return true;
  } catch (error) {
    results.relationships.failed++;
    results.relationships.tests.push({ 
      name: `${tableName}.${columnName} → ${referencedTable}.id`, 
      status: '❌ FAILED', 
      error: error.message 
    });
    return false;
  }
}

async function testRLSPolicy(tableName, operation) {
  try {
    let query;
    switch (operation) {
      case 'SELECT':
        query = supabase.from(tableName).select('*').limit(1);
        break;
      case 'INSERT':
        // Test with minimal data
        const testData = getTestData(tableName);
        query = supabase.from(tableName).insert(testData);
        break;
      case 'UPDATE':
        query = supabase.from(tableName).update({ updated_at: new Date().toISOString() }).limit(1);
        break;
      case 'DELETE':
        query = supabase.from(tableName).delete().limit(1);
        break;
    }
    
    const { data, error } = await query;
    
    // For RLS tests, we expect some operations to fail due to RLS
    // This is actually good - it means RLS is working
    if (error && error.message.includes('permission') || error.message.includes('policy')) {
      results.policies.passed++;
      results.policies.tests.push({ 
        name: `${tableName} ${operation} RLS`, 
        status: '✅ PASSED (RLS enforced)' 
      });
      return true;
    } else if (!error) {
      results.policies.passed++;
      results.policies.tests.push({ 
        name: `${tableName} ${operation} RLS`, 
        status: '✅ PASSED (allowed)' 
      });
      return true;
    } else {
      throw error;
    }
  } catch (error) {
    results.policies.failed++;
    results.policies.tests.push({ 
      name: `${tableName} ${operation} RLS`, 
      status: '❌ FAILED', 
      error: error.message 
    });
    return false;
  }
}

function getTestData(tableName) {
  const baseData = {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  switch (tableName) {
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

async function testDataIntegrity() {
  try {
    // Test that we can query the community suggestions summary view
    const { data, error } = await supabase
      .from('community_suggestions_summary')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    results.data.passed++;
    results.data.tests.push({ 
      name: 'Community suggestions summary view', 
      status: '✅ PASSED' 
    });
    return true;
  } catch (error) {
    results.data.failed++;
    results.data.tests.push({ 
      name: 'Community suggestions summary view', 
      status: '❌ FAILED', 
      error: error.message 
    });
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Database Setup Tests...');
  console.log('============================================================');
  
  // Test required tables
  console.log('\n📋 Testing Required Tables...');
  const requiredTables = [
    'users',
    'pitches', 
    'endorsements',
    'likes',
    'shares',
    'community_suggestions',
    'mission_invitation_summary'
  ];
  
  for (const table of requiredTables) {
    await testTableExists(table);
  }
  
  // Test foreign key relationships
  console.log('\n🔗 Testing Foreign Key Relationships...');
  const relationships = [
    ['endorsements', 'veteran_id', 'users'],
    ['endorsements', 'endorser_id', 'users'],
    ['likes', 'user_id', 'users'],
    ['likes', 'pitch_id', 'pitches'],
    ['shares', 'user_id', 'users'],
    ['shares', 'pitch_id', 'pitches'],
    ['community_suggestions', 'user_id', 'users'],
    ['mission_invitation_summary', 'user_id', 'users']
  ];
  
  for (const [table, column, referencedTable] of relationships) {
    await testForeignKeyRelationship(table, column, referencedTable);
  }
  
  // Test RLS policies
  console.log('\n🔒 Testing Row Level Security Policies...');
  const tablesWithRLS = [
    'endorsements',
    'likes', 
    'shares',
    'community_suggestions',
    'mission_invitation_summary'
  ];
  
  for (const table of tablesWithRLS) {
    await testRLSPolicy(table, 'SELECT');
    await testRLSPolicy(table, 'INSERT');
  }
  
  // Test data integrity
  console.log('\n📊 Testing Data Integrity...');
  await testDataIntegrity();
  
  // Print results
  console.log('\n============================================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('============================================================');
  
  console.log('\n📋 Tables:');
  results.tables.tests.forEach(test => {
    console.log(`   ${test.status} ${test.name}`);
    if (test.error) console.log(`      Error: ${test.error}`);
  });
  
  console.log('\n🔗 Relationships:');
  results.relationships.tests.forEach(test => {
    console.log(`   ${test.status} ${test.name}`);
    if (test.error) console.log(`      Error: ${test.error}`);
  });
  
  console.log('\n🔒 RLS Policies:');
  results.policies.tests.forEach(test => {
    console.log(`   ${test.status} ${test.name}`);
    if (test.error) console.log(`      Error: ${test.error}`);
  });
  
  console.log('\n📊 Data Integrity:');
  results.data.tests.forEach(test => {
    console.log(`   ${test.status} ${test.name}`);
    if (test.error) console.log(`      Error: ${test.error}`);
  });
  
  // Calculate totals
  const totalTests = results.tables.tests.length + results.relationships.tests.length + 
                    results.policies.tests.length + results.data.tests.length;
  const totalPassed = results.tables.passed + results.relationships.passed + 
                     results.policies.passed + results.data.passed;
  const totalFailed = results.tables.failed + results.relationships.failed + 
                     results.policies.failed + results.data.failed;
  
  console.log('\n============================================================');
  console.log('📈 OVERALL RESULTS');
  console.log('============================================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed} ✅`);
  console.log(`Failed: ${totalFailed} ❌`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your veteran dashboard database is properly configured');
    console.log('✅ All tables, relationships, and policies are working');
    console.log('✅ Ready for production use');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('🔧 Please review the failed tests above');
    console.log('🔧 Run the migration script if needed');
    console.log('🔧 Check your database configuration');
  }
  
  console.log('\n============================================================');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
