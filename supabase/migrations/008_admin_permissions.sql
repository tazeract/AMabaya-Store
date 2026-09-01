-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya — Admin and Public Permissions Fix
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)
-- This grants necessary permissions for products, orders, and storefront syncing.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Grant table access to anon and authenticated roles
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.orders TO anon, authenticated;
GRANT ALL ON public.order_items TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- 2. Ensure RLS policies allow full access for products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products: public select" ON public.products;
CREATE POLICY "products: public select" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "products: public insert" ON public.products;
CREATE POLICY "products: public insert" ON public.products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "products: public update" ON public.products;
CREATE POLICY "products: public update" ON public.products
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "products: public delete" ON public.products;
CREATE POLICY "products: public delete" ON public.products
  FOR DELETE USING (true);

-- 3. Orders policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders: allow all select" ON public.orders;
CREATE POLICY "orders: allow all select" ON public.orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "orders: allow all insert" ON public.orders;
CREATE POLICY "orders: allow all insert" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "orders: allow all update" ON public.orders;
CREATE POLICY "orders: allow all update" ON public.orders
  FOR UPDATE USING (true);
