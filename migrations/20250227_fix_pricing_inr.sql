-- =====================================================
-- FIX PRICING TO CORRECT INR AMOUNTS
-- =====================================================
-- 
-- This script fixes the pricing to show correct INR amounts:
-- 1. Free Plan: ₹0
-- 2. Trial (14-Day): ₹1
-- 3. 30-Day Plan: ₹299
-- 4. 60-Day Plan: ₹499
-- 5. 90-Day Plan: ₹599
-- =====================================================

-- First, let's allow NULL for duration_days (since free plans don't expire)
ALTER TABLE public.service_plans ALTER COLUMN duration_days DROP NOT NULL;

-- Clear existing service plans
DELETE FROM public.service_plans;

-- Insert correct pricing structure with INR amounts (not cents)
INSERT INTO public.service_plans (plan_code, plan_name, description, price_cents, currency, duration_days, features) VALUES
('free', 'Free Plan', 'Access to platform with unpublished pitches', 0, 'INR', NULL, '{"platform_access": true, "profile_editing": true, "supporter_invites": true, "pitch_creation": true, "pitch_unpublished": true}'),
('trial_14', '14-Day Trial', 'Perfect for testing the platform', 1, 'INR', 14, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "email_support": true}'),
('plan_30', '30-Day Plan', 'Most popular choice', 299, 'INR', 30, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "email_support": true, "resume_request_feature": true}'),
('plan_60', '60-Day Plan', 'Better value for longer searches', 499, 'INR', 60, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "email_support": true, "resume_request_feature": true, "featured_placement": true}'),
('plan_90', '90-Day Plan', 'Best value for extended visibility', 599, 'INR', 90, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "email_support": true, "resume_request_feature": true, "featured_placement": true, "direct_messaging": true}');

-- Verify the fix
SELECT plan_code, plan_name, price_cents, currency, duration_days FROM public.service_plans ORDER BY price_cents;
