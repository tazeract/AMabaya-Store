-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya — GRANTS Fix
-- Run this in Supabase SQL Editor if you see "permission denied for table X"
-- RLS policies alone are not enough — PostgreSQL-level GRANTs are also needed.
-- ─────────────────────────────────────────────────────────────────────────────

-- Grant schema usage to both roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- orders: logged-in users can insert their own + read their own (RLS enforces ownership)
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

-- order_items: logged-in users can insert + read (RLS enforces via order ownership)
GRANT SELECT, INSERT ON public.order_items TO authenticated;

-- profiles: logged-in users can read/write their own row
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- products: public read
GRANT SELECT ON public.products TO anon, authenticated;

-- cart_items: logged-in users only
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;

-- Verify with:
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
-- ORDER BY table_name, grantee;
