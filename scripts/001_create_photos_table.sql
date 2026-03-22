-- Create photos table for storing wedding photo metadata
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'rejected', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved photos (public gallery)
CREATE POLICY "Anyone can view approved photos" ON photos
  FOR SELECT
  USING (status = 'approved');

-- Allow anyone to insert photos (for uploading)
CREATE POLICY "Anyone can insert photos" ON photos
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view all photos (for admin - we'll use a simple password check in the app)
CREATE POLICY "Anyone can view all photos for admin" ON photos
  FOR SELECT
  USING (true);

-- Allow anyone to update photos (for admin status changes)
CREATE POLICY "Anyone can update photos" ON photos
  FOR UPDATE
  USING (true);

-- Allow anyone to delete photos (for admin)
CREATE POLICY "Anyone can delete photos" ON photos
  FOR DELETE
  USING (true);

-- Insert sample photos
INSERT INTO photos (src, alt, upload_date, status) VALUES
  ('https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=600&fit=crop', 'Wedding ceremony moment', '2026-02-20', 'approved'),
  ('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=600&fit=crop', 'Bride and groom first dance', '2026-02-20', 'approved'),
  ('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=600&fit=crop', 'Wedding venue decorated', '2026-02-19', 'pending'),
  ('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=600&fit=crop', 'Wedding bouquet', '2026-02-19', 'approved'),
  ('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=600&fit=crop', 'Wedding rings close-up', '2026-02-18', 'rejected'),
  ('https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=600&fit=crop', 'Wedding cake display', '2026-02-18', 'approved');
