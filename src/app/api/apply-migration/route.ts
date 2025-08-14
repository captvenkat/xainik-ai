import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Apply migration
    const migrationSQL = `
      -- Create veterans table
      CREATE TABLE IF NOT EXISTS public.veterans (
          user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
          rank TEXT,
          service_branch TEXT,
          years_experience INTEGER,
          location_current TEXT,
          locations_preferred TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create recruiters table
      CREATE TABLE IF NOT EXISTS public.recruiters (
          user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
          company_name TEXT,
          industry TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create supporters table
      CREATE TABLE IF NOT EXISTS public.supporters (
          user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
          intro TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create notification_prefs table
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
      
      -- Create notifications table
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
      
      -- Create service_plans table
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
      
      -- Create user_subscriptions table
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
      
      -- Enable RLS on all tables
      ALTER TABLE public.veterans ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies
      DROP POLICY IF EXISTS "Veterans can manage own profile" ON public.veterans;
      CREATE POLICY "Veterans can manage own profile" ON public.veterans
          FOR ALL USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Recruiters can manage own profile" ON public.recruiters;
      CREATE POLICY "Recruiters can manage own profile" ON public.recruiters
          FOR ALL USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Supporters can manage own profile" ON public.supporters;
      CREATE POLICY "Supporters can manage own profile" ON public.supporters
          FOR ALL USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can manage own notification prefs" ON public.notification_prefs;
      CREATE POLICY "Users can manage own notification prefs" ON public.notification_prefs
          FOR ALL USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
      CREATE POLICY "Users can view own notifications" ON public.notifications
          FOR SELECT USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
      CREATE POLICY "Users can update own notifications" ON public.notifications
          FOR UPDATE USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Public can view service plans" ON public.service_plans;
      CREATE POLICY "Public can view service plans" ON public.service_plans
          FOR SELECT USING (is_active = true);
      
      DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.user_subscriptions;
      CREATE POLICY "Users can manage own subscriptions" ON public.user_subscriptions
          FOR ALL USING (auth.uid() = user_id);
      
      -- Insert default service plans
      INSERT INTO public.service_plans (plan_code, plan_name, description, price_cents, currency, duration_days, features) VALUES
      ('free', 'Free Plan', 'Basic access to platform features', 0, 'INR', NULL, '{"max_pitches": 1, "basic_analytics": true}'),
      ('premium', 'Premium Plan', 'Enhanced features for serious job seekers', 29900, 'INR', 365, '{"max_pitches": 5, "advanced_analytics": true, "priority_support": true, "resume_sharing": true}'),
      ('enterprise', 'Enterprise Plan', 'Full platform access for recruiters', 99900, 'INR', 365, '{"unlimited_pitches": true, "recruiter_tools": true, "advanced_search": true, "priority_support": true}')
      ON CONFLICT (plan_code) DO NOTHING;
    `;
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration applied successfully',
      tables_created: [
        'veterans',
        'recruiters', 
        'supporters',
        'notification_prefs',
        'notifications',
        'service_plans',
        'user_subscriptions'
      ]
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
