-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya Migration 006: Cart data column + product table enhancements
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add cart_data column to profiles (stores cart as JSON for logged-in users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cart_data TEXT DEFAULT NULL;

-- 2. Fix products table: add missing columns needed by admin panel
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subtitle TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS long_description TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS care_instructions TEXT[] DEFAULT '{}';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS model_path TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS original_price INTEGER;

-- Update sizes column to support JSONB (size objects with label + available)
-- First check if sizes is TEXT[] and convert if needed
DO $$
BEGIN
  -- Add sizes_json column for structured size data
  ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS sizes_json JSONB DEFAULT '[]';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Allow products to be inserted/updated by authenticated users (admin)
-- NOTE: In production, restrict this to admin role only.
-- For now, we allow authenticated users (protected by admin password in UI).
DROP POLICY IF EXISTS "products: authenticated write" ON public.products;
CREATE POLICY "products: authenticated write"
  ON public.products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Add Supabase Storage bucket for product images
-- Run this separately in Supabase Dashboard > Storage > New Bucket
-- Bucket name: product-images, Public: true
-- OR run via the Supabase MCP/API

-- 5. Fix payment_method constraint to include 'online_payment'
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cod', 'bank_transfer', 'online_payment'));

-- 6. Ensure products category includes 'Accessories'  
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('Abaya', 'Kaftan', 'Dupatta', 'Accessories', 'Set'));

COMMENT ON COLUMN public.profiles.cart_data IS 'JSON serialized cart items for logged-in users. Synced from client on cart changes.';
