-- 1. USERS (Students + Parents)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'student', 'parent', 'teacher'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  grade INTEGER NOT NULL, -- 1-5 for primary
  language VARCHAR(20) DEFAULT 'hindi', -- 'hindi', 'marathi', 'tamil', etc.
  parent_id UUID REFERENCES users(id), -- Link to parent account
  current_level JSONB, -- {"math": 4, "science": 3} - tracks actual level vs grade
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. CURRICULUM (Your content structure)
CREATE TABLE IF NOT EXISTS curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(50) NOT NULL, -- 'math', 'science', 'hindi'
  grade INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title VARCHAR(255) NOT NULL,
  concepts JSONB NOT NULL, -- Array of concept objects
  language VARCHAR(20) DEFAULT 'hindi',
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(subject, grade, chapter_number, language)
);

-- 4. LEARNING PATHS (The core of your adaptive system)
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id VARCHAR(100) NOT NULL, -- References curriculum.concepts[].id
  path_type VARCHAR(20) NOT NULL, -- 'main', 'remedial_1', 'remedial_2', 'advanced'
  content_prompt TEXT NOT NULL, -- Prompt template for Claude
  explanation_style VARCHAR(50), -- 'visual', 'story', 'practical', 'formal'
  difficulty_level INTEGER DEFAULT 5, -- 1-10 scale
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. CHECKPOINTS (Questions to test understanding)
CREATE TABLE IF NOT EXISTS checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL, -- 'mcq', 'numeric', 'short_answer'
  options JSONB, -- For MCQ: ["Option A", "Option B", ...]
  correct_answer TEXT NOT NULL,
  explanation TEXT, -- Why this is the correct answer
  difficulty_level INTEGER DEFAULT 5,
  max_time_seconds INTEGER DEFAULT 120, -- Time limit
  language VARCHAR(20) DEFAULT 'hindi',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. LEARNING SESSIONS (Student's active learning session)
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  grade INTEGER NOT NULL,
  chapter_id UUID REFERENCES curriculum(id),
  current_concept_id VARCHAR(100),
  current_path_type VARCHAR(20) DEFAULT 'main',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed'
  total_duration_mins INTEGER DEFAULT 0
);

-- 7. CONCEPT ATTEMPTS (Track each concept attempt)
CREATE TABLE IF NOT EXISTS concept_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  concept_id VARCHAR(100) NOT NULL,
  path_type VARCHAR(20) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  checkpoint_passed BOOLEAN,
  time_taken_seconds INTEGER,
  path_taken JSONB, -- Track the journey: ["main", "remedial_1", "main"]
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. CHECKPOINT RESPONSES (Individual question attempts)
CREATE TABLE IF NOT EXISTS checkpoint_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES concept_attempts(id) ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES checkpoints(id),
  student_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- 9. AI CONTENT CACHE (Cache generated explanations)
CREATE TABLE IF NOT EXISTS ai_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id VARCHAR(100) NOT NULL,
  path_type VARCHAR(20) NOT NULL,
  language VARCHAR(20) NOT NULL,
  prompt_hash VARCHAR(64) NOT NULL, -- Hash of the prompt used
  generated_content TEXT NOT NULL,
  model_used VARCHAR(50), -- 'claude-sonnet-4', etc.
  generation_timestamp TIMESTAMP DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0, -- Track how often used
  rating DECIMAL(3,2), -- Quality rating 1-5
  
  UNIQUE(concept_id, path_type, language, prompt_hash)
);

-- 10. STUDENT ANALYTICS (Aggregate performance data)
CREATE TABLE IF NOT EXISTS student_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  grade INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  
  -- Performance metrics
  total_concepts_attempted INTEGER DEFAULT 0,
  concepts_mastered INTEGER DEFAULT 0,
  total_time_mins INTEGER DEFAULT 0,
  checkpoint_success_rate DECIMAL(5,2), -- Percentage
  
  -- Learning patterns
  common_struggle_areas JSONB, -- ["fractions", "decimals"]
  remedial_path_frequency INTEGER DEFAULT 0,
  avg_time_per_concept_mins DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(student_id, subject, grade, week_start_date)
);

-- 11. SUBSCRIPTIONS (Payment tracking)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id),
  plan_type VARCHAR(20) NOT NULL, -- 'monthly', 'annual'
  amount_paid DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) NOT NULL, -- 'active', 'expired', 'cancelled'
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  razorpay_subscription_id VARCHAR(100), -- For payment gateway
  created_at TIMESTAMP DEFAULT NOW()
);
