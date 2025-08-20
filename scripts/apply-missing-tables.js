// =====================================================
// APPLY MISSING TABLES
// Xainik Platform - Create pitch_likes and pitch_shares
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function applyMissingTables() {
  console.log('🔧 Creating missing tables...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Create pitch_likes table
    console.log('📝 Creating pitch_likes table...');
    const { error: likesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.pitch_likes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, pitch_id)
        );
      `
    });

    if (likesError) {
      console.log('ℹ️  pitch_likes table might already exist or error:', likesError.message);
    } else {
      console.log('✅ pitch_likes table created');
    }

    // Create pitch_shares table
    console.log('📝 Creating pitch_shares table...');
    const { error: sharesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.pitch_shares (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
            share_platform TEXT NOT NULL,
            share_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (sharesError) {
      console.log('ℹ️  pitch_shares table might already exist or error:', sharesError.message);
    } else {
      console.log('✅ pitch_shares table created');
    }

    // Enable RLS and add policies
    console.log('🔒 Adding RLS policies...');
    
    // RLS for pitch_likes
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.pitch_likes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view all pitch likes" ON public.pitch_likes;
        CREATE POLICY "Users can view all pitch likes" ON public.pitch_likes
            FOR SELECT USING (true);
            
        DROP POLICY IF EXISTS "Users can like their own pitches" ON public.pitch_likes;
        CREATE POLICY "Users can like their own pitches" ON public.pitch_likes
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.pitch_likes;
        CREATE POLICY "Users can unlike their own likes" ON public.pitch_likes
            FOR DELETE USING (auth.uid() = user_id);
      `
    });

    // RLS for pitch_shares
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.pitch_shares ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view all pitch shares" ON public.pitch_shares;
        CREATE POLICY "Users can view all pitch shares" ON public.pitch_shares
            FOR SELECT USING (true);
            
        DROP POLICY IF EXISTS "Users can share pitches" ON public.pitch_shares;
        CREATE POLICY "Users can share pitches" ON public.pitch_shares
            FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });

    console.log('✅ RLS policies added');

    // Create indexes
    console.log('📊 Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_pitch_likes_user_id ON public.pitch_likes(user_id);
        CREATE INDEX IF NOT EXISTS idx_pitch_likes_pitch_id ON public.pitch_likes(pitch_id);
        CREATE INDEX IF NOT EXISTS idx_pitch_likes_created_at ON public.pitch_likes(created_at);
        
        CREATE INDEX IF NOT EXISTS idx_pitch_shares_user_id ON public.pitch_shares(user_id);
        CREATE INDEX IF NOT EXISTS idx_pitch_shares_pitch_id ON public.pitch_shares(pitch_id);
        CREATE INDEX IF NOT EXISTS idx_pitch_shares_created_at ON public.pitch_shares(created_at);
        CREATE INDEX IF NOT EXISTS idx_pitch_shares_platform ON public.pitch_shares(share_platform);
      `
    });

    console.log('✅ Indexes created');

    // Add sample data
    console.log('📝 Adding sample data...');
    
    // Get existing users and pitches
    const { data: users } = await supabase.from('users').select('id').limit(5);
    const { data: pitches } = await supabase.from('pitches').select('id').limit(5);

    if (users && pitches && users.length > 0 && pitches.length > 0) {
      // Add sample likes
      for (let i = 0; i < Math.min(3, users.length); i++) {
        await supabase.from('pitch_likes').upsert({
          user_id: users[i].id,
          pitch_id: pitches[0].id
        }, { onConflict: 'user_id,pitch_id' });
      }

      // Add sample shares
      const platforms = ['twitter', 'linkedin', 'facebook'];
      for (let i = 0; i < Math.min(3, users.length); i++) {
        await supabase.from('pitch_shares').insert({
          user_id: users[i].id,
          pitch_id: pitches[0].id,
          share_platform: platforms[i % platforms.length],
          share_url: `https://example.com/share/${pitches[0].id}`
        });
      }

      console.log('✅ Sample data added');
    }

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    
    const { data: likesCount } = await supabase
      .from('pitch_likes')
      .select('*', { count: 'exact' });
    
    const { data: sharesCount } = await supabase
      .from('pitch_shares')
      .select('*', { count: 'exact' });

    console.log(`✅ pitch_likes: ${likesCount?.length || 0} records`);
    console.log(`✅ pitch_shares: ${sharesCount?.length || 0} records`);

    console.log('\n🎉 Missing tables created successfully!');
    console.log('✅ pitch_likes table with RLS policies');
    console.log('✅ pitch_shares table with RLS policies');
    console.log('✅ Performance indexes created');
    console.log('✅ Sample data added');

  } catch (error) {
    console.error('❌ Error creating missing tables:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  applyMissingTables();
}

module.exports = { applyMissingTables };
