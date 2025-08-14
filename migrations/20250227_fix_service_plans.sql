-- =====================================================
-- FIX SERVICE PLANS DATA
-- =====================================================
-- 
-- This script fixes the service_plans table data
-- Run this after the main migration if you encounter the NULL constraint error
-- =====================================================

-- First, let's check what's in the service_plans table
SELECT * FROM public.service_plans;

-- Update the free plan to have duration_days = 0 instead of NULL
UPDATE public.service_plans 
SET duration_days = 0 
WHERE plan_code = 'free' AND duration_days IS NULL;

-- Verify the fix
SELECT plan_code, plan_name, duration_days FROM public.service_plans;

-- If you want to allow NULL for free plans, you can also run this:
-- ALTER TABLE public.service_plans ALTER COLUMN duration_days DROP NOT NULL;
