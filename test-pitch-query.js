const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPitchQuery() {
  try {
    console.log('Testing pitch query with relationships...');
    
    const { data: pitch, error } = await supabase
      .from('pitches')
      .select(`
        *,
        users!pitches_user_id_fkey (
          id,
          name,
          email,
          role
        ),
        veterans!veterans_user_id_fkey (
          intro
        )
      `)
      .eq('id', 'b8348447-2064-44eb-852c-f6ca4e2b7f4f')
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return;
    }
    
    if (!pitch) {
      console.log('Pitch not found or not active');
      return;
    }
    
    console.log('Pitch found:', {
      id: pitch.id,
      title: pitch.title,
      user_id: pitch.user_id,
      is_active: pitch.is_active,
      has_user: !!pitch.users,
      has_veterans: !!pitch.veterans,
      user_name: pitch.users?.name,
      veteran_intro: pitch.veterans?.[0]?.intro
    });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testPitchQuery();
