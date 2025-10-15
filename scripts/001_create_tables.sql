-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create criteria table
CREATE TABLE IF NOT EXISTS criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_points INTEGER NOT NULL DEFAULT 10,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  jury_member_name TEXT NOT NULL,
  points DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, criterion_id, jury_member_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_criteria_category ON criteria(category_id);
CREATE INDEX IF NOT EXISTS idx_participants_category ON participants(category_id);
CREATE INDEX IF NOT EXISTS idx_marks_participant ON marks(participant_id);
CREATE INDEX IF NOT EXISTS idx_marks_criterion ON marks(criterion_id);

-- Since no authentication is required, enable public access
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Allow public access to all tables
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow public read access on criteria" ON criteria FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on criteria" ON criteria FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on criteria" ON criteria FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on criteria" ON criteria FOR DELETE USING (true);

CREATE POLICY "Allow public read access on participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on participants" ON participants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on participants" ON participants FOR DELETE USING (true);

CREATE POLICY "Allow public read access on marks" ON marks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on marks" ON marks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on marks" ON marks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on marks" ON marks FOR DELETE USING (true);
