-- DROP TABLES if they exist (to allow clean reset)
DROP TABLE IF EXISTS checkpoint_responses CASCADE;
DROP TABLE IF EXISTS concept_attempts CASCADE;
DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS checkpoints CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS curriculum CASCADE;
DROP TABLE IF EXISTS student_analytics CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS ai_content_cache CASCADE;

-- 1. USERS TABLE (Authentication only - for login credentials)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(15) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'parent')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR(100),
  
  -- Ensure at least one contact method
  CONSTRAINT check_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- 2. PARENTS TABLE (Parent-specific profile data)
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone_alternate VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. STUDENTS TABLE (Student-specific profile data)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL, -- REQUIRED
  name VARCHAR(100) NOT NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),
  language VARCHAR(20) DEFAULT 'hindi',
  current_level JSONB, -- {"math": 4, "science": 3}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. CURRICULUM (Your content structure) - NO CHANGES
CREATE TABLE curriculum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject VARCHAR(50) NOT NULL,
  grade INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title VARCHAR(255) NOT NULL,
  concepts JSONB NOT NULL,
  language VARCHAR(20) DEFAULT 'hindi',
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(subject, grade, chapter_number, language)
);

-- 5. LEARNING PATHS - NO CHANGES
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id VARCHAR(100) NOT NULL,
  path_type VARCHAR(20) NOT NULL,
  content_prompt TEXT NOT NULL,
  explanation_style VARCHAR(50),
  difficulty_level INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. CHECKPOINTS - NO CHANGES
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_level INTEGER DEFAULT 5,
  max_time_seconds INTEGER DEFAULT 120,
  language VARCHAR(20) DEFAULT 'hindi',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. LEARNING SESSIONS - NO CHANGES
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  grade INTEGER NOT NULL,
  chapter_id UUID REFERENCES curriculum(id),
  current_concept_id VARCHAR(100),
  current_path_type VARCHAR(20) DEFAULT 'main',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  total_duration_mins INTEGER DEFAULT 0
);

-- 8. CONCEPT ATTEMPTS - NO CHANGES
CREATE TABLE concept_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  concept_id VARCHAR(100) NOT NULL,
  path_type VARCHAR(20) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  checkpoint_passed BOOLEAN,
  time_taken_seconds INTEGER,
  path_taken JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. CHECKPOINT RESPONSES - NO CHANGES
CREATE TABLE checkpoint_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES concept_attempts(id) ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES checkpoints(id),
  student_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- 10. AI CONTENT CACHE - NO CHANGES
CREATE TABLE ai_content_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id VARCHAR(100) NOT NULL,
  path_type VARCHAR(20) NOT NULL,
  language VARCHAR(20) NOT NULL,
  prompt_hash VARCHAR(64) NOT NULL,
  generated_content TEXT NOT NULL,
  model_used VARCHAR(50),
  generation_timestamp TIMESTAMP DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  
  UNIQUE(concept_id, path_type, language, prompt_hash)
);

-- 11. STUDENT ANALYTICS - NO CHANGES
CREATE TABLE student_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  grade INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  total_concepts_attempted INTEGER DEFAULT 0,
  concepts_mastered INTEGER DEFAULT 0,
  total_time_mins INTEGER DEFAULT 0,
  checkpoint_success_rate DECIMAL(5,2),
  common_struggle_areas JSONB,
  remedial_path_frequency INTEGER DEFAULT 0,
  avg_time_per_concept_mins DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(student_id, subject, grade, week_start_date)
);

-- 12. SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL, -- Changed: now references parents table
  student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- Optional: specific student or all children
  plan_type VARCHAR(20) NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  razorpay_subscription_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_learning_sessions_student_id ON learning_sessions(student_id);
CREATE INDEX idx_subscriptions_parent_id ON subscriptions(parent_id);
