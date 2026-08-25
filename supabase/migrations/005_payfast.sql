-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya — PayFast + Order Status Update
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Add 'paid' and 'pending_payment' to order status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_payment';

-- Add PayFast payment fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payfast_payment_id  TEXT,
  ADD COLUMN IF NOT EXISTS payment_status      TEXT DEFAULT 'pending';

-- Supabase Storage bucket for product images (run only once)
-- Go to Supabase → Storage → New bucket → name: "products" → Public: ON
-- Then add this policy:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true)
-- ON CONFLICT DO NOTHING;

-- Grant storage access for authenticated users (product image uploads from admin)
-- Note: Storage policies are managed in Supabase Dashboard → Storage → Policies
