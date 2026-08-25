-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya — Products Table Schema Update + Seed
-- Run in Supabase SQL Editor (New query → paste → Run)
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Add missing columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subtitle          TEXT,
  ADD COLUMN IF NOT EXISTS long_description  TEXT,
  ADD COLUMN IF NOT EXISTS tags              TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sizes             JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS colors            JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stock             JSONB    DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured          BOOLEAN  DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS model_path        TEXT;

-- Note: 'sizes' column type needs to change from TEXT[] to JSONB
-- Safe approach: drop and re-add (only if column exists as TEXT[])
DO $$
BEGIN
  -- Check if sizes column is TEXT[] and convert to JSONB
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sizes'
    AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE public.products DROP COLUMN IF EXISTS sizes;
    ALTER TABLE public.products ADD COLUMN sizes JSONB DEFAULT '[]'::jsonb;
  END IF;
  -- Same for stock: was INTEGER, now JSONB
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock'
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE public.products DROP COLUMN IF EXISTS stock;
    ALTER TABLE public.products ADD COLUMN stock JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Step 2: Seed all 6 products (UPSERT — safe to re-run)
INSERT INTO public.products (
  slug, name, subtitle, description, long_description,
  price, original_price, category, tags,
  sizes, colors, images, sku, featured, is_new, is_bestseller,
  stock, material, care_instructions, rating, review_count, created_at
)
VALUES

(
  'classic-noir-abaya',
  'Classic Noir Abaya',
  'Timeless Elegance Redefined',
  'A stunning full-length abaya in the deepest shade of midnight black, tailored to perfection with subtle gold thread embroidery at the cuffs.',
  'The Classic Noir Abaya is AMabaya''s signature piece — a full-length, flowing silhouette crafted from premium Korean Nida fabric.',
  4500, 5500, 'Abaya',
  ARRAY['bestseller','eid','formal','gold-embroidery'],
  '[{"label":"S","measurements":"Bust: 34-36\" | Length: 56\""},{"label":"M","measurements":"Bust: 36-38\" | Length: 57\""},{"label":"L","measurements":"Bust: 38-40\" | Length: 58\""},{"label":"XL","measurements":"Bust: 40-42\" | Length: 59\""},{"label":"XXL","measurements":"Bust: 42-44\" | Length: 60\""}]'::jsonb,
  '[{"name":"Midnight Black","hex":"#0A0A0A"},{"name":"Charcoal Grey","hex":"#36454F"},{"name":"Deep Navy","hex":"#1B2A4A"}]'::jsonb,
  ARRAY['/products/classic-noir-abaya/image-1.jpg'],
  'AMA-001-BLK', true, false, true,
  '{"S-Midnight Black":5,"M-Midnight Black":8,"L-Midnight Black":3,"XL-Midnight Black":2,"S-Charcoal Grey":4,"M-Charcoal Grey":6}'::jsonb,
  '100% Premium Korean Nida Fabric',
  ARRAY['Dry clean only','Do not bleach','Store hanging to preserve shape','Iron on low heat with cloth barrier'],
  4.9, 247, '2024-01-15'
),

(
  'royal-zahra-kaftan',
  'Royal Zahra Kaftan',
  'Heritage Craft Meets Modern Grace',
  'An opulent full-length kaftan in rich burgundy with hand-embroidered zardozi borders and a flowing bell silhouette.',
  'The Royal Zahra Kaftan is a masterpiece of traditional Pakistani craftsmanship modernized for the contemporary woman. Hand-embroidered zardozi gold and silver threadwork frames the neckline, sleeves, and hem in intricate floral motifs.',
  7200, 9000, 'Kaftan',
  ARRAY['new-arrival','wedding','zardozi','premium'],
  '[{"label":"S","measurements":"Bust: 34-36\" | Length: 58\""},{"label":"M","measurements":"Bust: 36-38\" | Length: 59\""},{"label":"L","measurements":"Bust: 38-40\" | Length: 60\""},{"label":"XL","measurements":"Bust: 40-42\" | Length: 61\""},{"label":"Free Size","measurements":"Fits Bust: 34-44\" | Length: 60\""}]'::jsonb,
  '[{"name":"Royal Burgundy","hex":"#6D1A36"},{"name":"Emerald Green","hex":"#1B4332"},{"name":"Champagne Gold","hex":"#C9A84C"}]'::jsonb,
  ARRAY['/products/royal-zahra-kaftan/image-1.jpg'],
  'AMA-002-BRG', true, true, false,
  '{"S-Royal Burgundy":3,"M-Royal Burgundy":5,"L-Royal Burgundy":4,"Free Size-Royal Burgundy":8,"Free Size-Emerald Green":6}'::jsonb,
  'Chiffon-Silk Blend with Zardozi Embroidery',
  ARRAY['Dry clean only','Handle embroidery with extreme care','Store flat or hanging in garment bag'],
  4.8, 89, '2024-03-01'
),

