-- ============================================
-- DATABASE SCHEMA V5
-- Hệ thống Quiz/Game học tập cho Lớp 3
-- ============================================

-- Bảng 1: USERS
-- Quản lý thông tin người dùng
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    display_name TEXT,

    -- Auth providers (manual/google/facebook/guest)
    auth_provider TEXT DEFAULT 'manual',
    provider_id TEXT,

    -- Game stats
    total_stars INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_activity_date TEXT,

    -- User role
    role TEXT DEFAULT 'student',

    -- Guest mode
    is_guest INTEGER DEFAULT 0,
    guest_token TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Index cho users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_guest_token ON users(guest_token);

-- ============================================

-- Bảng 2: QUESTIONS
-- Lưu trữ câu hỏi theo dạng JSON linh hoạt
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Content dạng JSON
    content_json TEXT NOT NULL,

    -- Metadata
    difficulty_level INTEGER DEFAULT 1,
    points INTEGER DEFAULT 10,
    time_limit INTEGER DEFAULT 60,

    -- Status
    status TEXT DEFAULT 'active',

    -- Stats
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,

    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Index cho questions
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);

-- ============================================

-- Bảng 3: QUESTION_TAGS
-- Gắn tag cho câu hỏi (môn học, lớp, chủ đề...)
CREATE TABLE IF NOT EXISTS question_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    tag_type TEXT NOT NULL,
    tag_value TEXT NOT NULL,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Index cho question_tags
CREATE INDEX IF NOT EXISTS idx_tags_question ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_tags_type_value ON question_tags(tag_type, tag_value);

-- ============================================

-- Bảng 4: EXAM_RESULTS
-- Lưu kết quả làm bài của học sinh
CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,

    -- User answer
    user_answer TEXT,
    is_correct INTEGER DEFAULT 0,

    -- Scoring
    points_earned INTEGER DEFAULT 0,
    time_spent INTEGER,

    -- Streak info (at the time of submission)
    streak_at_time INTEGER DEFAULT 0,

    -- Session info
    session_id TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Index cho exam_results
CREATE INDEX IF NOT EXISTS idx_results_user ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_question ON exam_results(question_id);
CREATE INDEX IF NOT EXISTS idx_results_session ON exam_results(session_id);
CREATE INDEX IF NOT EXISTS idx_results_created ON exam_results(created_at);

-- ============================================

-- Bảng 5: SHOP_ITEMS
-- Các vật phẩm trong cửa hàng đổi thưởng
CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Item info
    item_name TEXT NOT NULL,
    item_description TEXT,
    item_type TEXT NOT NULL,

    -- Pricing
    star_cost INTEGER NOT NULL,

    -- Inventory
    stock_quantity INTEGER DEFAULT -1,

    -- Display
    image_url TEXT,
    display_order INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'active',

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Index cho shop_items
CREATE INDEX IF NOT EXISTS idx_shop_status ON shop_items(status);
CREATE INDEX IF NOT EXISTS idx_shop_type ON shop_items(item_type);
CREATE INDEX IF NOT EXISTS idx_shop_order ON shop_items(display_order);

-- ============================================

-- Bảng 6: USER_PURCHASES
-- Lịch sử mua hàng của người dùng
CREATE TABLE IF NOT EXISTS user_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    shop_item_id INTEGER NOT NULL,

    -- Purchase info
    stars_spent INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,

    -- Status
    status TEXT DEFAULT 'completed',

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_item_id) REFERENCES shop_items(id)
);

-- Index cho user_purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item ON user_purchases(shop_item_id);

-- ============================================

-- VIEW: Thống kê câu hỏi theo tag
CREATE VIEW IF NOT EXISTS v_question_stats_by_tag AS
SELECT
    qt.tag_type,
    qt.tag_value,
    COUNT(DISTINCT q.id) as total_questions,
    AVG(q.difficulty_level) as avg_difficulty,
    SUM(q.total_attempts) as total_attempts,
    SUM(q.correct_attempts) as total_correct
FROM question_tags qt
JOIN questions q ON qt.question_id = q.id
WHERE q.status = 'active'
GROUP BY qt.tag_type, qt.tag_value;

-- VIEW: Thống kê user performance
CREATE VIEW IF NOT EXISTS v_user_performance AS
SELECT
    u.id,
    u.username,
    u.total_stars,
    u.current_streak,
    u.max_streak,
    COUNT(DISTINCT er.id) as total_answers,
    SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
    ROUND(CAST(SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as accuracy_rate
FROM users u
LEFT JOIN exam_results er ON u.id = er.user_id
GROUP BY u.id;

-- ============================================
-- COMPLETED: Database schema initialized
-- ============================================
