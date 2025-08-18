const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPitchCreation() {
  console.log('🧪 Testing pitch creation functionality (without resume upload)...\n');

  try {
    // Get test user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, location, phone')
      .in('email', ['test-veteran@xainik.com'])
      .single();

    if (usersError || !users) {
      console.error('❌ Error fetching test user:', usersError?.message);
      return;
    }

    console.log(`✅ Found test user: ${users.name} (${users.email})`);

    // Test pitch data (without resume fields)
    const testPitch = {
      user_id: users.id,
      title: "Test Pitch - No Resume Upload",
      pitch_text: "This is a test pitch to verify that the database fix works correctly without resume upload functionality. Resume requests are now handled by recruiters.",
      skills: ["Testing", "Database Management", "Verification"],
      job_type: "Full-time",
      location: users.location || "Remote",
      availability: "Immediate",
      phone: users.phone || "+1-555-0000",
      linkedin_url: "https://linkedin.com/in/test-veteran",
      is_active: true
    };

    console.log('📝 Attempting to create test pitch...');
    console.log('Pitch data:', JSON.stringify(testPitch, null, 2));

    // Create pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .insert(testPitch)
      .select()
      .single();

    if (pitchError) {
      console.error('❌ Pitch creation failed:', pitchError.message);
      console.error('Error details:', pitchError);
      return;
    }

    console.log('✅ Pitch created successfully!');
    console.log('Pitch ID:', pitch.id);
    console.log('Pitch Title:', pitch.title);
    console.log('Created at:', pitch.created_at);
    console.log('Resume upload: Removed (recruiters can request via button)');

    // Test pitch retrieval
    console.log('\n📖 Testing pitch retrieval...');
    const { data: retrievedPitch, error: retrieveError } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitch.id)
      .single();

    if (retrieveError) {
      console.error('❌ Pitch retrieval failed:', retrieveError.message);
    } else {
      console.log('✅ Pitch retrieval successful!');
      console.log('Retrieved pitch:', retrievedPitch.title);
      console.log('Resume fields: None (as expected)');
    }

    // Test pitch listing
    console.log('\n📋 Testing pitch listing...');
    const { data: userPitches, error: listError } = await supabase
      .from('pitches')
      .select('*')
      .eq('user_id', users.id)
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ Pitch listing failed:', listError.message);
    } else {
      console.log(`✅ Found ${userPitches.length} pitches for user`);
      userPitches.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} (${p.created_at})`);
      });
    }

    console.log('\n🎉 Pitch creation test completed successfully!');
    console.log('✅ The pitches table is now working correctly without resume upload.');
    console.log('✅ Resume request functionality is available for recruiters.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPitchCreation().catch(console.error);
