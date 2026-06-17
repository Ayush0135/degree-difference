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
  student_dob TEXT,
  student_gender TEXT,
  student_city TEXT,
  high_school_marks TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'counseling')),
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  documents TEXT[] DEFAULT '{}',
  counselor_id TEXT,
  assigned_counselor_name TEXT,
  counselor_notes TEXT,
  scholarship_amount NUMERIC DEFAULT 0,
  scholarship_details TEXT,
  counselor_incentive NUMERIC DEFAULT 0,
  progress JSONB DEFAULT '{"step": 1, "totalSteps": 5, "currentStage": "Application Received"}'::jsonb,
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
-- USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'counselor', 'admin', 'subadmin')),
  phone TEXT,
  avatar TEXT,
  password TEXT,
  fake_admissions_count INTEGER DEFAULT 0,
  specialization TEXT[] DEFAULT '{}',
  assigned_students TEXT[] DEFAULT '{}',
  total_admissions INTEGER DEFAULT 0,
  real_admissions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- COUNSELOR APPLICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS counselor_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  dob TEXT NOT NULL,
  aadhaar TEXT NOT NULL,
  pan TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alt_mobile TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  org_name TEXT,
  designation TEXT NOT NULL,
  experience TEXT NOT NULL,
  specialization TEXT NOT NULL,
  students_counseled TEXT,
  acc_holder TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  acc_number TEXT NOT NULL,
  ifsc TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- COUNSELOR TASKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS counselor_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id TEXT NOT NULL,
  task_text TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- APPLICATION NOTES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS application_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- COUNSELOR BADGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS counselor_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(counselor_id, badge_type)
);

-- ==========================================
-- PLATFORM SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- USER STATES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_states (
  user_id TEXT PRIMARY KEY,
  state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
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
ALTER TABLE counselor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_states ENABLE ROW LEVEL SECURITY;

-- Colleges: Anyone can read, only admins can modify (simplified for demo)
CREATE POLICY "Colleges are viewable by everyone" ON colleges
  FOR SELECT USING (true);

CREATE POLICY "Colleges are insertable by everyone" ON colleges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Colleges are updatable by everyone" ON colleges
  FOR UPDATE USING (true);

CREATE POLICY "Colleges are deletable by everyone" ON colleges
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

CREATE POLICY "Users are updatable by everyone" ON users
  FOR UPDATE USING (true);

-- Counselor Applications
CREATE POLICY "Counselor Apps are viewable by everyone" ON counselor_applications
  FOR SELECT USING (true);

CREATE POLICY "Counselor Apps are insertable by everyone" ON counselor_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Counselor Apps are updatable by everyone" ON counselor_applications
  FOR UPDATE USING (true);

-- Counselor Tasks
CREATE POLICY "Counselor Tasks are viewable by everyone" ON counselor_tasks
  FOR SELECT USING (true);
CREATE POLICY "Counselor Tasks are insertable by everyone" ON counselor_tasks
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Counselor Tasks are updatable by everyone" ON counselor_tasks
  FOR UPDATE USING (true);
CREATE POLICY "Counselor Tasks are deletable by everyone" ON counselor_tasks
  FOR DELETE USING (true);

-- Application Notes
CREATE POLICY "Application Notes are viewable by everyone" ON application_notes
  FOR SELECT USING (true);
CREATE POLICY "Application Notes are insertable by everyone" ON application_notes
  FOR INSERT WITH CHECK (true);

-- Counselor Badges
CREATE POLICY "Counselor Badges are viewable by everyone" ON counselor_badges
  FOR SELECT USING (true);
CREATE POLICY "Counselor Badges are insertable by everyone" ON counselor_badges
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Counselor Badges are updatable by everyone" ON counselor_badges
  FOR UPDATE USING (true);

-- Platform Settings
CREATE POLICY "Platform Settings are viewable by everyone" ON platform_settings
  FOR SELECT USING (true);
CREATE POLICY "Platform Settings are insertable by everyone" ON platform_settings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Platform Settings are updatable by everyone" ON platform_settings
  FOR UPDATE USING (true);

-- User States
CREATE POLICY "User States are viewable by everyone" ON user_states
  FOR SELECT USING (true);
CREATE POLICY "User States are insertable by everyone" ON user_states
  FOR INSERT WITH CHECK (true);
CREATE POLICY "User States are updatable by everyone" ON user_states
  FOR UPDATE USING (true);

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
