-- Add institution and email fields to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create jury table
CREATE TABLE IF NOT EXISTS jury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for jury table
ALTER TABLE jury ENABLE ROW LEVEL SECURITY;

-- Allow public access to jury table
CREATE POLICY "Allow public read access on jury" ON jury FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on jury" ON jury FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on jury" ON jury FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on jury" ON jury FOR DELETE USING (true);

-- Create index for jury name lookups
CREATE INDEX IF NOT EXISTS idx_jury_name ON jury(name);
