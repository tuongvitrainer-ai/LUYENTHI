# Hướng dẫn sử dụng SQL Client và Models

## Phần 1: SQL Clients - Xem và thêm dữ liệu trực tiếp

### 📊 Các SQL Client phổ biến

#### 1. **pgAdmin** (Official PostgreSQL GUI)
**Tải về:** https://www.pgadmin.org/download/

**Cách kết nối:**
1. Mở pgAdmin
2. Right-click "Servers" → "Register" → "Server"
3. Điền thông tin:
   - Name: `VuotVuMon`
   - Host: `localhost`
   - Port: `5432`
   - Database: `vuotvumon`
   - Username: `postgres`
   - Password: (password từ `.env`)

**Xem dữ liệu:**
```
Servers → VuotVuMon → Databases → vuotvumon → Schemas → public → Tables
- Right-click "questions" → View/Edit Data → All Rows
```

---

#### 2. **DBeaver** (Universal Database Tool - RECOMMEND)
**Tải về:** https://dbeaver.io/download/

**Ưu điểm:** Miễn phí, đa nền tảng, hỗ trợ nhiều database

**Cách kết nối:**
1. Mở DBeaver
2. Menu: Database → New Database Connection
3. Chọn PostgreSQL
4. Điền thông tin:
   ```
   Host: localhost
   Port: 5432
   Database: vuotvumon
   Username: postgres
   Password: [your password]
   ```
5. Test Connection → Finish

**Xem dữ liệu:**
```
Navigator → vuotvumon → Schemas → public → Tables → questions (double-click)
```

**Query Editor:**
- SQL Editor icon (Ctrl/Cmd + ]) để mở query editor
- Viết SQL và chạy (Ctrl/Cmd + Enter)

---

#### 3. **TablePlus** (Modern GUI - RECOMMEND for Mac)
**Tải về:** https://tableplus.com/

**Ưu điểm:** Đẹp, nhanh, native app cho Mac

**Cách kết nối:**
1. Mở TablePlus
2. ⌘+N (hoặc "Create a new connection")
3. Chọn PostgreSQL
4. Điền thông tin:
   ```
   Name: VuotVuMon
   Host: localhost
   Port: 5432
   User: postgres
   Password: [your password]
   Database: vuotvumon
   ```
5. Test → Connect

**Xem dữ liệu:**
- Click vào bảng `questions` ở sidebar
- Browse data trực tiếp trong grid view

---

#### 4. **psql** (Command Line)
**Cách dùng:**

```bash
# Connect to database
psql -U postgres -d vuotvumon

# Nếu cần password
psql -U postgres -d vuotvumon -h localhost
```

**Commands cơ bản:**
```sql
-- Liệt kê tất cả bảng
\dt

-- Xem cấu trúc bảng questions
\d questions

-- Xem dữ liệu
SELECT * FROM questions LIMIT 10;

-- Đếm số câu hỏi
SELECT COUNT(*) FROM questions;

-- Thoát
\q
```

---

### 📝 SQL Queries thực tế

#### **1. Xem tất cả câu hỏi lớp 3**

```sql
SELECT
  id,
  subject,
  topic,
  question_text,
  correct_answer,
  difficulty
FROM questions
WHERE grade_level = 3 AND is_active = true
ORDER BY subject, id;
```

#### **2. Đếm câu hỏi theo môn và lớp**

```sql
SELECT
  grade_level AS "Lớp",
  subject AS "Môn học",
  COUNT(*) AS "Số câu"
FROM questions
WHERE is_active = true
GROUP BY grade_level, subject
ORDER BY grade_level, subject;
```

Kết quả:
```
 Lớp | Môn học    | Số câu
------+------------+--------
    3 | english    |      4
    3 | logic      |      3
    3 | math       |      4
    3 | vietnamese |      4
    4 | english    |      1
    4 | logic      |      1
```

#### **3. Xem câu hỏi với đáp án**

```sql
SELECT
  id,
  subject,
  topic,
  question_text,
  options_json,
  correct_answer
FROM questions
WHERE grade_level = 3 AND subject = 'math'
ORDER BY id
LIMIT 5;
```

#### **4. Thêm câu hỏi mới**

```sql
INSERT INTO questions (
  subject,
  topic,
  grade_level,
  question_text,
  options_json,
  correct_answer,
  explanation,
  difficulty,
  is_active,
  created_at,
  updated_at
) VALUES (
  'math',
  'Phép nhân',
  3,
  '12 × 5 = ?',
  '["50", "55", "60", "65"]',
  '60',
  '12 × 5 = 60',
  'easy',
  true,
  NOW(),
  NOW()
);
```

#### **5. Cập nhật câu hỏi**

```sql
UPDATE questions
SET
  question_text = '12 × 6 = ?',
  correct_answer = '72',
  updated_at = NOW()
WHERE id = 1;
```

#### **6. Xóa câu hỏi (soft delete)**

```sql
UPDATE questions
SET is_active = false, updated_at = NOW()
WHERE id = 1;
```

#### **7. Xem kết quả test của user**

```sql
SELECT
  tr.id,
  u.username,
  tr.grade_level,
  tr.score,
  tr.correct_answers,
  tr.total_questions,
  tr.time_taken,
  tr.stars_earned,
  tr.completed_at
FROM test_results tr
JOIN users u ON tr.user_id = u.id
WHERE u.id = 1
ORDER BY tr.completed_at DESC
LIMIT 10;
```

