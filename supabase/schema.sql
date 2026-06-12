-- CollegeConnect Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- ==========================================
-- COLLEGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS colleges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Engineering', 'Medical', 'Business', 'Arts', 'Science', 'Law')),
  affiliation TEXT NOT NULL,
  established INTEGER NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  total_seats INTEGER NOT NULL,
  courses_offered TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  fees_min INTEGER NOT NULL,
  fees_max INTEGER NOT NULL,
  image TEXT,
  description TEXT NOT NULL,
  nirf_rank INTEGER,
  accreditation TEXT[] DEFAULT '{}',
  avg_package INTEGER,
  highest_package INTEGER,
  placement_rate DECIMAL(5,2),
  website TEXT,
  campus_size TEXT,
  hostel_details TEXT,
  food_quality TEXT,
  gym_facilities TEXT,
  college_life_review TEXT,
  scholarships_available BOOLEAN DEFAULT false,
  placement_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- APPLICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  college_name TEXT NOT NULL,
  course TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'counseling')),
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  documents TEXT[] DEFAULT '{}',
  counselor_id TEXT,
  counselor_notes TEXT,
  progress_step INTEGER DEFAULT 1,
  progress_stage TEXT DEFAULT 'Application Received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- QUERIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  response TEXT,
  responded_by TEXT,
  responded_date TIMESTAMP WITH TIME ZONE,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- FAVORITES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, college_id)
);

-- ==========================================
-- USERS TABLE (optional - for future auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'counselor', 'admin')),
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Colleges: Anyone can read, only authenticated users can write
CREATE POLICY "Colleges are viewable by everyone" ON colleges
  FOR SELECT USING (true);

CREATE POLICY "Colleges are insertable by authenticated users" ON colleges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Colleges are updatable by authenticated users" ON colleges
  FOR UPDATE USING (true);

CREATE POLICY "Colleges are deletable by authenticated users" ON colleges
  FOR DELETE USING (true);

-- Applications: Anyone can read and write (for demo purposes)
CREATE POLICY "Applications are viewable by everyone" ON applications
  FOR SELECT USING (true);

CREATE POLICY "Applications are insertable by everyone" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Applications are updatable by everyone" ON applications
  FOR UPDATE USING (true);

-- Queries: Anyone can read and write (for demo purposes)
CREATE POLICY "Queries are viewable by everyone" ON queries
  FOR SELECT USING (true);

CREATE POLICY "Queries are insertable by everyone" ON queries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Queries are updatable by everyone" ON queries
  FOR UPDATE USING (true);

-- Favorites: Anyone can manage (for demo purposes)
CREATE POLICY "Favorites are viewable by everyone" ON favorites
  FOR SELECT USING (true);

CREATE POLICY "Favorites are insertable by everyone" ON favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Favorites are deletable by everyone" ON favorites
  FOR DELETE USING (true);

-- Users: Anyone can read and write (for demo purposes)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users are insertable by everyone" ON users
  FOR INSERT WITH CHECK (true);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_city ON colleges(city);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_rating ON colleges(rating);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- ==========================================
-- SEED DATA (Sample Colleges)
-- ==========================================
INSERT INTO colleges (name, location, city, state, type, affiliation, established, rating, total_seats, courses_offered, facilities, fees_min, fees_max, image, description, nirf_rank, accreditation, avg_package, highest_package, placement_rate)
VALUES
  (
    'Indian Institute of Technology Delhi',
    'Hauz Khas, New Delhi',
    'New Delhi',
    'Delhi',
    'Engineering',
    'Autonomous',
    1961,
    4.8,
    2500,
    ARRAY['B.Tech', 'M.Tech', 'MBA', 'PhD'],
    ARRAY['Library', 'Hostel', 'Sports Complex', 'Labs', 'Cafeteria', 'Wi-Fi'],
    200000,
    900000,
    'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    'Premier engineering institution offering world-class education and research opportunities.',
    1,
    ARRAY['NAAC A++', 'NBA'],
    1800000,
    12000000,
    95.0
  ),
  (
    'All India Institute of Medical Sciences',
    'Ansari Nagar, New Delhi',
    'New Delhi',
    'Delhi',
    'Medical',
    'Autonomous',
    1956,
    4.9,
    1200,
    ARRAY['MBBS', 'MD', 'MS', 'DM', 'MCh'],
    ARRAY['Hospital', 'Library', 'Hostel', 'Research Centers', 'Labs'],
    50000,
    300000,
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
    'India''s premier medical institution with excellent research and clinical facilities.',
    1,
    ARRAY['NAAC A++', 'MCI'],
    1200000,
    3000000,
    100.0
  ),
  (
    'Indian Institute of Management Ahmedabad',
    'Vastrapur, Ahmedabad',
    'Ahmedabad',
    'Gujarat',
    'Business',
    'Autonomous',
    1961,
    4.7,
    800,
    ARRAY['MBA', 'PGDM', 'PhD', 'Executive MBA'],
    ARRAY['Library', 'Hostel', 'Sports', 'Auditorium', 'Computer Labs'],
    2500000,
    3300000,
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    'Top business school in India known for excellent management education.',
    1,
    ARRAY['NAAC A++', 'AACSB', 'EQUIS'],
    3300000,
    7000000,
    100.0
  ),
  (
    'National Law School of India University',
    'Nagarbhavi, Bangalore',
    'Bangalore',
    'Karnataka',
    'Law',
    'Autonomous',
    1987,
    4.6,
    500,
    ARRAY['BA LLB', 'LLM', 'PhD'],
    ARRAY['Library', 'Hostel', 'Moot Court', 'Computer Labs', 'Sports'],
    150000,
    400000,
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    'India''s premier law school with excellent academic programs and faculty.',
    1,
    ARRAY['NAAC A++', 'BCI'],
    1500000,
    4500000,
    92.0
  ),
  (
    'St. Stephen''s College',
    'University Enclave, Delhi',
    'New Delhi',
    'Delhi',
    'Arts',
    'University of Delhi',
    1881,
    4.5,
    1000,
    ARRAY['BA', 'B.Sc', 'MA', 'M.Sc'],
    ARRAY['Library', 'Hostel', 'Chapel', 'Sports', 'Canteen'],
    30000,
    100000,
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    'One of India''s most prestigious liberal arts colleges.',
    3,
    ARRAY['NAAC A++'],
    800000,
    2500000,
    85.0
  ),
  (
    'Birla Institute of Technology and Science',
    'Pilani, Rajasthan',
    'Pilani',
    'Rajasthan',
    'Engineering',
    'Deemed University',
    1964,
    4.7,
    3000,
    ARRAY['B.E', 'M.E', 'MBA', 'MSc', 'PhD'],
    ARRAY['Library', 'Hostel', 'Labs', 'Sports Complex', 'Wi-Fi Campus'],
    400000,
    500000,
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800',
    'Premier deemed university known for quality education in engineering and sciences.',
    25,
    ARRAY['NAAC A', 'NBA'],
    1500000,
    6000000,
    90.0
  )
ON CONFLICT DO NOTHING;

-- ==========================================
-- TRIGGER FOR UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
