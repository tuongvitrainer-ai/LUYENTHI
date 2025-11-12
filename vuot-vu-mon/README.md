# 📚 VƯỢT VŨ MÔN - Hệ Thống Luyện Thi Trực Tuyến

> Website học tập trực tuyến dành cho học sinh Tiểu học với phương châm **"Guest-First + Gamification"**

---

## 🎯 MỤC LỤC

- [Giới Thiệu](#giới-thiệu)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Sitemap & Routing](#sitemap--routing)
- [Tính Năng Chính](#tính-năng-chính)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Hướng Dẫn Phát Triển](#hướng-dẫn-phát-triển)
- [Thông Tin Quan Trọng](#thông-tin-quan-trọng)

---

## 📖 GIỚI THIỆU

**Vượt Vũ Môn** là nền tảng học tập trực tuyến dành riêng cho học sinh Tiểu học, giúp các em ôn luyện Toán, Tiếng Việt và Tiếng Anh thông qua các trò chơi giáo dục vui nhộn.

### Đặc Điểm Nổi Bật

- ✅ **Guest-First:** Học sinh có thể chơi ngay mà không cần đăng ký
- 🎮 **Gamification:** Hệ thống sao, streak, freeze streaks để tạo động lực
- 🎨 **Giao diện thân thiện:** Màu pastel, font Comic Sans, phù hợp trẻ em
- 📱 **Responsive:** Hoạt động mượt mà trên mọi thiết bị
- 🏆 **Cửa hàng:** Đổi sao lấy phần thưởng, avatar, theme

---

## 💻 CÔNG NGHỆ SỬ DỤNG

### Frontend
```
React 19.1.1          - UI framework (Functional Components + Hooks)
React Router 7.9.5    - Client-side routing
Vite 7.1.7           - Build tool & Dev server
Axios 1.13.2         - HTTP client
Ant Design 5.28.0    - UI component library (dùng cho Admin)
React Quill 2.0.0    - Rich text editor
```

### Backend
```
Node.js              - Runtime environment
Express.js           - Web framework
SQLite3              - Database (file-based, không cần server)
better-sqlite3       - Synchronous SQLite wrapper
JWT                  - Authentication token
bcrypt               - Password hashing
```

### Development Tools
```
ESLint               - Code linting
Vite                 - Fast HMR development
Git                  - Version control
```

---

## 📁 CẤU TRÚC DỰ ÁN

```
vuot-vu-mon/
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── AdminRoute.jsx       # Protected route for admin
│   │   │   ├── GuestRoute.jsx       # Auto create guest user
│   │   │   └── UserAvatar.jsx       # User profile dropdown
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── ThemeContext.jsx     # Theme management
│   │   ├── pages/                   # Page components
│   │   │   ├── LoginPage.jsx        # Đăng nhập
│   │   │   ├── RegisterPage.jsx     # Đăng ký (nâng cấp guest)
│   │   │   ├── GameMap.jsx          # Trang chủ - chọn môn học
│   │   │   ├── QuestionView.jsx     # Làm bài tập
│   │   │   ├── Profile.jsx          # Trang cá nhân
│   │   │   ├── Shop.jsx             # Cửa hàng đổi thưởng
│   │   │   └── admin/               # Admin pages
│   │   │       ├── Dashboard.jsx    # Tổng quan admin
│   │   │       ├── QuestionBank.jsx # Quản lý ngân hàng câu hỏi
│   │   │       ├── QuestionForm.jsx # Tạo/sửa câu hỏi
│   │   │       └── UserManagement.jsx
│   │   ├── sandbox/                 # Experimental features
│   │   │   ├── GameLatTheTriNho.jsx # Game lật thẻ trí nhớ
│   │   │   └── GameLatTheTriNho.css
│   │   ├── api/                     # API service layer
│   │   │   └── api.js               # Axios instance & API calls
│   │   ├── App.jsx                  # Root component & Routing
│   │   ├── App.css                  # Global styles + CSS variables
│   │   └── main.jsx                 # Entry point
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration
│
├── server/                          # Backend Node.js/Express
│   ├── controllers/                 # Business logic
│   │   ├── authController.js        # TASK 1.2: Auth APIs
│   │   ├── adminController.js       # TASK 1.3: Admin APIs
│   │   ├── gameController.js        # TASK 1.4: Game APIs
│   │   └── shopController.js        # Shop functionality
│   ├── middleware/
│   │   └── auth.js                  # JWT verification
│   ├── routes/
│   │   └── api.js                   # API routing
│   ├── database/
│   │   ├── db.js                    # Database connection
│   │   ├── setup_v6.js              # TASK 1.1: Schema V6 + Seeds
│   │   ├── add_shop_to_v6.js        # Shop tables migration
│   │   └── luyenthi_v6.db           # SQLite database file
│   └── server.js                    # Express server entry point
│
├── test_*.sh                        # Test scripts for verification
├── package.json                     # Root dependencies
└── README.md                        # This file
```

---

## 🗄️ DATABASE SCHEMA

### ERD Overview

```
users ─────────┬────────> exam_results
               │
               ├────────> user_purchases ──────> shop_items

questions ─────> question_tags
```

### Tables Detail

#### 1. **users** (Người dùng)
```sql
id                 INTEGER PRIMARY KEY AUTOINCREMENT
email              TEXT UNIQUE
password_hash      TEXT
full_name          TEXT
role               TEXT DEFAULT 'guest'  -- guest, student, teacher, admin
is_anonymous       INTEGER DEFAULT 0     -- 1 = guest user
stars_balance      INTEGER DEFAULT 0     -- Số sao hiện tại
current_streak     INTEGER DEFAULT 0     -- Streak hiện tại (ngày)
max_streak         INTEGER DEFAULT 0     -- Kỷ lục streak
freeze_streaks     INTEGER DEFAULT 2     -- Số lá chắn bảo vệ streak
last_learnt_date   TEXT                  -- Ngày học gần nhất (YYYY-MM-DD)
created_at         TEXT DEFAULT CURRENT_TIMESTAMP
updated_at         TEXT DEFAULT CURRENT_TIMESTAMP
```

**Guest User:**
- `is_anonymous = 1`
- `role = 'guest'`
- `email = NULL`
- Có thể chơi ngay không cần đăng ký

**Student User:**
- Sau khi guest đăng ký → nâng cấp thành student
- `is_anonymous = 0`
- `role = 'student'`
- Có email, password

#### 2. **questions** (Ngân hàng câu hỏi)
```sql
id                 INTEGER PRIMARY KEY AUTOINCREMENT
content_json       TEXT NOT NULL         -- JSON: {question, options:[]}
correct_answer     TEXT NOT NULL         -- Đáp án đúng (text)
type               TEXT NOT NULL         -- multiple_choice, true_false, fill_blank, matching_pair
explanation        TEXT                  -- Giải thích
is_premium         INTEGER DEFAULT 0     -- Câu hỏi premium (cần đăng ký)
created_at         TEXT DEFAULT CURRENT_TIMESTAMP
updated_at         TEXT DEFAULT CURRENT_TIMESTAMP
```

**Content JSON Format:**
```json
{
  "question": "5 × 3 = ?",
  "options": ["10", "15", "20", "25"]
}
```

#### 3. **question_tags** (Tags cho câu hỏi)
```sql
id                 INTEGER PRIMARY KEY AUTOINCREMENT
question_id        INTEGER NOT NULL      -- FK: questions.id
tag_key            TEXT NOT NULL         -- môn_học, lớp_nguồn, game_type
tag_value          TEXT NOT NULL         -- Toán, Tiếng Việt, 3, 4, 5
created_at         TEXT DEFAULT CURRENT_TIMESTAMP

FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
INDEX idx_question_tags (question_id)
INDEX idx_tag_key_value (tag_key, tag_value)
```

**Tag Examples:**
```javascript
{ tag_key: "môn_học", tag_value: "Toán" }
{ tag_key: "lớp_nguồn", tag_value: "3" }
{ tag_key: "game_type", tag_value: "matching_pairs_trang_chu" }
```

#### 4. **exam_results** (Lịch sử làm bài)
```sql
id                 INTEGER PRIMARY KEY AUTOINCREMENT
user_id            INTEGER NOT NULL      -- FK: users.id
exam_type          TEXT NOT NULL         -- game_matching_pairs, luyen_tap, kiem_tra
score              INTEGER NOT NULL      -- Điểm (0-100)
details_json       TEXT                  -- Chi tiết bài làm (JSON)
created_at         TEXT DEFAULT CURRENT_TIMESTAMP

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
INDEX idx_user_results (user_id, created_at)
```

#### 5. **shop_items** (Cửa hàng)
```sql
id                 INTEGER PRIMARY KEY AUTOINCREMENT
item_name          TEXT NOT NULL
item_description   TEXT
item_type          TEXT NOT NULL         -- avatar, theme, freeze_streak, badge
star_cost          INTEGER NOT NULL      -- Giá (sao)
stock_quantity     INTEGER DEFAULT -1    -- -1 = unlimited
image_url          TEXT
display_order      INTEGER DEFAULT 0
status             TEXT DEFAULT 'active' -- active, hidden, sold_out
created_at         TEXT DEFAULT CURRENT_TIMESTAMP
```

#### 6. **user_purchases** (Lịch sử mua hàng)
```sql
id                 INTEGER PRIMARY KEY AUTOINCREMENT
user_id            INTEGER NOT NULL
shop_item_id       INTEGER NOT NULL
stars_spent        INTEGER NOT NULL
purchased_at       TEXT DEFAULT CURRENT_TIMESTAMP

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (shop_item_id) REFERENCES shop_items(id)
INDEX idx_user_purchases (user_id, purchased_at)
```

---

## 🔌 API ENDPOINTS

### BASE URL
```
Development: http://localhost:5000/api
Production:  https://your-domain.com/api
```

### Authentication APIs (TASK 1.2)

#### 1. Create Guest User
```http
POST /api/auth/guest
```
**Request:** (Empty body)
**Response:**
```json
{
  "success": true,
  "message": "Guest user created",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": null,
      "role": "guest",
      "is_anonymous": 1,
      "stars_balance": 0,
      "current_streak": 0,
      "freeze_streaks": 2
    }
  }
}
```

#### 2. Register (Upgrade Guest or Create New)
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "guestToken": "eyJhbGciOiJIUzI1..." // Optional: for guest upgrade
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "new_jwt_token",
    "user": {
      "id": 1,  // Same ID if upgraded from guest
      "email": "student@example.com",
      "role": "student",
      "is_anonymous": 0,
      "stars_balance": 0,  // Preserved from guest
      "current_streak": 0  // Preserved
    }
  }
}
```

#### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

#### 4. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

### Game APIs (TASK 1.4)

#### 1. Get Questions (PUBLIC - Guest can call)
```http
GET /api/game/questions?tag=Toán&tag_key=môn_học&limit=10
```

**Query Parameters:**
- `tag` (required): tag_value để filter
- `tag_key` (optional): tag_key để filter chính xác hơn
- `limit` (optional): số câu hỏi, default=10

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "content": {
          "question_text": "5 × 3 = ?",
          "options": [
            { "id": "A", "text": "10" },
            { "id": "B", "text": "15" },
            { "id": "C", "text": "20" }
          ],
          "question_type": "multiple_choice"
        },
        "correct_answer": "B",  // Mapped from text to ID
        "type": "multiple_choice",
        "explanation": "5 nhân 3 bằng 15",
        "is_premium": 0
      }
    ],
    "count": 1,
    "limit": 10
  }
}
```

#### 2. Submit Result
```http
POST /api/game/submit_result
Authorization: Bearer {token}
Content-Type: application/json

{
  "exam_type": "game_matching_pairs",
  "score": 85,
  "details_json": {
    "questions": [...],
    "total_time": 120
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Result submitted successfully",
  "data": {
    "exam_result_id": 1,
    "score": 85,
    "exam_type": "game_matching_pairs",

    "stars_earned": 5,      // score > 80 → +5 sao
    "stars_balance": 5,     // Tổng sao hiện tại

    "streak_status": {
      "current_streak": 1,
      "max_streak": 1,
      "streak_increased": true,
      "streak_frozen": false,
      "freeze_used": 0,
      "freeze_remaining": 2
    },

    "user": {
      "id": 1,
      "stars_balance": 5,
      "current_streak": 1,
      "max_streak": 1,
      "freeze_streaks": 2,
      "last_learnt_date": "2025-01-15"
    }
  }
}
```

**Streak Logic (Lazy Calculation):**
- **First time:** `streak = 1`
- **Same day:** No change
- **Consecutive day (gap = 1):** `streak + 1`
- **Gap > 1:**
  - **Có freeze:** Dùng freeze để bảo vệ streak
  - **Không đủ freeze:** Reset về 1

#### 3. Get History
```http
GET /api/game/history?limit=20&offset=0
Authorization: Bearer {token}
```

#### 4. Get Stats
```http
GET /api/game/stats
Authorization: Bearer {token}
```

---

### Admin APIs (TASK 1.3)

#### 1. Create Question (Admin only)
```http
POST /api/admin/questions
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "content_json": {
    "question": "5 × 3 = ?",
    "options": ["10", "15", "20", "25"]
  },
  "correct_answer": "15",
  "type": "multiple_choice",
  "explanation": "5 nhân 3 bằng 15",
  "is_premium": 0,
  "tags": [
    { "tag_key": "môn_học", "tag_value": "Toán" },
    { "tag_key": "lớp_nguồn", "tag_value": "3" },
    { "tag_key": "game_type", "tag_value": "matching_pairs_trang_chu" }
  ]
}
```

**Features:**
- ✅ Transaction-based insert (atomic operation)
- ✅ Insert question + tags in one go
- ✅ Auto rollback if error

#### 2. Get All Questions (Admin only)
```http
GET /api/admin/questions?limit=100&offset=0
Authorization: Bearer {admin_token}
```

---

### Shop APIs

#### 1. Get Shop Items
```http
GET /api/shop/items
Authorization: Bearer {token}
```

#### 2. Purchase Item
```http
POST /api/shop/purchase
Authorization: Bearer {token}
Content-Type: application/json

{
  "shop_item_id": 1
}
```

#### 3. Get Purchase History
```http
GET /api/shop/purchases
Authorization: Bearer {token}
```

---

## 🗺️ SITEMAP & ROUTING

### Frontend Routes (`client/src/App.jsx`)

```javascript
// Public Routes (Không cần đăng nhập)
/login                              → LoginPage
/register                           → RegisterPage

// Sandbox Routes (For testing)
/sandbox-game-lat-the-tri-nho      → GameLatTheTriNho

// Guest Routes (Auto create guest user)
/                                   → GameMap (GuestRoute wrapper)
/game/play                          → QuestionView (GuestRoute wrapper)

// Protected Routes (Cần đăng ký - is_anonymous=0)
/shop                               → Shop
/profile                            → Profile

// Admin Routes (Admin only)
/admin/dashboard                    → Dashboard
/admin/question-bank                → QuestionBank
/admin/question-bank/create         → QuestionForm (create)
/admin/question-bank/edit/:id       → QuestionForm (edit)
/admin/users                        → UserManagement

// Catch All
*                                   → Redirect to /
```

### Route Protection

#### GuestRoute
```javascript
// Auto-create guest user if no token
// Allow access immediately
// Used for: /, /game/play
```

#### ProtectedRoute
```javascript
// Require is_anonymous = 0 (registered user)
// Redirect to /login if guest
// Used for: /shop, /profile
```

#### AdminRoute
```javascript
// Require role = 'admin'
// Redirect to / if not admin
// Used for: /admin/*
```

---

## 🎯 TÍNH NĂNG CHÍNH

### 1. Guest-First Strategy

**Luồng hoạt động:**
```
Vào trang → GuestRoute → Auto call POST /api/auth/guest → Nhận token → Lưu localStorage → Chơi ngay
```

**Ưu điểm:**
- Không ép buộc đăng ký
- Trải nghiệm tốt hơn
- Tăng conversion rate

**Nâng cấp lên Student:**
```
Guest chơi → Tích lũy sao → Muốn lưu điểm → Click "Đăng ký" → Nhập email/password → API detect guestToken → UPDATE user (giữ nguyên ID và stats) → Nâng cấp thành student
```

---

### 2. Gamification System

#### Sao (Stars)
- Làm bài đạt **score > 80** → Nhận **+5 sao**
- Dùng sao để mua đồ trong Shop

#### Streak (Chuỗi học liên tiếp)
- Học mỗi ngày → `current_streak + 1`
- Đạt kỷ lục → `max_streak` cập nhật
- Streak càng cao → Động lực càng mạnh

#### Freeze Streak (Lá chắn bảo vệ streak)
- User bắt đầu có **2 freeze streaks** miễn phí
- Nếu miss 1 ngày → Dùng 1 freeze → Giữ streak
- Miss nhiều ngày → Dùng nhiều freeze
- Hết freeze → Streak reset về 1
- Mua thêm freeze trong Shop

**Lazy Calculation:**
- Không check streak mỗi ngày
- Chỉ tính khi user submit result
- Efficient và đơn giản

---

### 3. Game: LẬT THẺ TRÍ NHỚ

**Location:** `/sandbox-game-lat-the-tri-nho`

**Tính năng:**
- 5 levels: 4, 6, 8, 12, 20 cặp thẻ
- Flip animation 3D mượt mà
- Sound effects (Web Audio API):
  - Match: C-E chord (vui nhộn)
  - No match: Low tone (nhẹ nhàng)
- Responsive sizing: Tất cả thẻ fit trong 1 màn hình
- Tracking: Điểm, Lượt, Thời gian, Độ chính xác

**UI/UX:**
- Compact level buttons
- Pastel colors matching homepage
- Font Comic Sans for kids
- Mobile-friendly

---

### 4. Admin Panel

**Access:** `/admin/dashboard` (Admin only)

**Features:**
- Dashboard: Thống kê tổng quan
- Question Bank: Quản lý ngân hàng câu hỏi
  - Create: Tạo câu hỏi với tags (transaction-based)
  - Edit: Sửa câu hỏi
  - Delete: Xóa câu hỏi
- User Management: Quản lý người dùng
- Rich Text Editor (React Quill) cho câu hỏi

---

### 5. Shop System

**Mục đích:** Tạo động lực học tập

**Items:**
- Avatar (50-100 sao)
- Theme (100-200 sao)
- Freeze Streak (50 sao/cái)
- Badge (100-300 sao)

**Workflow:**
```
User có sao → Vào /shop → Chọn item → POST /api/shop/purchase → Trừ sao → Lưu vào user_purchases
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Yêu Cầu Hệ Thống

- Node.js >= 16.x
- npm >= 7.x
- Git

### Cài Đặt Bước 1: Clone Repository

```bash
git clone <repository_url>
cd vuot-vu-mon
```

### Cài Đặt Bước 2: Cài Dependencies

```bash
# Install root dependencies (cho server)
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Cài Đặt Bước 3: Setup Database

```bash
# Tạo database V6 với schema và seed data
node server/database/setup_v6.js

# (Optional) Add shop system
node server/database/add_shop_to_v6.js
```

**Default Admin Account:**
```
Email: admin@example.com
Password: admin123
```

### Cài Đặt Bước 4: Chạy Development

**Terminal 1 - Backend:**
```bash
# From root directory
npm start
# hoặc
node server/server.js

# Backend chạy tại: http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev

# Frontend chạy tại: http://localhost:5173
```

### Cài Đặt Bước 5: Test

```bash
# Test TASK 1.2 (Auth APIs)
./test_task_1_2.sh

# Test TASK 1.3 & 1.4 (Admin & Game APIs)
./test_task_1_3_1_4.sh
```

---

## 🛠️ HƯỚNG DẪN PHÁT TRIỂN

### Thêm Route Mới (Frontend)

1. Tạo component trong `client/src/pages/`
2. Import vào `App.jsx`
3. Thêm `<Route>` vào Routes

```javascript
import NewPage from './pages/NewPage';

// In Routes
<Route path="/new-path" element={<NewPage />} />
```

### Thêm API Endpoint Mới (Backend)

1. Tạo function trong controller (`server/controllers/`)
```javascript
// gameController.js
const newFeature = (req, res) => {
  // Logic here
  res.json({ success: true, data: {} });
};

module.exports = { newFeature };
```

2. Thêm route trong `server/routes/api.js`
```javascript
const gameController = require('../controllers/gameController');
router.post('/game/new-feature', authenticateToken, gameController.newFeature);
```

3. Call từ frontend
```javascript
// client/src/api/api.js
export const newFeatureAPI = (data) => api.post('/game/new-feature', data);
```

### Thêm Game Mới

1. Tạo component trong `client/src/sandbox/`
2. Thêm route trong `App.jsx`
3. Follow pattern của `GameLatTheTriNho.jsx`

---

## 📌 THÔNG TIN QUAN TRỌNG

### Environment Variables

```bash
# Backend (.env - optional)
PORT=5000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

### Important Files

| File | Mục Đích |
|------|----------|
| `server/database/setup_v6.js` | TASK 1.1: Database schema + seed data |
| `server/controllers/authController.js` | TASK 1.2: Auth APIs |
| `server/controllers/adminController.js` | TASK 1.3: Admin APIs |
| `server/controllers/gameController.js` | TASK 1.4: Game APIs + Gamification |
| `client/src/App.css` | CSS variables (pastel colors, fonts) |
| `client/src/context/AuthContext.jsx` | Global auth state |
| `client/src/api/api.js` | API service layer |

### CSS Variables

```css
/* Color Palette */
--pastel-blue: #87CEEB
--pastel-pink: #FFB6C1
--pastel-green: #98D8C8
--pastel-yellow: #F0E68C
--gradient-rainbow: linear-gradient(135deg, #F5FAFF 0%, #FFF5F8 50%, #FFFDF5 100%)

/* Fonts */
--font-primary: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif
--font-display: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive

/* Spacing */
--spacing-xs: 8px
--spacing-sm: 12px
--spacing-md: 16px
--spacing-lg: 24px
```

### Common Issues & Solutions

#### Issue 1: better-sqlite3 Invalid ELF Header
```bash
# Solution: Rebuild after git operations
cd vuot-vu-mon
npm rebuild better-sqlite3
```

#### Issue 2: Port 5000 already in use
```bash
# Change port in server/server.js
const PORT = process.env.PORT || 5001;
```

#### Issue 3: CORS Error
```bash
# Already configured in server/server.js with cors middleware
# If still error, check frontend API base URL in client/src/api/api.js
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add new feature"

# Push
git push -u origin feature/new-feature
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Ant Design Documentation](https://ant.design/)

---

## 👥 TEAM & CONTACT

- **Project:** Vượt Vũ Môn (luyenthi)
- **Stack:** React 19 + Node.js + Express + SQLite
- **Version:** V6 (Guest-First + Gamification)

---

## 📝 CHANGELOG

### V6 (Current)
- ✅ Guest-First authentication
- ✅ Gamification (Stars, Streak, Freeze)
- ✅ Shop system
- ✅ Game: Lật Thẻ Trí Nhớ (5 levels, sound effects)
- ✅ Admin panel with question management
- ✅ Responsive design (mobile-friendly)
- ✅ Pastel color scheme for kids

---

**🎉 Happy Coding! Chúc bạn phát triển thành công!**
