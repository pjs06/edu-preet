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
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS feature_usage CASCADE;
DROP TABLE IF EXISTS app_health_metrics CASCADE;
DROP TABLE IF EXISTS learning_session_metrics CASCADE;
DROP TABLE IF EXISTS user_retention_cohorts CASCADE;
DROP TABLE IF EXISTS daily_active_users CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS learning_assessments CASCADE;
DROP TABLE IF EXISTS assessment_questions CASCADE;
DROP TABLE IF EXISTS assessment_responses CASCADE;

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
  metadata JSONB,
  
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

-- 13. USER SESSIONS (Login/logout tracking)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL, -- JWT token or session ID
  
  -- Session metadata
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timing
  login_at TIMESTAMP DEFAULT NOW(),
  logout_at TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  session_duration_seconds INTEGER, -- Calculated on logout
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'logged_out'
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 14. USER ACTIVITY LOG (Granular event tracking)
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL, -- If action is student-specific
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'button_click', 'session_start', etc.
  event_category VARCHAR(50), -- 'learning', 'navigation', 'profile', 'payment'
  event_action VARCHAR(100), -- 'started_concept', 'answered_checkpoint', 'viewed_dashboard'
  event_label VARCHAR(255), -- Additional context
  
  -- Metadata
  page_url VARCHAR(500),
  referrer_url VARCHAR(500),
  metadata JSONB, -- Flexible field for event-specific data
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 15. DAILY ACTIVE USERS (Aggregated metrics)
CREATE TABLE daily_active_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  
  -- User counts
  total_active_users INTEGER DEFAULT 0,
  active_parents INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  
  -- Engagement
  avg_session_duration_mins DECIMAL(10,2),
  total_sessions INTEGER DEFAULT 0,
  total_learning_sessions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date)
);

-- 16. USER RETENTION COHORTS (Track user retention)
CREATE TABLE user_retention_cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_month DATE NOT NULL, -- First of the month when user signed up
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL,
  
  -- Retention tracking (did they come back in week N?)
  week_0 BOOLEAN DEFAULT true,  -- Signup week
  week_1 BOOLEAN DEFAULT false,
  week_2 BOOLEAN DEFAULT false,
  week_3 BOOLEAN DEFAULT false,
  week_4 BOOLEAN DEFAULT false,
  
  month_1 BOOLEAN DEFAULT false, -- Month 1 after signup
  month_2 BOOLEAN DEFAULT false,
  month_3 BOOLEAN DEFAULT false,
  month_6 BOOLEAN DEFAULT false,
  
  last_seen_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(cohort_month, user_id)
);

-- 17. LEARNING SESSION METRICS (Expanded from learning_sessions)
CREATE TABLE learning_session_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  
  -- Completion metrics
  concepts_attempted INTEGER DEFAULT 0,
  concepts_completed INTEGER DEFAULT 0,
  checkpoints_attempted INTEGER DEFAULT 0,
  checkpoints_passed INTEGER DEFAULT 0,
  
  -- Path analysis
  main_path_used INTEGER DEFAULT 0,
  remedial_1_used INTEGER DEFAULT 0,
  remedial_2_used INTEGER DEFAULT 0,
  
  -- Engagement
  total_active_time_seconds INTEGER DEFAULT 0, -- Time actually interacting
  total_idle_time_seconds INTEGER DEFAULT 0,
  pause_count INTEGER DEFAULT 0,
  
  -- Outcomes
  completion_rate DECIMAL(5,2), -- % of concepts completed
  success_rate DECIMAL(5,2), -- % of checkpoints passed
  avg_time_per_concept_seconds INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 18. APP HEALTH METRICS (Overall product health)
CREATE TABLE app_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  
  -- User metrics
  total_users INTEGER DEFAULT 0,
  total_parents INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  dau INTEGER DEFAULT 0, -- Daily Active Users
  wau INTEGER DEFAULT 0, -- Weekly Active Users
  mau INTEGER DEFAULT 0, -- Monthly Active Users
  
  -- Engagement metrics
  avg_sessions_per_user DECIMAL(5,2),
  avg_learning_time_mins DECIMAL(10,2),
  total_learning_sessions INTEGER DEFAULT 0,
  
  -- Learning metrics
  total_concepts_completed INTEGER DEFAULT 0,
  total_checkpoints_attempted INTEGER DEFAULT 0,
  checkpoint_success_rate DECIMAL(5,2),
  remedial_path_usage_rate DECIMAL(5,2),
  
  -- Subscription metrics
  active_subscriptions INTEGER DEFAULT 0,
  subscription_revenue DECIMAL(15,2),
  new_subscriptions INTEGER DEFAULT 0,
  churned_subscriptions INTEGER DEFAULT 0,
  
  -- Technical metrics
  avg_api_response_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  ai_api_calls INTEGER DEFAULT 0,
  ai_api_cost DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date)
);