#### **8. Xem top 10 điểm cao nhất lớp 3**

```sql
SELECT
  u.username,
  u.full_name,
  tr.score,
  tr.stars_earned,
  tr.completed_at
FROM test_results tr
JOIN users u ON tr.user_id = u.id
WHERE tr.grade_level = 3
ORDER BY tr.score DESC, tr.time_taken ASC
LIMIT 10;
```

---

### 🔧 Thêm nhiều câu hỏi cùng lúc (Bulk Insert)

```sql
INSERT INTO questions (subject, topic, grade_level, question_text, options_json, correct_answer, explanation, difficulty, is_active)
VALUES
  ('math', 'Phép cộng', 3, '15 + 27 = ?', '["32", "42", "52", "62"]', '42', '15 + 27 = 42', 'easy', true),
  ('math', 'Phép trừ', 3, '50 - 23 = ?', '["17", "27", "37", "47"]', '27', '50 - 23 = 27', 'easy', true),
  ('math', 'Phép nhân', 3, '6 × 9 = ?', '["45", "54", "63", "72"]', '54', '6 × 9 = 54', 'easy', true),
  ('vietnamese', 'Chính tả', 3, 'Từ nào viết đúng?', '["Thầy giáo", "Thây giáo", "Thầy giao", "Thay giáo"]', 'Thầy giáo', 'Cách viết đúng là "Thầy giáo"', 'easy', true),
  ('english', 'Colors', 3, 'What color is grass?', '["Red", "Blue", "Green", "Yellow"]', 'Green', 'Grass is green', 'easy', true);
```

---

### 🔍 Queries nâng cao

#### **1. Tìm câu hỏi chưa có ai trả lời**

```sql
SELECT q.*
FROM questions q
LEFT JOIN test_results tr ON tr.answers_json::text LIKE '%"question_id":' || q.id || '%'
WHERE tr.id IS NULL AND q.is_active = true;
```

#### **2. Tính tỷ lệ đúng/sai của từng câu hỏi**

```sql
-- Cần tạo view hoặc query phức tạp hơn để parse JSON
-- Sẽ implement sau khi có dữ liệu test_results
```

#### **3. Backup câu hỏi ra CSV**

```sql
COPY (
  SELECT * FROM questions WHERE is_active = true ORDER BY grade_level, subject
) TO '/tmp/questions_backup.csv' WITH CSV HEADER;
```

#### **4. Import từ CSV**

```sql
COPY questions(subject, topic, grade_level, question_text, options_json, correct_answer, explanation, difficulty, is_active)
FROM '/path/to/questions.csv'
DELIMITER ','
CSV HEADER;
```

---

## 💡 Tips khi dùng SQL Client

### DBeaver Tips:
- **Ctrl/Cmd + Enter**: Run query tại cursor
- **Ctrl/Cmd + \**: Format SQL
- **Ctrl/Cmd + Space**: Auto-complete
- **Alt + X**: Execute script
- **Ctrl/Cmd + F**: Find in result

### TablePlus Tips:
- **⌘ + K**: Quick switch connection
- **⌘ + T**: New query tab
- **⌘ + R**: Run query
- **⌘ + /**: Comment/uncomment
- **Structure tab**: Xem cấu trúc bảng
- **Relations tab**: Xem foreign keys

### pgAdmin Tips:
- **F5**: Execute query
- **F7**: EXPLAIN query
- **F8**: Execute EXPLAIN ANALYZE
- **Tools → Query Tool**: Mở SQL editor
- **View Data → Filtered Rows**: Xem data có filter

---

## 🎨 Tạo custom views

```sql
-- View: Câu hỏi lớp 3 với thống kê
CREATE VIEW v_grade3_questions AS
SELECT
  q.id,
  q.subject,
  q.topic,
  q.question_text,
  q.difficulty,
  COUNT(DISTINCT u.id) as times_answered
FROM questions q
LEFT JOIN users u ON true  -- Placeholder, cần logic phức tạp hơn
WHERE q.grade_level = 3 AND q.is_active = true
GROUP BY q.id, q.subject, q.topic, q.question_text, q.difficulty;

-- Sử dụng view
SELECT * FROM v_grade3_questions;
```

---

## 📊 Dashboard queries

```sql
-- Tổng quan hệ thống
SELECT
  (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
  (SELECT COUNT(*) FROM questions WHERE is_active = true) as total_questions,
  (SELECT COUNT(*) FROM test_results) as total_tests,
  (SELECT AVG(score) FROM test_results) as avg_score;
```

---

## 🔐 Lưu ý bảo mật

1. **Không hardcode password** trong script
2. **Dùng prepared statements** khi có user input
3. **Backup database** trước khi chạy UPDATE/DELETE
4. **Test queries** trên development database trước
5. **Giới hạn quyền** của user database trong production

---

## 📚 Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- SQL Tutorial: https://www.w3schools.com/sql/
- DBeaver Guide: https://dbeaver.com/docs/
- TablePlus Guide: https://docs.tableplus.com/

---

**Khuyến nghị:** Dùng **DBeaver** (free, đa platform) hoặc **TablePlus** (đẹp cho Mac) để làm việc với database một cách trực quan nhất! 🚀
