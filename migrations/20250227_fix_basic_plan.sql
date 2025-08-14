-- =====================================================
-- FIX BASIC PLAN PRICE
-- =====================================================
-- 
-- This script fixes the Basic Plan price to ₹1
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Update the Basic Plan price to ₹1 (100 cents)
UPDATE public.service_plans 
SET price_cents = 100, 
    updated_at = NOW()
WHERE plan_code = 'basic';

-- Verify the fix
SELECT plan_code, plan_name, price_cents, currency FROM public.service_plans WHERE plan_code = 'basic';

-- Show all plans for verification
SELECT plan_code, plan_name, price_cents, currency FROM public.service_plans ORDER BY price_cents;