-- 19. FEATURE USAGE TRACKING
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  feature_name VARCHAR(100) NOT NULL, -- 'checkpoint_system', 'remedial_path', 'voice_narration'
  
  -- Usage counts
  total_uses INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  
  -- Success metrics
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date, feature_name)
);

-- 20. ERROR LOGS (For debugging and monitoring)
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  
  -- Error details
  error_type VARCHAR(100) NOT NULL, -- 'api_error', 'validation_error', 'auth_error'
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  
  -- Context
  endpoint VARCHAR(255),
  request_method VARCHAR(10),
  request_body JSONB,
  
  -- Metadata
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  resolved BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES for analytics queries
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_at ON user_sessions(login_at);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);

CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_event_type ON user_activity_log(event_type);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);

CREATE INDEX idx_daily_active_users_date ON daily_active_users(date);
CREATE INDEX idx_user_retention_cohorts_cohort_month ON user_retention_cohorts(cohort_month);

CREATE INDEX idx_learning_session_metrics_student_id ON learning_session_metrics(student_id);
CREATE INDEX idx_app_health_metrics_date ON app_health_metrics(date);

CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);

-- 21. LEARNING PROFILE ASSESSMENT
CREATE TABLE learning_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  
  -- Assessment metadata
  assessment_version VARCHAR(20) DEFAULT 'v1.0',
  completed_at TIMESTAMP,
  time_taken_minutes INTEGER,
  
  -- Raw scores (0-100 scale)
  visual_score INTEGER,
  auditory_score INTEGER,
  reading_writing_score INTEGER,
  kinesthetic_score INTEGER,
  
  -- Mindset scores
  growth_mindset_score INTEGER, -- Higher = more growth mindset
  fixed_mindset_score INTEGER,
  
  -- Cognitive preferences
  detail_oriented_score INTEGER, -- vs big picture
  sequential_score INTEGER, -- vs random/holistic
  processing_speed VARCHAR(20), -- 'fast', 'moderate', 'deliberate'
  
  -- Motivation
  intrinsic_motivation_score INTEGER,
  extrinsic_motivation_score INTEGER,
  competition_drive_score INTEGER,
  
  -- Emotional/Social
  confidence_level INTEGER, -- 1-10
  failure_resilience_score INTEGER, -- How well they handle mistakes
  peer_comparison_sensitivity INTEGER, -- Do they compare themselves to others?
  help_seeking_comfort INTEGER, -- Comfortable asking for help?
  
  -- Attention
  sustained_attention_minutes INTEGER, -- How long can they focus?
  preferred_chunk_size VARCHAR(20), -- 'short' (3-5min), 'medium' (5-8min), 'long' (8-12min)
  
  -- Derived profile
  primary_learning_style VARCHAR(50), -- 'visual', 'auditory', 'kinesthetic', 'multimodal'
  mindset_type VARCHAR(20), -- 'strong_growth', 'growth_leaning', 'balanced', 'fixed_leaning'
  ideal_content_style VARCHAR(50), -- 'story', 'formal', 'analogy', 'practical', 'game'
  optimal_video_duration INTEGER, -- Personalized video length in minutes
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 22. ASSESSMENT QUESTIONS
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_category VARCHAR(50) NOT NULL, -- 'learning_style', 'mindset', 'motivation', etc.
  
  -- Question type
  question_type VARCHAR(20) NOT NULL, -- 'scenario', 'preference', 'agreement_scale'
  
  -- Options
  options JSONB NOT NULL, -- Array of options with scoring rules
  
  -- Metadata
  age_appropriate_for INTEGER[], -- [8, 9, 10, 11, 12]
  language VARCHAR(20) DEFAULT 'hindi',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 23. ASSESSMENT RESPONSES
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES learning_assessments(id) ON DELETE CASCADE,
  question_id UUID REFERENCES assessment_questions(id),
  
  student_answer TEXT NOT NULL,
  response_time_seconds INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);
