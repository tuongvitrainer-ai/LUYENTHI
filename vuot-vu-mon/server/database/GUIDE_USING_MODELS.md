# Hướng dẫn sử dụng Models (Question & TestResult)

## 📚 Mục lục
1. [Setup & Import Models](#setup--import-models)
2. [Question Model - Chi tiết](#question-model)
3. [TestResult Model - Chi tiết](#testresult-model)
4. [Ví dụ thực tế](#vi-du-thuc-te)
5. [Tích hợp vào API Routes](#tich-hop-vao-api-routes)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 1. Setup & Import Models

### Cấu trúc thư mục

```
server/
├── models/
│   ├── Question.js      ← Model quản lý câu hỏi
│   └── TestResult.js    ← Model quản lý kết quả test
├── routes/
│   ├── questions.js     ← API routes cho questions
│   └── testResults.js   ← API routes cho test results
├── controllers/
│   └── ...
└── database/
    └── db.js            ← Database connection
```

### Import Models trong file

```javascript
// Import trong route hoặc controller
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

// Hoặc import cả 2
const { Question, TestResult } = {
  Question: require('../models/Question'),
  TestResult: require('../models/TestResult')
};
```

---

## 2. Question Model - Chi tiết

### 📖 **Question.getByGradeAndSubject(gradeLevel, subject)**

Lấy tất cả câu hỏi theo lớp và môn học.

**Parameters:**
- `gradeLevel` (number): 3, 4, 5
- `subject` (string, optional): 'math', 'vietnamese', 'english', 'logic'

**Returns:** Promise<Array> - Mảng các câu hỏi đã parse JSON

**Ví dụ 1: Lấy tất cả câu Toán lớp 3**

```javascript
const Question = require('./models/Question');

async function getMathGrade3() {
  try {
    const questions = await Question.getByGradeAndSubject(3, 'math');

    console.log(`Tìm thấy ${questions.length} câu hỏi`);

    questions.forEach((q, index) => {
      console.log(`\n${index + 1}. ${q.question_text}`);
      console.log(`   Topic: ${q.topic}`);
      console.log(`   Options:`, q.options); // Đã parse thành array
      console.log(`   Answer: ${q.correct_answer}`);
    });

    return questions;
  } catch (error) {
    console.error('Error:', error);
  }
}

getMathGrade3();
```

**Output:**
```
Tìm thấy 4 câu hỏi

1. 125 + 378 = ?
   Topic: Phép cộng
   Options: [ '493', '503', '513', '523' ]
   Answer: 503

2. 500 - 247 = ?
   Topic: Phép trừ
   Options: [ '253', '263', '243', '273' ]
   Answer: 253
...
```

**Ví dụ 2: Lấy TẤT CẢ câu hỏi lớp 3 (mọi môn)**

```javascript
async function getAllGrade3() {
  const questions = await Question.getByGradeAndSubject(3);
  // Không truyền subject → lấy tất cả

  // Group by subject
  const bySubject = questions.reduce((acc, q) => {
    if (!acc[q.subject]) acc[q.subject] = [];
    acc[q.subject].push(q);
    return acc;
  }, {});

  console.log('Thống kê:');
  Object.keys(bySubject).forEach(subject => {
    console.log(`${subject}: ${bySubject[subject].length} câu`);
  });

  return bySubject;
}
```

---

### 🎲 **Question.getRandomQuestions(gradeLevel, count, distribution)**

Lấy câu hỏi ngẫu nhiên cho bài test.

**Parameters:**
- `gradeLevel` (number): 3, 4, 5
- `count` (number): Số câu hỏi muốn lấy
- `distribution` (object, optional): Phân bố theo môn

**Returns:** Promise<Array> - Mảng câu hỏi đã shuffle

**Ví dụ 1: Lấy 15 câu ngẫu nhiên KHÔNG phân bố**

```javascript
async function createRandomTest() {
  const questions = await Question.getRandomQuestions(3, 15);

  console.log('Test ngẫu nhiên 15 câu:');
  questions.forEach((q, i) => {
    console.log(`${i + 1}. [${q.subject}] ${q.question_text}`);
  });

  return questions;
}
```

**Ví dụ 2: Lấy 15 câu CÓ phân bố cụ thể**

```javascript
async function createBalancedTest() {
  const distribution = {
    math: 4,        // 4 câu Toán
    vietnamese: 4,  // 4 câu Tiếng Việt
    english: 4,     // 4 câu Tiếng Anh
    logic: 3        // 3 câu Logic
  };

  const questions = await Question.getRandomQuestions(3, 15, distribution);

  // Verify distribution
  const actual = questions.reduce((acc, q) => {
    acc[q.subject] = (acc[q.subject] || 0) + 1;
    return acc;
  }, {});

  console.log('Phân bố thực tế:', actual);
  // Output: { math: 4, vietnamese: 4, english: 4, logic: 3 }

  return questions;
}
```

**Ví dụ 3: Tạo test với tỷ lệ tùy chỉnh**

```javascript
async function createCustomTest() {
  // Test lớp 4 - tập trung vào Toán và Logic
  const questions = await Question.getRandomQuestions(4, 10, {
    math: 5,      // 50%
    logic: 3,     // 30%
    english: 2    // 20%
  });

  return questions;
}
```

---

### ➕ **Question.create(questionData)**

Thêm câu hỏi mới.

**Parameters:**
- `questionData` (object): Dữ liệu câu hỏi

**Returns:** Promise<Object> - Câu hỏi vừa tạo

**Ví dụ 1: Thêm 1 câu hỏi Toán**

```javascript
async function addMathQuestion() {
  const newQuestion = await Question.create({
    subject: 'math',
    topic: 'Phép nhân',
    grade_level: 3,
    question_text: '9 × 7 = ?',
    options: ['56', '63', '72', '81'],
    correct_answer: '63',
    explanation: '9 × 7 = 63',
    difficulty: 'easy'
  });

  console.log('Đã thêm câu hỏi:', newQuestion.id);
  return newQuestion;
}
```

**Ví dụ 2: Thêm nhiều câu hỏi từ array**

```javascript
async function addMultipleQuestions() {
  const questionsData = [
    {
      subject: 'math',
      topic: 'Phép chia',
      grade_level: 3,
      question_text: '81 ÷ 9 = ?',
      options: ['7', '8', '9', '10'],
      correct_answer: '9',
      difficulty: 'easy'
    },
    {
      subject: 'vietnamese',
      topic: 'Từ vựng',
      grade_level: 3,
      question_text: 'Từ nào là động vật?',
      options: ['Bàn', 'Ghế', 'Chó', 'Cây'],
      correct_answer: 'Chó',
      difficulty: 'easy'
    }
  ];

  const results = [];
  for (const data of questionsData) {
    const question = await Question.create(data);
    results.push(question);
    console.log(`✅ Đã thêm: ${question.question_text}`);
  }

  return results;
}
```

**Ví dụ 3: Import từ file JSON**

```javascript
const fs = require('fs').promises;

async function importFromJSON(filePath) {
  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    const questions = JSON.parse(jsonData);

    console.log(`Đang import ${questions.length} câu hỏi...`);

    let success = 0;
    let failed = 0;

    for (const q of questions) {
      try {
        await Question.create(q);
        success++;
      } catch (error) {
        console.error(`Lỗi với câu: ${q.question_text}`, error.message);
        failed++;
      }
    }

    console.log(`\n✅ Thành công: ${success}`);
    console.log(`❌ Thất bại: ${failed}`);

  } catch (error) {
    console.error('Lỗi đọc file:', error);
  }
}

// Sử dụng
importFromJSON('./questions_grade3.json');
```

---

### 🔍 **Question.getById(id)**

Lấy câu hỏi theo ID.

```javascript
async function getQuestionDetail(questionId) {
  const question = await Question.getById(questionId);

  if (!question) {
    console.log('Không tìm thấy câu hỏi');
    return null;
  }

  console.log('Chi tiết câu hỏi:');
  console.log('ID:', question.id);
  console.log('Môn:', question.subject);
  console.log('Topic:', question.topic);
  console.log('Câu hỏi:', question.question_text);
  console.log('Đáp án:', question.options);
  console.log('Đúng:', question.correct_answer);

  return question;
}
```

---

### ✏️ **Question.update(id, updates)**

Cập nhật câu hỏi.

**Ví dụ 1: Sửa nội dung câu hỏi**

```javascript
async function fixTypo(questionId) {
  const updated = await Question.update(questionId, {
    question_text: '12 × 5 = ?',  // Sửa từ 12 × 6
    correct_answer: '60',          // Sửa đáp án tương ứng
    explanation: '12 × 5 = 60'
  });

  console.log('Đã cập nhật:', updated.question_text);
  return updated;
}
```

**Ví dụ 2: Thay đổi độ khó**

```javascript
async function changeDifficulty(questionId, newDifficulty) {
  return await Question.update(questionId, {
    difficulty: newDifficulty  // 'easy', 'medium', 'hard'
  });
}
```

---

### 🗑️ **Question.delete(id)**

Xóa câu hỏi (soft delete - set is_active = false).

```javascript
async function deactivateQuestion(questionId) {
  await Question.delete(questionId);
  console.log(`Đã vô hiệu hóa câu hỏi #${questionId}`);
}
```

---

### 📊 **Question.getCount(gradeLevel, subject)**

Đếm số câu hỏi.

```javascript
async function showStatistics() {
  const subjects = ['math', 'vietnamese', 'english', 'logic'];

  console.log('\n📊 THỐNG KÊ CÂU HỎI\n');

  for (let grade = 3; grade <= 5; grade++) {
    console.log(`Lớp ${grade}:`);

    for (const subject of subjects) {
      const count = await Question.getCount(grade, subject);
      console.log(`  ${subject}: ${count} câu`);
    }

    const total = await Question.getCount(grade);
    console.log(`  TỔNG: ${total} câu\n`);
  }
}
```

---

## 3. TestResult Model - Chi tiết

### ➕ **TestResult.create(resultData)**

Lưu kết quả bài test.

**Ví dụ 1: Lưu kết quả cơ bản**

```javascript
async function saveTestResult(userId, gradeLevel, userAnswers) {
  // userAnswers format: [{ question_id: 1, user_answer: '503' }, ...]

  // Get questions to check answers
  const questionIds = userAnswers.map(a => a.question_id);
  const questions = await Promise.all(
    questionIds.map(id => Question.getById(id))
  );

  // Calculate results
  let correct = 0;
  const subjectScores = {};
  const detailedAnswers = [];

  userAnswers.forEach((answer, index) => {
    const question = questions[index];
    const isCorrect = answer.user_answer === question.correct_answer;

    if (isCorrect) correct++;

    // Track by subject
    if (!subjectScores[question.subject]) {
      subjectScores[question.subject] = { correct: 0, total: 0 };
    }
    subjectScores[question.subject].total++;
    if (isCorrect) subjectScores[question.subject].correct++;

    // Detailed answers
    detailedAnswers.push({
      question_id: question.id,
      user_answer: answer.user_answer,
      correct_answer: question.correct_answer,
      is_correct: isCorrect,
      subject: question.subject
    });
  });

  const score = Math.round((correct / questions.length) * 100);
  const stars = TestResult.calculateStarsEarned(score, gradeLevel);

  // Save to database
  const result = await TestResult.create({
    user_id: userId,
    grade_level: gradeLevel,
    total_questions: questions.length,
    correct_answers: correct,
    score: score,
    time_taken: 1200, // 20 phút = 1200 giây
    subject_scores: subjectScores,
    answers: detailedAnswers,
    stars_earned: stars
  });

  console.log(`✅ Đã lưu kết quả test #${result.id}`);
  console.log(`   Điểm: ${score}/100`);
  console.log(`   Số sao: ${stars} ⭐`);

  return result;
}
```

**Ví dụ 2: Tích hợp với Express API**

```javascript
// Route handler
router.post('/api/test/submit', async (req, res) => {
  try {
    const { user_id, grade_level, answers, time_taken } = req.body;

    // Validate
    if (!user_id || !grade_level || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Process and save
    const result = await saveTestResult(user_id, grade_level, answers, time_taken);

    res.json({
      success: true,
      data: {
        test_id: result.id,
        score: result.score,
        stars_earned: result.stars_earned,
        correct_answers: result.correct_answers,
        total_questions: result.total_questions,
        subject_scores: result.subject_scores
      }
    });

  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu kết quả'
    });
  }
});
```

---

### 📖 **TestResult.getById(id)**

Lấy kết quả test theo ID.

```javascript
async function viewTestResult(testId) {
  const result = await TestResult.getById(testId);

  if (!result) {
    console.log('Không tìm thấy kết quả');
    return;
  }

  console.log('\n📊 KẾT QUẢ BÀI TEST\n');
  console.log(`Test ID: ${result.id}`);
  console.log(`User ID: ${result.user_id}`);
  console.log(`Lớp: ${result.grade_level}`);
  console.log(`Điểm: ${result.score}/100`);
  console.log(`Đúng: ${result.correct_answers}/${result.total_questions}`);
  console.log(`Thời gian: ${Math.floor(result.time_taken / 60)} phút ${result.time_taken % 60} giây`);
  console.log(`Sao: ${result.stars_earned} ⭐`);

  console.log('\nĐiểm theo môn:');
  Object.entries(result.subject_scores).forEach(([subject, score]) => {
    const percentage = Math.round((score.correct / score.total) * 100);
    console.log(`  ${subject}: ${score.correct}/${score.total} (${percentage}%)`);
  });

  return result;
}
```

---

### 📚 **TestResult.getByUser(userId, filters)**

Lấy lịch sử test của user.

**Ví dụ 1: Xem tất cả test của user**

```javascript
async function getUserHistory(userId) {
  const results = await TestResult.getByUser(userId);

  console.log(`\nLịch sử test của user #${userId}:\n`);

  results.forEach((result, index) => {
    console.log(`${index + 1}. Test #${result.id}`);
    console.log(`   Lớp ${result.grade_level} - Điểm: ${result.score}/100`);
    console.log(`   Ngày: ${result.completed_at.toLocaleDateString()}`);
    console.log(`   Sao: ${result.stars_earned} ⭐\n`);
  });

  return results;
}
```

**Ví dụ 2: Lọc theo lớp và giới hạn số lượng**

```javascript
async function getRecentTests(userId, gradeLevel, limit = 5) {
  const results = await TestResult.getByUser(userId, {
    grade_level: gradeLevel,
    limit: limit
  });

  console.log(`${limit} test gần nhất lớp ${gradeLevel}:`);
  results.forEach(r => {
    console.log(`- Test #${r.id}: ${r.score} điểm (${r.completed_at.toLocaleDateString()})`);
  });

  return results;
}
```

---

### 🏆 **TestResult.getBestScore(userId, gradeLevel)**

Lấy điểm cao nhất của user.

```javascript
async function showBestScore(userId, gradeLevel) {
  const best = await TestResult.getBestScore(userId, gradeLevel);

  if (!best) {
    console.log('Chưa có kết quả nào');
    return null;
  }

  console.log(`\n🏆 ĐIỂM CAO NHẤT LỚP ${gradeLevel}\n`);
  console.log(`Điểm: ${best.score}/100`);
  console.log(`Đúng: ${best.correct_answers}/${best.total_questions}`);
  console.log(`Ngày đạt: ${best.completed_at.toLocaleDateString()}`);
  console.log(`Sao nhận được: ${best.stars_earned} ⭐`);

  return best;
}
```

---

### 📊 **TestResult.getUserStats(userId, gradeLevel)**

Lấy thống kê của user.

```javascript
async function displayUserStats(userId, gradeLevel) {
  const stats = await TestResult.getUserStats(userId, gradeLevel);

  console.log(`\n📊 THỐNG KÊ LỚP ${gradeLevel}\n`);
  console.log(`Số lần thi: ${stats.total_attempts}`);
  console.log(`Điểm cao nhất: ${stats.best_score}/100`);
  console.log(`Điểm trung bình: ${stats.average_score}/100`);
  console.log(`Tổng sao: ${stats.total_stars} ⭐`);
  console.log(`Thời gian trung bình: ${Math.floor(stats.average_time / 60)} phút`);

  return stats;
}
```

---

### 🥇 **TestResult.getLeaderboard(gradeLevel, limit)**

Lấy bảng xếp hạng.

```javascript
async function showLeaderboard(gradeLevel, topN = 10) {
  const leaderboard = await TestResult.getLeaderboard(gradeLevel, topN);

  console.log(`\n🥇 TOP ${topN} LỚP ${gradeLevel}\n`);

  leaderboard.forEach((entry, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    console.log(`${medal} ${entry.username || entry.full_name}`);
    console.log(`   Điểm cao nhất: ${entry.best_score}/100`);
    console.log(`   Số lần thi: ${entry.total_attempts}`);
    console.log(`   Tổng sao: ${entry.total_stars} ⭐\n`);
  });

  return leaderboard;
}
```

---

### ⭐ **TestResult.calculateStarsEarned(score, gradeLevel)**

Tính số sao dựa trên điểm.

```javascript
// Static method - không cần async
const stars = TestResult.calculateStarsEarned(85, 3);
console.log(`Điểm 85 lớp 3 = ${stars} sao`); // 4 sao

// Bảng quy đổi:
// 90-100: 5 sao
// 80-89:  4 sao
// 70-79:  3 sao
// 60-69:  2 sao
// 50-59:  1 sao
// < 50:   0 sao
// Bonus: +1 sao cho lớp 5
```

---

## 4. Ví dụ thực tế

### 📝 **Script 1: Tạo bài test hoàn chỉnh**

File: `/server/scripts/create_test.js`

```javascript
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

async function createAndTakeTest(userId, gradeLevel) {
  console.log(`\n🎯 TẠO BÀI TEST LỚP ${gradeLevel} CHO USER #${userId}\n`);

  // 1. Lấy 15 câu ngẫu nhiên
  const questions = await Question.getRandomQuestions(gradeLevel, 15, {
    math: 4,
    vietnamese: 4,
    english: 4,
    logic: 3
  });

  console.log(`✅ Đã tạo test với ${questions.length} câu hỏi`);

  // 2. Giả lập user làm bài (80% đúng)
  const userAnswers = questions.map(q => ({
    question_id: q.id,
    user_answer: Math.random() > 0.2 ? q.correct_answer : q.options[0]
  }));

  // 3. Chấm điểm và lưu kết quả
  let correct = 0;
  const subjectScores = {};
  const detailedAnswers = [];

  questions.forEach((q, index) => {
    const answer = userAnswers[index];
    const isCorrect = answer.user_answer === q.correct_answer;

    if (isCorrect) correct++;

    if (!subjectScores[q.subject]) {
      subjectScores[q.subject] = { correct: 0, total: 0 };
    }
    subjectScores[q.subject].total++;
    if (isCorrect) subjectScores[q.subject].correct++;

    detailedAnswers.push({
      question_id: q.id,
      user_answer: answer.user_answer,
      correct_answer: q.correct_answer,
      is_correct: isCorrect
    });
  });

  const score = Math.round((correct / questions.length) * 100);
  const stars = TestResult.calculateStarsEarned(score, gradeLevel);

  const result = await TestResult.create({
    user_id: userId,
    grade_level: gradeLevel,
    total_questions: questions.length,
    correct_answers: correct,
    score: score,
    time_taken: Math.floor(Math.random() * 1800) + 600, // 10-30 phút
    subject_scores: subjectScores,
    answers: detailedAnswers,
    stars_earned: stars
  });

  console.log(`\n📊 KẾT QUẢ:`);
  console.log(`   Test ID: ${result.id}`);
  console.log(`   Điểm: ${score}/100`);
  console.log(`   Đúng: ${correct}/${questions.length}`);
  console.log(`   Sao: ${stars} ⭐`);

  return result;
}

// Chạy
createAndTakeTest(1, 3).then(() => process.exit());
```

Chạy script:
```bash
node server/scripts/create_test.js
```

---

### 📊 **Script 2: Xuất báo cáo thống kê**

File: `/server/scripts/generate_report.js`

```javascript
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');
const fs = require('fs').promises;

async function generateReport() {
  const report = {
    generated_at: new Date().toISOString(),
    questions: {},
    users: {}
  };

  // 1. Thống kê câu hỏi
  for (let grade = 3; grade <= 5; grade++) {
    report.questions[`grade_${grade}`] = {};

    const subjects = ['math', 'vietnamese', 'english', 'logic'];
    for (const subject of subjects) {
      const count = await Question.getCount(grade, subject);
      report.questions[`grade_${grade}`][subject] = count;
    }
  }

  // 2. Thống kê top users (giả sử có userIds)
  const userIds = [1, 2, 3]; // Thay bằng query từ DB

  for (const userId of userIds) {
    report.users[`user_${userId}`] = {};

    for (let grade = 3; grade <= 5; grade++) {
      const stats = await TestResult.getUserStats(userId, grade);
      report.users[`user_${userId}`][`grade_${grade}`] = stats;
    }
  }

  // 3. Leaderboard
  report.leaderboards = {};
  for (let grade = 3; grade <= 5; grade++) {
    report.leaderboards[`grade_${grade}`] = await TestResult.getLeaderboard(grade, 5);
  }

  // 4. Lưu file
  await fs.writeFile(
    './report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Đã tạo báo cáo: report.json');
}

generateReport().then(() => process.exit());
```

---

### 🔄 **Script 3: Migrate data từ format cũ**

File: `/server/scripts/migrate_old_questions.js`

```javascript
const Question = require('../models/Question');
const fs = require('fs').promises;

async function migrateOldFormat() {
  // Đọc file questions cũ
  const oldData = JSON.parse(
    await fs.readFile('./old_questions.json', 'utf8')
  );

  console.log(`Đang migrate ${oldData.length} câu hỏi...`);

  let success = 0;
  let failed = 0;

  for (const oldQ of oldData) {
    try {
      // Convert old format to new format
      const newQuestion = {
        subject: oldQ.mon_hoc.toLowerCase(),
        topic: oldQ.chu_de,
        grade_level: oldQ.lop,
        question_text: oldQ.noi_dung,
        options: oldQ.cac_dap_an,
        correct_answer: oldQ.dap_an_dung,
        explanation: oldQ.giai_thich || null,
        difficulty: oldQ.do_kho || 'medium'
      };

      await Question.create(newQuestion);
      success++;

      if (success % 10 === 0) {
        console.log(`Đã migrate ${success} câu...`);
      }

    } catch (error) {
      console.error(`Lỗi: ${oldQ.noi_dung}`, error.message);
      failed++;
    }
  }

  console.log(`\n✅ Thành công: ${success}`);
  console.log(`❌ Thất bại: ${failed}`);
}

migrateOldFormat().then(() => process.exit());
```

---

## 5. Tích hợp vào API Routes

### File: `/server/routes/questions.js`

```javascript
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions/test/:gradeLevel - Lấy câu hỏi cho test
router.get('/test/:gradeLevel', async (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.gradeLevel);

    if (![3, 4, 5].includes(gradeLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Grade level phải là 3, 4, hoặc 5'
      });
    }

    const questions = await Question.getRandomQuestions(gradeLevel, 15, {
      math: 4,
      vietnamese: 4,
      english: 4,
      logic: 3
    });

    // Không gửi correct_answer về client
    const safeQuestions = questions.map(q => ({
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      question_text: q.question_text,
      options: q.options,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      data: safeQuestions
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy câu hỏi'
    });
  }
});

// GET /api/questions/stats/:gradeLevel - Thống kê
router.get('/stats/:gradeLevel', async (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.gradeLevel);
    const subjects = ['math', 'vietnamese', 'english', 'logic'];

    const stats = {};
    for (const subject of subjects) {
      stats[subject] = await Question.getCount(gradeLevel, subject);
    }
    stats.total = await Question.getCount(gradeLevel);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/questions - Thêm câu hỏi (admin only)
router.post('/', async (req, res) => {
  try {
    // TODO: Check admin permission

    const question = await Question.create(req.body);

    res.status(201).json({
      success: true,
      data: question
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

### File: `/server/routes/testResults.js`

```javascript
const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const Question = require('../models/Question');

// POST /api/test-results/submit - Nộp bài test
router.post('/submit', async (req, res) => {
  try {
    const { user_id, grade_level, answers, time_taken } = req.body;

    // Validate
    if (!user_id || !grade_level || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    // Get questions để chấm điểm
    const questionIds = answers.map(a => a.question_id);
    const questions = await Promise.all(
      questionIds.map(id => Question.getById(id))
    );

    // Check questions exist
    if (questions.some(q => !q)) {
      return res.status(404).json({
        success: false,
        message: 'Một số câu hỏi không tồn tại'
      });
    }

    // Calculate results
    let correct = 0;
    const subjectScores = {};
    const detailedAnswers = [];

    answers.forEach((answer, index) => {
      const question = questions[index];
      const isCorrect = answer.user_answer === question.correct_answer;

      if (isCorrect) correct++;

      if (!subjectScores[question.subject]) {
        subjectScores[question.subject] = { correct: 0, total: 0 };
      }
      subjectScores[question.subject].total++;
      if (isCorrect) subjectScores[question.subject].correct++;

      detailedAnswers.push({
        question_id: question.id,
        user_answer: answer.user_answer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect
      });
    });

    const score = Math.round((correct / questions.length) * 100);
    const stars = TestResult.calculateStarsEarned(score, grade_level);

    // Save result
    const result = await TestResult.create({
      user_id,
      grade_level,
      total_questions: questions.length,
      correct_answers: correct,
      score,
      time_taken,
      subject_scores: subjectScores,
      answers: detailedAnswers,
      stars_earned: stars
    });

    res.json({
      success: true,
      data: {
        test_id: result.id,
        score: result.score,
        correct_answers: result.correct_answers,
        total_questions: result.total_questions,
        stars_earned: result.stars_earned,
        subject_scores: result.subject_scores
      }
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài'
    });
  }
});

// GET /api/test-results/user/:userId - Lịch sử của user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { grade_level, limit } = req.query;

    const filters = {};
    if (grade_level) filters.grade_level = parseInt(grade_level);
    if (limit) filters.limit = parseInt(limit);

    const results = await TestResult.getByUser(userId, filters);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/test-results/leaderboard/:gradeLevel - Bảng xếp hạng
router.get('/leaderboard/:gradeLevel', async (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.gradeLevel);
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = await TestResult.getLeaderboard(gradeLevel, limit);

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

### Đăng ký routes trong `/server/index.js`:

```javascript
const questionRoutes = require('./routes/questions');
const testResultRoutes = require('./routes/testResults');

app.use('/api/questions', questionRoutes);
app.use('/api/test-results', testResultRoutes);
```

---

## 6. Error Handling

### Wrapper function cho async routes

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sử dụng
router.get('/test/:id', asyncHandler(async (req, res) => {
  const result = await TestResult.getById(req.params.id);
  res.json({ success: true, data: result });
}));
```

### Custom error class

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Sử dụng
if (!question) {
  throw new AppError('Question not found', 404);
}
```

---

## 7. Best Practices

### ✅ DO:

1. **Validate input** trước khi gọi Model
2. **Try-catch** cho tất cả async operations
3. **Log errors** để debug
4. **Không expose sensitive data** (correct_answer) về client
5. **Use transactions** cho operations phức tạp
6. **Index database** cho performance
7. **Pagination** cho large datasets

### ❌ DON'T:

1. **Không hardcode** IDs hoặc values
2. **Không trust client data** - always validate
3. **Không return toàn bộ database object** - select fields
4. **Không skip error handling**
5. **Không để SQL injection** - dùng parameterized queries (Knex tự động)

---

## 🎯 Kết luận

Models cung cấp interface clean và an toàn để làm việc với database. Sử dụng chúng thay vì viết raw SQL để:

- ✅ Code dễ maintain hơn
- ✅ Tránh SQL injection
- ✅ Reusable logic
- ✅ Type safety tốt hơn
- ✅ Dễ test hơn

**Next steps:**
1. Chạy migrations: `npx knex migrate:latest`
2. Seed data: `npx knex seed:run`
3. Test models bằng scripts phía trên
4. Tích hợp vào API routes
5. Connect với React frontend

Happy coding! 🚀
