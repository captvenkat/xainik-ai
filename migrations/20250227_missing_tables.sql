-- =====================================================
-- MISSING TABLES MIGRATION
-- Xainik Platform - Professional Implementation
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. VETERANS PROFILE TABLE
-- =====================================================

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

-- =====================================================
-- 2. RECRUITERS PROFILE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.recruiters (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. SUPPORTERS PROFILE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.supporters (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    intro TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. NOTIFICATION PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notification_prefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- =====================================================
-- 5. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- =====================================================
-- 6. SERVICE PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.service_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- =====================================================
-- 7. USER SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.service_plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Veterans indexes
CREATE INDEX IF NOT EXISTS idx_veterans_user_id ON public.veterans(user_id);
CREATE INDEX IF NOT EXISTS idx_veterans_service_branch ON public.veterans(service_branch);
CREATE INDEX IF NOT EXISTS idx_veterans_location ON public.veterans(location_current);

-- Recruiters indexes
CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON public.recruiters(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_company ON public.recruiters(company_name);

-- Supporters indexes
CREATE INDEX IF NOT EXISTS idx_supporters_user_id ON public.supporters(user_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON public.notification_prefs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Service plans indexes
CREATE INDEX IF NOT EXISTS idx_service_plans_plan_code ON public.service_plans(plan_code);
CREATE INDEX IF NOT EXISTS idx_service_plans_is_active ON public.service_plans(is_active);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON public.user_subscriptions(end_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.veterans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Veterans: owner can manage own profile
CREATE POLICY "Veterans can manage own profile" ON public.veterans
    FOR ALL USING (auth.uid() = user_id);

-- Recruiters: owner can manage own profile
CREATE POLICY "Recruiters can manage own profile" ON public.recruiters
    FOR ALL USING (auth.uid() = user_id);

-- Supporters: owner can manage own profile
CREATE POLICY "Supporters can manage own profile" ON public.supporters
    FOR ALL USING (auth.uid() = user_id);

-- Notification preferences: owner can manage own
CREATE POLICY "Users can manage own notification prefs" ON public.notification_prefs
    FOR ALL USING (auth.uid() = user_id);

-- Notifications: owner can view and update own
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Service plans: public read access
CREATE POLICY "Public can view service plans" ON public.service_plans
    FOR SELECT USING (is_active = true);

-- User subscriptions: owner can manage own
CREATE POLICY "Users can manage own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_veterans_updated_at BEFORE UPDATE ON public.veterans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiters_updated_at BEFORE UPDATE ON public.recruiters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supporters_updated_at BEFORE UPDATE ON public.supporters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON public.notification_prefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_plans_updated_at BEFORE UPDATE ON public.service_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default service plans
INSERT INTO public.service_plans (plan_code, plan_name, description, price_cents, currency, duration_days, features) VALUES
('free', 'Free Plan', 'Basic access to platform features', 0, 'INR', NULL, '{"max_pitches": 1, "basic_analytics": true}'),
('premium', 'Premium Plan', 'Enhanced features for serious job seekers', 29900, 'INR', 365, '{"max_pitches": 5, "advanced_analytics": true, "priority_support": true, "resume_sharing": true}'),
('enterprise', 'Enterprise Plan', 'Full platform access for recruiters', 99900, 'INR', 365, '{"unlimited_pitches": true, "recruiter_tools": true, "advanced_search": true, "priority_support": true}')
ON CONFLICT (plan_code) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log successful migration
INSERT INTO public.migration_audit (migration_name, status, details) VALUES (
    '20250227_missing_tables',
    'completed',
    '{"tables_created": 7, "indexes_created": 15, "policies_created": 10, "triggers_created": 7}'
);
