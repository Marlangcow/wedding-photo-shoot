-- Run after 001_create_photos_table.sql (Supabase SQL Editor)

ALTER TABLE photos ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Storage RLS (policies only take effect when RLS is enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public bucket for gallery images (10 MB max; adjust as needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-photos',
  'wedding-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage object policies (RLS on storage.objects)
DROP POLICY IF EXISTS "wedding photos public read" ON storage.objects;
CREATE POLICY "wedding photos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-photos');

DROP POLICY IF EXISTS "wedding photos public upload" ON storage.objects;
CREATE POLICY "wedding photos public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wedding-photos');

DROP POLICY IF EXISTS "wedding photos public delete" ON storage.objects;
CREATE POLICY "wedding photos public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wedding-photos');
