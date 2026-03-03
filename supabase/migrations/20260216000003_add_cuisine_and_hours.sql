-- Migration: 003_add_cuisine_and_hours
-- Description: Add cuisine and operating_hours to restaurants
-- Created: 2026-02-21

ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS cuisine TEXT,
ADD COLUMN IF NOT EXISTS operating_hours JSONB;

-- Seed some sample data for cuisines if needed
UPDATE public.restaurants SET cuisine = 'Middle Eastern' WHERE name ILIKE '%Mediterranean%' OR name ILIKE '%Halal%' OR name ILIKE '%Turkish%';
UPDATE public.restaurants SET cuisine = 'American' WHERE name ILIKE '%Burger%' OR name ILIKE '%Chicken%' OR name ILIKE '%Fry%';
UPDATE public.restaurants SET cuisine = 'Italian' WHERE name ILIKE '%Pizza%';
UPDATE public.restaurants SET cuisine = 'Indian' WHERE name ILIKE '%Indian%' OR name ILIKE '%Curry%';
UPDATE public.restaurants SET cuisine = 'Chinese' WHERE name ILIKE '%Noodle%' OR name ILIKE '%Wok%';
