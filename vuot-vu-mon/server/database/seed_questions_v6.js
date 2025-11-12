const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🌱 Seeding questions for V6...');

// Sample questions for Toán Lớp 3
const mathQuestions = [
  {
    content_json: JSON.stringify({
      question: "Tính: 15 + 28 = ?",
      options: ["43", "42", "44", "41"]
    }),
    correct_answer: "43",
    type: "multiple_choice",
    explanation: "15 + 28 = 43",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép cộng" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Tính: 56 - 19 = ?",
      options: ["37", "38", "36", "35"]
    }),
    correct_answer: "37",
    type: "multiple_choice",
    explanation: "56 - 19 = 37",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép trừ" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Tính: 7 × 8 = ?",
      options: ["56", "54", "48", "64"]
    }),
    correct_answer: "56",
    type: "multiple_choice",
    explanation: "7 × 8 = 56",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép nhân" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Tính: 48 ÷ 6 = ?",
      options: ["8", "6", "7", "9"]
    }),
    correct_answer: "8",
    type: "multiple_choice",
    explanation: "48 ÷ 6 = 8",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép chia" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Một hình chữ nhật có chiều dài 8cm, chiều rộng 5cm. Chu vi hình chữ nhật là?",
      options: ["26 cm", "24 cm", "28 cm", "30 cm"]
    }),
    correct_answer: "26 cm",
    type: "multiple_choice",
    explanation: "Chu vi = (8 + 5) × 2 = 26 cm",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Hình học" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Tính: 125 + 275 = ?",
      options: ["400", "350", "450", "500"]
    }),
    correct_answer: "400",
    type: "multiple_choice",
    explanation: "125 + 275 = 400",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép cộng" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Tính: 9 × 6 = ?",
      options: ["54", "56", "48", "63"]
    }),
    correct_answer: "54",
    type: "multiple_choice",
    explanation: "9 × 6 = 54",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép nhân" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Tính: 72 ÷ 8 = ?",
      options: ["9", "8", "7", "10"]
    }),
    correct_answer: "9",
    type: "multiple_choice",
    explanation: "72 ÷ 8 = 9",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép chia" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Một hình vuông có cạnh 6cm. Diện tích hình vuông là?",
      options: ["36 cm²", "24 cm²", "30 cm²", "48 cm²"]
    }),
    correct_answer: "36 cm²",
    type: "multiple_choice",
    explanation: "Diện tích = 6 × 6 = 36 cm²",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Hình học" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Tính: 234 - 156 = ?",
      options: ["78", "88", "68", "98"]
    }),
    correct_answer: "78",
    type: "multiple_choice",
    explanation: "234 - 156 = 78",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Toán" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Phép trừ" }
    ]
  }
];

