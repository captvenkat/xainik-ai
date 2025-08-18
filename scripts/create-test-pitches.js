const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestPitches() {
  console.log('🚀 Creating test pitches for dashboard functionality testing...\n');

  // Get the test users we just created
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, name, military_branch, military_rank, years_of_service, location, phone')
    .in('email', ['test-veteran@xainik.com', 'test-veteran-2@xainik.com']);

  if (usersError) {
    console.error('❌ Error fetching test users:', usersError.message);
    return;
  }

  console.log(`📝 Found ${users.length} test users`);

  const testPitches = [
    {
      title: "Experienced Army Sergeant Seeking Leadership Role",
      pitch_text: "As a Sergeant with 8 years of service in the Army, I've led teams of 15+ soldiers in high-pressure environments. My experience includes strategic planning, team management, and crisis response. I'm seeking a leadership position where I can apply my military training to drive organizational success.",
      skills: ["Leadership", "Team Management", "Strategic Planning", "Crisis Response", "Military Training"],
      job_type: "Full-time",
      availability: "Immediate"
    },
    {
      title: "Navy Lieutenant Transitioning to Civilian Career",
      pitch_text: "After 12 years of distinguished service in the Navy as a Lieutenant, I'm ready to transition my skills to the civilian sector. My background includes operations management, logistics coordination, and personnel development. I'm particularly interested in project management and operations roles.",
      skills: ["Operations Management", "Logistics", "Personnel Development", "Project Management", "Navy Leadership"],
      job_type: "Full-time",
      availability: "2 weeks notice"
    },
    {
      title: "Veteran with Technical and Leadership Skills",
      pitch_text: "Combining my military leadership experience with technical expertise, I bring a unique perspective to any organization. I've managed complex technical systems while leading diverse teams. Looking for opportunities in technology leadership or consulting roles.",
      skills: ["Technical Leadership", "System Management", "Team Leadership", "Consulting", "Technology Management"],
      job_type: "Contract",
      availability: "Flexible"
    }
  ];

  for (const user of users) {
    console.log(`\n📝 Creating pitches for: ${user.name} (${user.email})`);

    for (let i = 0; i < testPitches.length; i++) {
      const pitchData = testPitches[i];
      
      try {
        const { data: pitch, error: pitchError } = await supabase
          .from('pitches')
          .insert({
            user_id: user.id,
            title: pitchData.title,
            pitch_text: pitchData.pitch_text,
            skills: pitchData.skills,
            job_type: pitchData.job_type,
            location: user.location || "Remote",
            availability: pitchData.availability,
            phone: user.phone || "+1-555-0000",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (pitchError) {
          console.error(`❌ Pitch creation failed:`, pitchError.message);
        } else {
          console.log(`✅ Pitch created: ${pitch.title}`);
        }

      } catch (error) {
        console.error(`❌ Error creating pitch:`, error.message);
      }
    }
  }

  console.log('\n🎉 Test pitches creation completed!');
}

// Run the script
createTestPitches().catch(console.error);
