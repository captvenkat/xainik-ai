const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUsers() {
  console.log('🚀 Creating test user accounts for veteran dashboard testing...\n');

  const testUsers = [
    {
      email: 'test-veteran@xainik.com',
      password: 'TestVeteran123!',
      name: 'Test Veteran',
      role: 'veteran',
      military_branch: 'Army',
      military_rank: 'Sergeant',
      years_of_service: 8,
      discharge_date: '2023-06-15',
      education_level: 'Bachelor Degree',
      location: 'San Francisco, CA',
      phone: '+1-555-0123',
      bio: 'Test veteran account for dashboard functionality testing'
    },
    {
      email: 'test-veteran-2@xainik.com',
      password: 'TestVeteran456!',
      name: 'John Smith',
      role: 'veteran',
      military_branch: 'Navy',
      military_rank: 'Lieutenant',
      years_of_service: 12,
      discharge_date: '2022-12-01',
      education_level: 'Master Degree',
      location: 'New York, NY',
      phone: '+1-555-0456',
      bio: 'Second test veteran account for comprehensive testing'
    }
  ];

  for (const userData of testUsers) {
    try {
      console.log(`📝 Creating test user: ${userData.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Auth creation failed for ${userData.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Create profile in users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          military_branch: userData.military_branch,
          military_rank: userData.military_rank,
          years_of_service: userData.years_of_service,
          discharge_date: userData.discharge_date,
          education_level: userData.education_level,
          location: userData.location,
          phone: userData.phone,
          bio: userData.bio,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Profile creation failed for ${userData.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Profile created: ${profileData.id}`);

      // Create sample pitch for testing
      const { data: pitchData, error: pitchError } = await supabase
        .from('pitches')
        .insert({
          user_id: authData.user.id,
          title: `Test Pitch - ${userData.name}`,
          pitch_text: `This is a test pitch created for dashboard functionality testing. ${userData.name} is a ${userData.military_rank} with ${userData.years_of_service} years of service in the ${userData.military_branch}.`,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pitchError) {
        console.log(`⚠️ Pitch creation failed for ${userData.email}:`, pitchError.message);
      } else {
        console.log(`✅ Sample pitch created: ${pitchData.id}`);
      }

      console.log(`🎉 Test user ${userData.email} created successfully!\n`);

    } catch (error) {
      console.error(`❌ Error creating test user ${userData.email}:`, error.message);
    }
  }

  console.log('📋 Test User Credentials:');
  console.log('========================');
  testUsers.forEach(user => {
    console.log(`\nEmail: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Role: ${user.role}`);
    console.log(`Name: ${user.name}`);
  });

  console.log('\n🔐 You can now use these credentials to test the authenticated dashboard functionality!');
}

// Run the script
createTestUsers().catch(console.error);

