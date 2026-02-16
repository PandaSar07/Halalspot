-- Migration: 002_row_level_security
-- Description: Enable RLS and create security policies
-- Created: 2026-02-16

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view all profiles
CREATE POLICY "Users can view all profiles"
  ON public.users
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RESTAURANTS TABLE POLICIES
-- ============================================

-- Anyone can view approved restaurants
CREATE POLICY "Anyone can view approved restaurants"
  ON public.restaurants
  FOR SELECT
  USING (status = 'approved' OR created_by = auth.uid());

-- Authenticated users can create restaurants (pending approval)
CREATE POLICY "Authenticated users can create restaurants"
  ON public.restaurants
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND created_by = auth.uid()
    AND status = 'pending'
  );

-- Users can update their own pending restaurants
CREATE POLICY "Users can update own pending restaurants"
  ON public.restaurants
  FOR UPDATE
  USING (
    auth.uid() = created_by 
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = created_by 
    AND status = 'pending'
  );

-- Users can delete their own pending restaurants
CREATE POLICY "Users can delete own pending restaurants"
  ON public.restaurants
  FOR DELETE
  USING (
    auth.uid() = created_by 
    AND status = 'pending'
  );

-- Note: Admin approval of restaurants will be handled via service role key
-- or a separate admin dashboard with elevated permissions

-- ============================================
-- REVIEWS TABLE POLICIES
-- ============================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FAVORITES TABLE POLICIES
-- ============================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "Users can create own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);
