-- =======================================================================
-- Database Schema for Image to PDF Converter (College Project)
-- Database: Supabase PostgreSQL
-- =======================================================================

-- 1. Create table for storing conversion history records
CREATE TABLE IF NOT EXISTS conversion_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    image_count INTEGER NOT NULL CHECK (image_count > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create index on created_at for fast retrieval of latest conversions
CREATE INDEX IF NOT EXISTS idx_conversion_history_created_at 
ON conversion_history (created_at DESC);

-- 3. Enable Row Level Security (RLS)
-- Protects the table and ensures controlled access rules
ALTER TABLE conversion_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Allow public read access to conversion history
CREATE POLICY "Allow public read access to conversion history"
ON conversion_history
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. RLS Policy: Allow inserting conversion logs with safety checks
-- Ensures filenames are reasonable and image count is within bounds
CREATE POLICY "Allow public insert of conversion history"
ON conversion_history
FOR INSERT
TO anon, authenticated
WITH CHECK (
    char_length(filename) > 0 AND 
    char_length(filename) <= 255 AND 
    image_count > 0 AND 
    image_count <= 200
);

-- Note: UPDATE and DELETE policies are deliberately not granted to public/anon,
-- protecting historical logs from being altered or wiped by unauthorized clients.

