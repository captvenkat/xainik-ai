const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://byleslhlkakxnsurzyzt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteUser() {
  const email = 'venky24aug@gmail.com';
  
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // First, find the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('✅ User not found - already deleted or never existed');
        return;
      }
      throw userError;
    }
    
    if (!user) {
      console.log('✅ User not found - already deleted or never existed');
      return;
    }
    
    console.log(`👤 Found user: ${user.name} (${user.id})`);
    
    const userId = user.id;
    
    // Delete from resume_requests (both as recruiter and user)
    console.log('🗑️  Deleting resume requests...');
    const { error: resumeError } = await supabase
      .from('resume_requests')
      .delete()
      .or(`recruiter_user_id.eq.${userId},user_id.eq.${userId}`);
    
    if (resumeError) {
      console.log(`⚠️  Resume requests deletion warning: ${resumeError.message}`);
    } else {
      console.log('✅ Resume requests deleted');
    }
    
    // Delete from endorsements (both as veteran and endorser)
    console.log('🗑️  Deleting endorsements...');
    const { error: endorsementError } = await supabase
      .from('endorsements')
      .delete()
      .or(`veteran_user_id.eq.${userId},endorser_user_id.eq.${userId}`);
    
    if (endorsementError) {
      console.log(`⚠️  Endorsements deletion warning: ${endorsementError.message}`);
    } else {
      console.log('✅ Endorsements deleted');
    }
    
    // Delete from pitches
    console.log('🗑️  Deleting pitches...');
    const { error: pitchError } = await supabase
      .from('pitches')
      .delete()
      .eq('user_id', userId);
    
    if (pitchError) {
      console.log(`⚠️  Pitches deletion warning: ${pitchError.message}`);
    } else {
      console.log('✅ Pitches deleted');
    }
    
    // Delete from user_profiles
    console.log('🗑️  Deleting user profiles...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) {
      console.log(`⚠️  User profiles deletion warning: ${profileError.message}`);
    } else {
      console.log('✅ User profiles deleted');
    }
    
    // Finally, delete from users table
    console.log('🗑️  Deleting user from users table...');
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (userDeleteError) {
      throw userDeleteError;
    }
    
    console.log('✅ User deleted successfully from all tables!');
    console.log(`🎯 You can now test the waitlist with email: ${email}`);
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    process.exit(1);
  }
}

deleteUser();
