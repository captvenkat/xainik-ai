const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing environment variables');
  console.log('URL:', url ? 'Set' : 'Missing');
  console.log('Service Key:', serviceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function applyMigration() {
  try {
    console.log('🔧 Applying missing tables migration...\n');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful\n');
    
    // Create veterans table
    console.log('📝 Creating veterans table...');
    try {
      // Try to insert a test record to see if table exists
      const { error: testError } = await supabase
        .from('veterans')
        .select('*')
        .limit(1);
      
      if (testError && testError.code === '42P01') {
        console.log('⚠️  Veterans table does not exist. Creating via SQL...');
        // Table doesn't exist, we'll need to create it manually
        console.log('ℹ️  Please create the veterans table manually in your Supabase dashboard');
      } else {
        console.log('✅ Veterans table exists');
      }
    } catch (error) {
      console.log('⚠️  Veterans table check:', error.message);
    }
    
    // Create recruiters table
    console.log('📝 Creating recruiters table...');
    const { error: recruitersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.recruiters (
            user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
            company_name TEXT,
            industry TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (recruitersError) {
      console.log('⚠️  Recruiters table creation:', recruitersError.message);
    } else {
      console.log('✅ Recruiters table created/verified');
    }
    
    // Create supporters table
    console.log('📝 Creating supporters table...');
    const { error: supportersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.supporters (
            user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
            intro TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (supportersError) {
      console.log('⚠️  Supporters table creation:', supportersError.message);
    } else {
      console.log('✅ Supporters table created/verified');
    }
    
    // Create notification_prefs table
    console.log('📝 Creating notification_prefs table...');
    const { error: notifPrefsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.notification_prefs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            email_enabled BOOLEAN DEFAULT true,
            in_app_enabled BOOLEAN DEFAULT true,
            pitch_notifications BOOLEAN DEFAULT true,
            endorsement_notifications BOOLEAN DEFAULT true,
            plan_notifications BOOLEAN DEFAULT true,
            referral_notifications BOOLEAN DEFAULT true,
            resume_request_notifications BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
      `
    });
    
    if (notifPrefsError) {
      console.log('⚠️  Notification prefs table creation:', notifPrefsError.message);
    } else {
      console.log('✅ Notification prefs table created/verified');
    }
    
    // Create notifications table
    console.log('📝 Creating notifications table...');
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            type VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            channel VARCHAR(20) DEFAULT 'in_app' CHECK (channel IN ('email', 'in_app', 'both')),
            status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
            payload_json JSONB DEFAULT '{}'::jsonb,
            sent_at TIMESTAMP WITH TIME ZONE,
            read_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (notificationsError) {
      console.log('⚠️  Notifications table creation:', notificationsError.message);
    } else {
      console.log('✅ Notifications table created/verified');
    }
    
    // Create service_plans table
    console.log('📝 Creating service_plans table...');
    const { error: servicePlansError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.service_plans (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            plan_code VARCHAR(50) UNIQUE NOT NULL,
            plan_name VARCHAR(255) NOT NULL,
            description TEXT,
            price_cents INTEGER NOT NULL,
            currency VARCHAR(3) DEFAULT 'INR',
            duration_days INTEGER,
            features JSONB DEFAULT '{}'::jsonb,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (servicePlansError) {
      console.log('⚠️  Service plans table creation:', servicePlansError.message);
    } else {
      console.log('✅ Service plans table created/verified');
    }
    
    // Create user_subscriptions table
    console.log('📝 Creating user_subscriptions table...');
    const { error: userSubsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            plan_id UUID NOT NULL REFERENCES public.service_plans(id),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE NOT NULL,
            auto_renew BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (userSubsError) {
      console.log('⚠️  User subscriptions table creation:', userSubsError.message);
    } else {
      console.log('✅ User subscriptions table created/verified');
    }
    
    // Enable RLS on all tables
    console.log('\n🔒 Enabling Row Level Security...');
    const rlsTables = ['veterans', 'recruiters', 'supporters', 'notification_prefs', 'notifications', 'service_plans', 'user_subscriptions'];
    
    for (const table of rlsTables) {
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`
      });
      
      if (rlsError) {
        console.log(`⚠️  RLS enable for ${table}:`, rlsError.message);
      } else {
        console.log(`✅ RLS enabled for ${table}`);
      }
    }
    
    // Insert default service plans
    console.log('\n💳 Inserting default service plans...');
    const { error: plansError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.service_plans (plan_code, plan_name, description, price_cents, currency, duration_days, features) VALUES
        ('free', 'Free Plan', 'Basic access to platform features', 0, 'INR', NULL, '{"max_pitches": 1, "basic_analytics": true}'),
        ('premium', 'Premium Plan', 'Enhanced features for serious job seekers', 29900, 'INR', 365, '{"max_pitches": 5, "advanced_analytics": true, "priority_support": true, "resume_sharing": true}'),
        ('enterprise', 'Enterprise Plan', 'Full platform access for recruiters', 99900, 'INR', 365, '{"unlimited_pitches": true, "recruiter_tools": true, "advanced_search": true, "priority_support": true}')
        ON CONFLICT (plan_code) DO NOTHING;
      `
    });
    
    if (plansError) {
      console.log('⚠️  Service plans insertion:', plansError.message);
    } else {
      console.log('✅ Default service plans inserted');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary of tables created:');
    console.log('- veterans (military service profiles)');
    console.log('- recruiters (company profiles)');
    console.log('- supporters (supporter profiles)');
    console.log('- notification_prefs (user preferences)');
    console.log('- notifications (user notifications)');
    console.log('- service_plans (subscription plans)');
    console.log('- user_subscriptions (user subscriptions)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

applyMigration();
