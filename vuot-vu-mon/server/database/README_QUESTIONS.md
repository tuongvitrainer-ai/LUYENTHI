# Hướng dẫn Database cho Game "Thử thách khởi đầu"

## 📋 Tổng quan

Game "Thử thách khởi đầu" sử dụng 2 bảng chính:
- **`questions`**: Lưu trữ câu hỏi cho các môn học (Toán, Tiếng Việt, Tiếng Anh, Logic)
- **`test_results`**: Lưu trữ kết quả bài test của học sinh

## 🚀 Bước 1: Chạy Migrations

### 1.1. Kiểm tra migrations hiện tại

```bash
cd /home/user/LUYENTHI/vuot-vu-mon/server
node -e "require('./database/db').getMigrationStatus().then(console.log)"
```

### 1.2. Chạy migrations mới

```bash
cd /home/user/LUYENTHI/vuot-vu-mon/server
npx knex migrate:latest --knexfile knexfile.js
```

Hoặc sử dụng script có sẵn:

```bash
node -e "require('./database/db').runMigrations()"
```

### 1.3. Rollback (nếu cần)

```bash
npx knex migrate:rollback --knexfile knexfile.js
```

## 🌱 Bước 2: Seed Dữ liệu mẫu

### 2.1. Chạy seed file

```bash
cd /home/user/LUYENTHI/vuot-vu-mon/server
npx knex seed:run --knexfile knexfile.js
```

Seed file sẽ thêm:
- **15 câu hỏi lớp 3** (4 Toán + 4 Tiếng Việt + 4 Tiếng Anh + 3 Logic)
- **4 câu hỏi lớp 4** (1 mỗi môn)
- **4 câu hỏi lớp 5** (1 mỗi môn)

### 2.2. Seed từng file cụ thể

```bash
npx knex seed:run --specific=001_sample_questions.js --knexfile knexfile.js
```

## 📝 Bước 3: Thêm câu hỏi mới

### 3.1. Cấu trúc câu hỏi

Mỗi câu hỏi có các trường sau:

| Trường | Kiểu | Mô tả | Bắt buộc |
|--------|------|-------|----------|
| `subject` | string | Môn học: `math`, `vietnamese`, `english`, `logic` | ✅ |
| `topic` | string | Chủ đề cụ thể (VD: "Phép cộng", "Chính tả") | ✅ |
| `grade_level` | integer | Lớp: 3, 4, 5 | ✅ |
| `question_text` | text | Nội dung câu hỏi | ✅ |
| `options_json` | JSON | Mảng 4 đáp án: `["A", "B", "C", "D"]` | ✅ |
| `correct_answer` | string | Đáp án đúng (phải khớp với 1 option) | ✅ |
| `explanation` | text | Giải thích đáp án | ❌ |
| `difficulty` | string | Độ khó: `easy`, `medium`, `hard` | ❌ (mặc định: `medium`) |
| `is_active` | boolean | Trạng thái hoạt động | ❌ (mặc định: `true`) |

### 3.2. Sử dụng Model để thêm câu hỏi

**Cách 1: Sử dụng Question Model trong code**

```javascript
const Question = require('./models/Question');

// Thêm 1 câu hỏi
const newQuestion = await Question.create({
  subject: 'math',
  topic: 'Phép nhân',
  grade_level: 3,
  question_text: '9 × 6 = ?',
  options: ['48', '54', '56', '64'],
  correct_answer: '54',
  explanation: '9 × 6 = 54',
  difficulty: 'easy'
});

console.log('Đã thêm câu hỏi:', newQuestion);
```

**Cách 2: Tạo script riêng**

Tạo file `/server/scripts/add_questions.js`:

```javascript
const Question = require('../models/Question');

async function addQuestions() {
  const questions = [
    {
      subject: 'math',
      topic: 'Phép cộng',
      grade_level: 3,
      question_text: '234 + 567 = ?',
      options: ['791', '801', '811', '821'],
      correct_answer: '801',
      explanation: '234 + 567 = 801',
      difficulty: 'easy'
    },
    // Thêm nhiều câu hỏi khác...
  ];

  for (const q of questions) {
    await Question.create(q);
    console.log(`✅ Đã thêm: ${q.question_text}`);
  }

  console.log(`\n🎉 Hoàn thành! Đã thêm ${questions.length} câu hỏi`);
  process.exit(0);
}

addQuestions().catch(console.error);
```

Chạy script:

```bash
node server/scripts/add_questions.js
```

### 3.3. Thêm trực tiếp vào database (SQL)

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
  is_active
) VALUES (
  'math',
  'Phép chia',
  3,
  '64 ÷ 8 = ?',
  '["6", "7", "8", "9"]',
  '8',
  '64 ÷ 8 = 8',
  'easy',
  true
);
```

## 📊 Bước 4: Danh sách môn học và topic mẫu

### 🔢 Toán học (math)

**Lớp 3:**
- Phép cộng (có nhớ)
- Phép trừ (có mượn)
- Phép nhân (bảng cửu chương)
- Phép chia (chia hết)
- Số lớn hơn, nhỏ hơn
- Đơn vị đo (cm, m, kg, lít)

**Lớp 4:**
- Phép nhân (2-3 chữ số)
- Phép chia (có dư)
- Phân số cơ bản
- Chu vi, diện tích hình chữ nhật
- Đơn vị thời gian

**Lớp 5:**
- Phân số (cộng, trừ, nhân, chia)
- Số thập phân
- Tỷ lệ, phần trăm
- Diện tích, thể tích
- Biểu đồ

### 📚 Tiếng Việt (vietnamese)

**Tất cả các lớp:**
- Chính tả
- Từ vựng
- Từ đồng nghĩa, trái nghĩa
- Ngữ pháp
- Đọc hiểu
- Thành ngữ, tục ngữ (lớp 4-5)

### 🗣️ Tiếng Anh (english)

**Lớp 3:**
- Colors, Numbers, Animals
- Family, School
- Basic Verbs (is, am, are)

**Lớp 4:**
- Days, Months, Seasons
- Food, Clothes
- Present Simple

**Lớp 5:**
- Jobs, Hobbies
- Past Simple
- Comparative, Superlative

### 🤔 Tư duy Logic (logic)

**Tất cả các lớp:**
- Dãy số
- Quy luật
- So sánh
- Suy luận
- Giải toán có lời văn

## 🔍 Bước 5: Truy vấn và kiểm tra

### 5.1. Kiểm tra số lượng câu hỏi

```javascript
const Question = require('./models/Question');

