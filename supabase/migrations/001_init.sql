-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya — Supabase Database Schema
-- Run this once in your Supabase project SQL Editor:
-- https://supabase.com/dashboard → your project → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (already enabled in most Supabase projects)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ───────────────────────────────────────────────────────────────
-- Extends Supabase auth.users. One row per user.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  addresses   JSONB[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Products ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('Abaya', 'Kaftan', 'Dupatta', 'Set')),
  price         INTEGER NOT NULL,       -- in PKR (no decimals)
  original_price INTEGER,
  description   TEXT,
  images        TEXT[] DEFAULT '{}',
  sizes         TEXT[] DEFAULT '{}',
  stock         INTEGER DEFAULT 0,
  is_new        BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  slug          TEXT UNIQUE NOT NULL,
  sku           TEXT,
  material      TEXT,
  rating        NUMERIC(3,2) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Orders ─────────────────────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM ('placed', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           order_status DEFAULT 'placed' NOT NULL,
  total            INTEGER NOT NULL,
  shipping_cost    INTEGER DEFAULT 0,
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer')),
  tracking_code    TEXT,
  notes            TEXT,
  shipping_address JSONB NOT NULL,
  placed_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Order Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL,  -- Frozen copy of product at time of purchase
  quantity    INTEGER NOT NULL DEFAULT 1,
  size        TEXT,
  color       TEXT,
  unit_price  INTEGER NOT NULL
);

-- ─── Cart Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size        TEXT,
  color       TEXT,
  added_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, product_id, size, color)
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

-- Profiles: users can read/write only their own row
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: own read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products: public read only
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products: public read" ON public.products FOR SELECT TO anon, authenticated USING (true);

-- Orders: users can only see their own orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders: own read"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders: own insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: accessible via order ownership
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items: via order" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Cart Items: users can read/write only their own cart
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart: own read"   ON public.cart_items FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "cart: own insert" ON public.cart_items FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart: own update" ON public.cart_items FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "cart: own delete" ON public.cart_items FOR DELETE  USING (auth.uid() = user_id);
