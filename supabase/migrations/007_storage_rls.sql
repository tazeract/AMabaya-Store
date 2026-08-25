-- ─────────────────────────────────────────────────────────────────────────────
-- AMabaya Migration 007: Storage bucket RLS policies for product-images
-- Run AFTER creating the "product-images" bucket in Supabase Dashboard
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow ANYONE to read/view product images (needed for customer-facing pages)
CREATE POLICY "product-images: public read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow AUTHENTICATED users to upload product images (admin panel)
CREATE POLICY "product-images: auth upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow AUTHENTICATED users to update product images (overwrite/replace)
CREATE POLICY "product-images: auth update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Allow AUTHENTICATED users to delete product images
CREATE POLICY "product-images: auth delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
