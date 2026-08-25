-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya — RLS Fix Patch
-- Run this in Supabase SQL Editor AFTER the initial 001_init.sql
-- This fixes missing INSERT policies and adds order_items INSERT permission
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── profiles: allow INSERT (needed for signup trigger + upsert) ─────────────
-- Drop if exists to avoid duplicate policy errors
DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;
CREATE POLICY "profiles: own insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── order_items: allow INSERT (needed when placing an order) ────────────────
DROP POLICY IF EXISTS "order_items: own insert" ON public.order_items;
CREATE POLICY "order_items: own insert" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ─── order_items: fix SELECT policy (re-create with IF EXISTS guard) ─────────
DROP POLICY IF EXISTS "order_items: via order" ON public.order_items;
CREATE POLICY "order_items: via order" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ─── orders: allow UPDATE (for status changes later) ─────────────────────────
DROP POLICY IF EXISTS "orders: own update" ON public.orders;
CREATE POLICY "orders: own update" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── Verify all policies ─────────────────────────────────────────────────────
-- Run this SELECT to confirm all policies are in place:
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