// Đếm câu hỏi theo lớp và môn
const mathGrade3 = await Question.getCount(3, 'math');
console.log(`Lớp 3 - Toán: ${mathGrade3} câu`);

const allGrade3 = await Question.getCount(3);
console.log(`Lớp 3 - Tất cả: ${allGrade3} câu`);
```

### 5.2. Lấy câu hỏi ngẫu nhiên cho test

```javascript
// Lấy 15 câu ngẫu nhiên cho lớp 3 với phân bố môn
const questions = await Question.getRandomQuestions(3, 15, {
  math: 4,
  vietnamese: 4,
  english: 4,
  logic: 3
});

console.log(`Đã lấy ${questions.length} câu hỏi`);
```

### 5.3. Truy vấn SQL trực tiếp

```sql
-- Đếm câu hỏi theo môn và lớp
SELECT
  grade_level,
  subject,
  COUNT(*) as total
FROM questions
WHERE is_active = true
GROUP BY grade_level, subject
ORDER BY grade_level, subject;

-- Xem câu hỏi mới nhất
SELECT
  id,
  subject,
  topic,
  question_text
FROM questions
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
```

## 🎯 Bước 6: Tích hợp vào API

### 6.1. Tạo endpoint lấy câu hỏi

File: `/server/routes/questions.js`

```javascript
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions/test/:gradeLevel
router.get('/test/:gradeLevel', async (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.gradeLevel);

    const questions = await Question.getRandomQuestions(gradeLevel, 15, {
      math: 4,
      vietnamese: 4,
      english: 4,
      logic: 3
    });

    // Không trả về correct_answer cho client
    const questionsForClient = questions.map(q => ({
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      question_text: q.question_text,
      options: q.options
    }));

    res.json({
      success: true,
      data: questionsForClient
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy câu hỏi'
    });
  }
});

module.exports = router;
```

### 6.2. Tạo endpoint submit bài test

File: `/server/routes/test_results.js`

```javascript
const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const Question = require('../models/Question');

// POST /api/test-results/submit
router.post('/submit', async (req, res) => {
  try {
    const { user_id, grade_level, answers, time_taken } = req.body;

    // Validate answers
    const questionIds = answers.map(a => a.question_id);
    const questions = await Promise.all(
      questionIds.map(id => Question.getById(id))
    );

    // Calculate results
    let correct_answers = 0;
    const subject_scores = {};
    const detailedAnswers = [];

    answers.forEach((answer, index) => {
      const question = questions[index];
      const isCorrect = answer.user_answer === question.correct_answer;

      if (isCorrect) correct_answers++;

      // Subject breakdown
      if (!subject_scores[question.subject]) {
        subject_scores[question.subject] = { correct: 0, total: 0 };
      }
      subject_scores[question.subject].total++;
      if (isCorrect) subject_scores[question.subject].correct++;

      detailedAnswers.push({
        question_id: question.id,
        user_answer: answer.user_answer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect
      });
    });

    const score = Math.round((correct_answers / questions.length) * 100);
    const stars_earned = TestResult.calculateStarsEarned(score, grade_level);

    // Save result
    const result = await TestResult.create({
      user_id,
      grade_level,
      total_questions: questions.length,
      correct_answers,
      score,
      time_taken,
      subject_scores,
      answers: detailedAnswers,
      stars_earned
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài test'
    });
  }
});

module.exports = router;
```

## 📌 Lưu ý quan trọng

1. **Format JSON**: Khi thêm `options_json`, phải stringify array: `JSON.stringify(['A', 'B', 'C', 'D'])`

2. **Correct Answer**: Phải khớp chính xác với 1 trong các options (case-sensitive)

3. **Grade Level**: Chỉ dùng 3, 4, 5 (integer)

4. **Subject**: Chỉ dùng 4 giá trị: `math`, `vietnamese`, `english`, `logic`

5. **Indexes**: Database đã có indexes cho `subject`, `grade_level`, `topic` để truy vấn nhanh

## 🐛 Troubleshooting

### Migration lỗi?

```bash
# Xem status
npx knex migrate:status --knexfile server/knexfile.js

# Rollback và chạy lại
npx knex migrate:rollback --knexfile server/knexfile.js
npx knex migrate:latest --knexfile server/knexfile.js
```

### Seed lỗi?

```bash
# Xóa data cũ trước khi seed
node -e "require('./server/database/db').knex('questions').del().then(() => console.log('Deleted'))"

# Chạy lại seed
npx knex seed:run --knexfile server/knexfile.js
```

### Không kết nối được database?

Kiểm tra file `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vuotvumon
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- File log trong `/server/logs`
- Console output khi chạy migrations/seeds
- Database connection với `node -e "require('./server/database/db').testConnection()"`
