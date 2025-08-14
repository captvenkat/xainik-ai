-- =====================================================
-- FIX SERVICE PLANS TO CORRECT 4-TIER PRICING
-- =====================================================
-- 
-- This script updates service plans to match the correct pricing structure:
-- 1. Trial (14-Day): ₹1
-- 2. 30-Day Plan: ₹299
-- 3. 60-Day Plan: ₹499  
-- 4. 90-Day Plan: ₹599
-- =====================================================

-- Clear existing service plans
DELETE FROM public.service_plans;

-- Insert correct 4-tier pricing structure
INSERT INTO public.service_plans (plan_code, plan_name, description, price_cents, currency, duration_days, features) VALUES
('trial_14', '14-Day Trial', 'Perfect for testing the platform', 100, 'INR', 14, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "email_support": true}'),
('plan_30', '30-Day Plan', 'Most popular choice', 29900, 'INR', 30, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "priority_support": true, "resume_request_feature": true}'),
('plan_60', '60-Day Plan', 'Better value for longer searches', 49900, 'INR', 60, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "priority_support": true, "resume_request_feature": true, "featured_placement": true}'),
('plan_90', '90-Day Plan', 'Best value for extended visibility', 59900, 'INR', 90, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "priority_support": true, "resume_request_feature": true, "featured_placement": true, "direct_messaging": true}')
ON CONFLICT (plan_code) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    description = EXCLUDED.description,
    price_cents = EXCLUDED.price_cents,
    duration_days = EXCLUDED.duration_days,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Verify the fix
SELECT plan_code, plan_name, price_cents, currency, duration_days FROM public.service_plans ORDER BY price_cents;