// Sample questions for Tiếng Việt Lớp 3
const vietnameseQuestions = [
  {
    content_json: JSON.stringify({
      question: "Chọn từ viết đúng chính tả:",
      options: ["Ngưòi", "Người", "Ngươi", "Ngừoi"]
    }),
    correct_answer: "Người",
    type: "multiple_choice",
    explanation: "Từ đúng là 'Người'",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Chính tả" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Từ nào sau đây là danh từ?",
      options: ["Chạy", "Sách", "Đẹp", "Nhanh"]
    }),
    correct_answer: "Sách",
    type: "multiple_choice",
    explanation: "'Sách' là danh từ chỉ sự vật",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Từ loại" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Chọn từ viết đúng chính tả:",
      options: ["Trươc", "Trước", "Truớc", "Truóc"]
    }),
    correct_answer: "Trước",
    type: "multiple_choice",
    explanation: "Từ đúng là 'Trước'",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Chính tả" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Từ nào sau đây là động từ?",
      options: ["Bàn", "Học", "Cao", "Lớn"]
    }),
    correct_answer: "Học",
    type: "multiple_choice",
    explanation: "'Học' là động từ chỉ hành động",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Từ loại" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Chọn từ viết đúng chính tả:",
      options: ["Tưởng", "Tuởng", "Tưòng", "Tuòng"]
    }),
    correct_answer: "Tưởng",
    type: "multiple_choice",
    explanation: "Từ đúng là 'Tưởng'",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Chính tả" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Từ nào sau đây là tính từ?",
      options: ["Chạy", "Bàn", "Đẹp", "Ăn"]
    }),
    correct_answer: "Đẹp",
    type: "multiple_choice",
    explanation: "'Đẹp' là tính từ chỉ tính chất",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Từ loại" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Chọn từ viết đúng chính tả:",
      options: ["Nguời", "Ngươì", "Người", "Ngừoi"]
    }),
    correct_answer: "Người",
    type: "multiple_choice",
    explanation: "Từ đúng là 'Người'",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Chính tả" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Trong câu 'Em học bài', từ 'học' là từ loại gì?",
      options: ["Danh từ", "Động từ", "Tính từ", "Trạng từ"]
    }),
    correct_answer: "Động từ",
    type: "multiple_choice",
    explanation: "'Học' là động từ chỉ hành động",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Từ loại" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Chọn từ viết đúng chính tả:",
      options: ["Thường", "Thuờng", "Thưòng", "Thuòng"]
    }),
    correct_answer: "Thường",
    type: "multiple_choice",
    explanation: "Từ đúng là 'Thường'",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Chính tả" }
    ]
  },
  {
    content_json: JSON.stringify({
      question: "Câu nào sau đây có dấu câu đúng?",
      options: [
        "Hôm nay, trời đẹp quá",
        "Hôm nay trời đẹp quá!",
        "Hôm nay trời đẹp quá",
        "Hôm nay. trời đẹp quá!"
      ]
    }),
    correct_answer: "Hôm nay trời đẹp quá!",
    type: "multiple_choice",
    explanation: "Câu cảm thán cần có dấu chấm than ở cuối",
    is_premium: 0,
    tags: [
      { tag_key: "game_type", tag_value: "quiz_race" },
      { tag_key: "môn_học", tag_value: "Tiếng Việt" },
      { tag_key: "lớp_nguồn", tag_value: "Lớp 3" },
      { tag_key: "chủ_đề", tag_value: "Dấu câu" }
    ]
  }
];

// Combine all questions
const allQuestions = [...mathQuestions, ...vietnameseQuestions];

// Prepare statements
const insertQuestion = db.prepare(`
  INSERT INTO questions (content_json, correct_answer, type, explanation, is_premium, created_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
`);

const insertTag = db.prepare(`
  INSERT INTO question_tags (question_id, tag_key, tag_value)
  VALUES (?, ?, ?)
`);

// Transaction to insert all questions
const insertAllQuestions = db.transaction((questions) => {
  let insertedCount = 0;

  for (const q of questions) {
    const result = insertQuestion.run(
      q.content_json,
      q.correct_answer,
      q.type,
      q.explanation,
      q.is_premium
    );

    const questionId = result.lastInsertRowid;

    // Insert tags
    for (const tag of q.tags) {
      insertTag.run(questionId, tag.tag_key, tag.tag_value);
    }

    insertedCount++;
  }

  return insertedCount;
});

try {
  const count = insertAllQuestions(allQuestions);
  console.log(`✅ Successfully seeded ${count} questions!`);

  // Verify
  const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get();
  const totalTags = db.prepare('SELECT COUNT(*) as count FROM question_tags').get();

  console.log(`📊 Total questions in database: ${totalQuestions.count}`);
  console.log(`📊 Total tags in database: ${totalTags.count}`);

  // Show breakdown by subject
  const mathCount = db.prepare(`
    SELECT COUNT(DISTINCT q.id) as count
    FROM questions q
    JOIN question_tags qt ON q.id = qt.question_id
    WHERE qt.tag_key = 'môn_học' AND qt.tag_value = 'Toán'
  `).get();

  const vietnameseCount = db.prepare(`
    SELECT COUNT(DISTINCT q.id) as count
    FROM questions q
    JOIN question_tags qt ON q.id = qt.question_id
    WHERE qt.tag_key = 'môn_học' AND qt.tag_value = 'Tiếng Việt'
  `).get();

  console.log(`📚 Toán: ${mathCount.count} questions`);
  console.log(`📚 Tiếng Việt: ${vietnameseCount.count} questions`);

} catch (error) {
  console.error('❌ Error seeding questions:', error);
  process.exit(1);
}

db.close();
console.log('🎉 Seeding completed!');