(
  'pearl-embroidered-dupatta',
  'Pearl Embroidered Dupatta',
  'The Crown of Every Ensemble',
  'Delicate hand-stitched pearl and sequin embroidery adorns this ethereal chiffon dupatta — the perfect finishing touch for any Pakistani outfit.',
  'The Pearl Embroidered Dupatta features thousands of hand-applied freshwater pearl beads and gold sequins in a cascading floral pattern.',
  2800, 3500, 'Dupatta',
  ARRAY['bridal','pearl','chiffon','accessory'],
  '[{"label":"Free Size","measurements":"Width: 42\" | Length: 108\""}]'::jsonb,
  '[{"name":"Ivory White","hex":"#FFFFF0"},{"name":"Blush Pink","hex":"#FFB6C1"},{"name":"Soft Sage","hex":"#B2C9B2"},{"name":"Sky Blue","hex":"#87CEEB"}]'::jsonb,
  ARRAY['/products/pearl-embroidered-dupatta/image-1.jpg'],
  'AMA-003-IVR', true, true, false,
  '{"Free Size-Ivory White":15,"Free Size-Blush Pink":12,"Free Size-Soft Sage":8,"Free Size-Sky Blue":7}'::jsonb,
  'Imported Chiffon with Hand-applied Pearl & Sequin Embroidery',
  ARRAY['Hand wash gently in cold water','Do not scrub embroidery','Dry flat in shade'],
  4.7, 156, '2024-02-10'
),

(
  'emerald-velvet-abaya',
  'Emerald Velvet Abaya',
  'Statement Luxury for Winter Celebrations',
  'A breathtaking micro-velvet abaya in rich emerald green with a silk lining and subtle self-embossed pattern.',
  'Designed for cooler celebrations and winter weddings, the Emerald Velvet Abaya features premium imported micro-velvet fabric with a luxuriously smooth silk inner lining.',
  5800, 7200, 'Abaya',
  ARRAY['velvet','winter','festive','new'],
  '[{"label":"S","measurements":"Bust: 34-36\" | Length: 56\""},{"label":"M","measurements":"Bust: 36-38\" | Length: 57\""},{"label":"L","measurements":"Bust: 38-40\" | Length: 58\""},{"label":"XL","measurements":"Bust: 40-42\" | Length: 59\""}]'::jsonb,
  '[{"name":"Emerald Green","hex":"#0F4D3A"},{"name":"Midnight Noir","hex":"#0D0D0D"},{"name":"Royal Maroon","hex":"#4A0E17"}]'::jsonb,
  ARRAY['/products/classic-noir-abaya/image-1.jpg'],
  'AMA-004-EMR', true, true, true,
  '{"S-Emerald Green":4,"M-Emerald Green":7,"L-Emerald Green":5,"XL-Emerald Green":2}'::jsonb,
  'Imported Micro-Velvet with Pure Silk Lining',
  ARRAY['Dry clean only','Steam iron inside out','Keep away from direct sunlight'],
  5.0, 189, '2024-02-10'
),

(
  'ivory-zari-kaftan',
  'Ivory Zari Silk Kaftan',
  'Ethereal Raw Silk with Antique Gold Zari',
  'Flowing raw silk kaftan in pure ivory with shimmering antique gold tilla border and delicate pearl tassel neckline.',
  'Designed for effortless elegance, the Ivory Zari Silk Kaftan combines comfortable airy drapes with royal Pakistani formal aesthetics.',
  6800, 8200, 'Kaftan',
  ARRAY['silk','zari','ivory','festive','new'],
  '[{"label":"Free Size","measurements":"Bust: Up to 48\" | Length: 56\""}]'::jsonb,
  '[{"name":"Pure Ivory","hex":"#F9F6EE"},{"name":"Champagne Gold","hex":"#E5D3B3"},{"name":"Rose Dust","hex":"#D8A499"}]'::jsonb,
  ARRAY['/products/royal-zahra-kaftan/image-1.jpg'],
  'AMA-005-IVR', true, true, false,
  '{"Free Size-Pure Ivory":9,"Free Size-Champagne Gold":5,"Free Size-Rose Dust":4}'::jsonb,
  'Pure Korean Raw Silk with Zari Border',
  ARRAY['Dry clean only','Do not spray perfume directly on embroidery','Iron on silk setting'],
  4.85, 112, '2024-02-18'
),

(
  'organza-luxe-dupatta',
  'Regal Organza Scalloped Dupatta',
  'Cutwork Scallop Border with Gota & Pearls',
  'Ultra-light crystalline organza dupatta featuring intricate 4-sided cutwork scalloped borders and hand-applied pearl spray.',
  'The perfect crowning statement for your luxury abayas and formal kaftans. Made from feather-light Pakistani organza.',
  3200, 4000, 'Dupatta',
  ARRAY['organza','scallop','pearls','bestseller'],
  '[{"label":"Free Size","measurements":"Length: 2.75 Yards | Width: 42\""}]'::jsonb,
  '[{"name":"Pearl White","hex":"#FFFFFF"},{"name":"Midnight Black","hex":"#111111"},{"name":"Soft Sage","hex":"#B2C2B2"}]'::jsonb,
  ARRAY['/products/pearl-embroidered-dupatta/image-1.jpg'],
  'AMA-006-ORG', true, false, true,
  '{"Free Size-Pearl White":15,"Free Size-Midnight Black":12,"Free Size-Soft Sage":8}'::jsonb,
  '100% Crystalline Organza Silk',
  ARRAY['Dry clean recommended','Gentle handwash in cold water','Iron with press cloth'],
  4.95, 164, '2024-01-28'
)

ON CONFLICT (slug) DO UPDATE SET
  name            = EXCLUDED.name,
  subtitle        = EXCLUDED.subtitle,
  description     = EXCLUDED.description,
  price           = EXCLUDED.price,
  original_price  = EXCLUDED.original_price,
  stock           = EXCLUDED.stock,
  sizes           = EXCLUDED.sizes,
  colors          = EXCLUDED.colors,
  tags            = EXCLUDED.tags,
  is_new          = EXCLUDED.is_new,
  is_bestseller   = EXCLUDED.is_bestseller,
  featured        = EXCLUDED.featured,
  rating          = EXCLUDED.rating,
  review_count    = EXCLUDED.review_count;
