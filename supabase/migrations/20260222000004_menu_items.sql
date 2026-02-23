-- Migration: 004_menu_items
-- Description: Add menu_items table for restaurant menus
-- Created: 2026-02-22

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'Most Ordered',
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    is_deal BOOLEAN NOT NULL DEFAULT FALSE,
    deal_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast restaurant-based lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(restaurant_id, category);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view menu items for approved restaurants
CREATE POLICY "Anyone can view menu items" ON public.menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = restaurant_id AND r.status = 'approved'
        )
    );

-- Only authenticated users (restaurant owners or admins) can insert/update/delete
CREATE POLICY "Authenticated users can manage menu items" ON public.menu_items
    FOR ALL USING (auth.role() = 'authenticated');
