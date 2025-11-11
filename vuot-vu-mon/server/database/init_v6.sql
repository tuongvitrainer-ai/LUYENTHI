-- ============================================
-- DATABASE SCHEMA V6 - "GUEST-FIRST" + GAMIFICATION
-- Hệ thống Quiz/Game học tập cho Tiểu học
-- ============================================

-- ============================================
-- Bảng 1: USERS
-- Quản lý thông tin người dùng với chiến lược "Guest-First"
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Email & Password (NULLABLE cho Guest users)
    email TEXT UNIQUE,
    password_hash TEXT,

    -- Social Login
    google_id TEXT UNIQUE,

    -- User Role với CHECK constraint
    role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'student', 'parent', 'admin', 'student_vip')),

    -- User Info
    full_name TEXT,
    avatar_url TEXT,

    -- Guest Mode Flag
    -- is_anonymous = 1 (true) nếu là Guest
    -- is_anonymous = 0 (false) nếu đã đăng ký
    is_anonymous INTEGER DEFAULT 1 CHECK (is_anonymous IN (0, 1)),

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    -- ============================================
    -- GAMIFICATION FIELDS
    -- ============================================

    -- Streak System
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_learnt_date TEXT,  -- Format: 'YYYY-MM-DD'

    -- Stars/Points System
    stars_balance INTEGER DEFAULT 0,

    -- Freeze Streaks (Khiên bảo vệ streak)
    -- Tặng sẵn 2 khiên cho mỗi user mới
    freeze_streaks INTEGER DEFAULT 2
);

-- Indexes cho users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_anonymous ON users(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_users_last_learnt_date ON users(last_learnt_date);

-- ============================================
-- Bảng 2: QUESTIONS
-- Lưu trữ câu hỏi với cấu trúc linh hoạt
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Nội dung câu hỏi dạng JSON
    -- VD: {"question": "5 x 3 = ?", "options": ["10", "15", "20"], "image_url": "..."}
    content_json TEXT NOT NULL,

    -- Đáp án đúng (lưu riêng để dễ query)
    -- VD: "15" hoặc "B" tùy loại câu hỏi
    correct_answer TEXT NOT NULL,

    -- Loại câu hỏi
    -- VD: 'matching_pair', 'multiple_choice', 'true_false', 'fill_blank'
    type TEXT NOT NULL,

    -- Giải thích đáp án
    explanation TEXT,

    -- Premium content flag
    is_premium INTEGER DEFAULT 0 CHECK (is_premium IN (0, 1)),

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes cho questions
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_is_premium ON questions(is_premium);

-- ============================================
-- Bảng 3: QUESTION_TAGS
-- Gắn tags/labels cho câu hỏi để filter dễ dàng
-- ============================================
CREATE TABLE IF NOT EXISTS question_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,

    -- Tag key (loại tag)
    -- VD: 'môn_học', 'lớp_nguồn', 'game_type', 'chủ_đề'
    tag_key TEXT NOT NULL,

    -- Tag value (giá trị tag)
    -- VD: 'Toán', '3', 'matching_pairs_trang_chu', 'Phép cộng'
    tag_value TEXT NOT NULL,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Indexes cho question_tags
CREATE INDEX IF NOT EXISTS idx_tags_question_id ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_tags_key ON question_tags(tag_key);
CREATE INDEX IF NOT EXISTS idx_tags_key_value ON question_tags(tag_key, tag_value);

-- ============================================
-- Bảng 4: EXAM_RESULTS
-- Lưu kết quả làm bài của người dùng (mỗi session một record)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    -- Loại bài thi/game
    -- VD: 'game_matching_pairs', 'luyen_tap', 'kiem_tra'
    exam_type TEXT NOT NULL,

    -- Điểm số
    score INTEGER NOT NULL,

    -- Chi tiết bài làm dạng JSON
    -- VD: {"questions": [{"q_id": 1, "answer": "B", "correct": true, "time": 5}], "total_time": 60}
    details_json TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes cho exam_results
CREATE INDEX IF NOT EXISTS idx_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_exam_type ON exam_results(exam_type);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON exam_results(created_at);
CREATE INDEX IF NOT EXISTS idx_results_user_type ON exam_results(user_id, exam_type);

-- ============================================
-- VIEWS - Thống kê và báo cáo
-- ============================================

-- View: User Performance
CREATE VIEW IF NOT EXISTS v_user_stats AS
SELECT
    u.id,
    u.full_name,
    u.email,
    u.role,
    u.is_anonymous,
    u.stars_balance,
    u.current_streak,
    u.max_streak,
    u.freeze_streaks,
    COUNT(DISTINCT er.id) as total_exams,
    COALESCE(AVG(er.score), 0) as avg_score,
    MAX(er.score) as max_score,
    u.created_at as joined_date,
    u.last_learnt_date
FROM users u
LEFT JOIN exam_results er ON u.id = er.user_id
GROUP BY u.id;

-- View: Question Statistics
CREATE VIEW IF NOT EXISTS v_question_stats AS
SELECT
    q.id,
    q.type,
    q.is_premium,
    COUNT(DISTINCT qt.id) as total_tags,
    q.created_at
FROM questions q
LEFT JOIN question_tags qt ON q.id = qt.question_id
GROUP BY q.id;

-- View: Questions by Tag
CREATE VIEW IF NOT EXISTS v_questions_by_tag AS
SELECT
    qt.tag_key,
    qt.tag_value,
    COUNT(DISTINCT q.id) as question_count,
    GROUP_CONCAT(DISTINCT q.type) as question_types
FROM question_tags qt
JOIN questions q ON qt.question_id = q.id
GROUP BY qt.tag_key, qt.tag_value;

-- ============================================
-- TRIGGERS - Tự động cập nhật updated_at
-- ============================================

CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_questions_timestamp
AFTER UPDATE ON questions
FOR EACH ROW
BEGIN
    UPDATE questions SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ============================================
-- COMPLETED: Database schema V6 initialized
-- ============================================
