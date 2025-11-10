const { db } = require('./db');

/**
 * Seed data for Grade 3 questions
 * Includes questions for: Math, Vietnamese, English
 */

const seedQuestions = [
  // ============================================
  // TOÁN - LỚP 3
  // ============================================
  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Tính: 25 + 37 = ?',
      options: [
        { id: 'A', text: '52' },
        { id: 'B', text: '62' },
        { id: 'C', text: '72' },
        { id: 'D', text: '82' }
      ],
      correct_answer: 'B',
      explanation: '25 + 37 = 62'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Toán' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Phép cộng' }
    ],
    difficulty_level: 1,
    points: 10,
    time_limit: 30
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Tính: 8 × 7 = ?',
      options: [
        { id: 'A', text: '54' },
        { id: 'B', text: '56' },
        { id: 'C', text: '58' },
        { id: 'D', text: '64' }
      ],
      correct_answer: 'B',
      explanation: '8 × 7 = 56'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Toán' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Bảng nhân' }
    ],
    difficulty_level: 2,
    points: 15,
    time_limit: 30
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Tính: 45 - 28 = ?',
      options: [
        { id: 'A', text: '15' },
        { id: 'B', text: '16' },
        { id: 'C', text: '17' },
        { id: 'D', text: '18' }
      ],
      correct_answer: 'C',
      explanation: '45 - 28 = 17'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Toán' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Phép trừ' }
    ],
    difficulty_level: 2,
    points: 10,
    time_limit: 30
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Một hình chữ nhật có chiều dài 8cm, chiều rộng 5cm. Chu vi hình chữ nhật là:',
      options: [
        { id: 'A', text: '13cm' },
        { id: 'B', text: '26cm' },
        { id: 'C', text: '40cm' },
        { id: 'D', text: '52cm' }
      ],
      correct_answer: 'B',
      explanation: 'Chu vi = (8 + 5) × 2 = 26cm'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Toán' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Hình học' }
    ],
    difficulty_level: 3,
    points: 20,
    time_limit: 60
  },

  // ============================================
  // TIẾNG VIỆT - LỚP 3
  // ============================================
  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Chọn từ điền vào chỗ trống: "Mẹ tôi làm nghề ___."',
      options: [
        { id: 'A', text: 'giáo viên' },
        { id: 'B', text: 'giáo dục' },
        { id: 'C', text: 'dạy học' },
        { id: 'D', text: 'học sinh' }
      ],
      correct_answer: 'A',
      explanation: 'Làm nghề + danh từ chỉ nghề nghiệp. "Giáo viên" là danh từ chỉ nghề.'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Tiếng Việt' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Từ vựng' }
    ],
    difficulty_level: 1,
    points: 10,
    time_limit: 30
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Từ nào sau đây viết đúng chính tả?',
      options: [
        { id: 'A', text: 'học sịnh' },
        { id: 'B', text: 'học sinh' },
        { id: 'C', text: 'hoc sinh' },
        { id: 'D', text: 'học xịnh' }
      ],
      correct_answer: 'B',
      explanation: 'Từ đúng chính tả là "học sinh"'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Tiếng Việt' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Chính tả' }
    ],
    difficulty_level: 1,
    points: 10,
    time_limit: 20
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Đâu là câu có dấu chấm hỏi?',
      options: [
        { id: 'A', text: 'Hôm nay trời đẹp quá.' },
        { id: 'B', text: 'Em đi học chưa' },
        { id: 'C', text: 'Bạn tên là gì?' },
        { id: 'D', text: 'Thật tuyệt vời!' }
      ],
      correct_answer: 'C',
      explanation: 'Câu hỏi phải có dấu chấm hỏi ở cuối câu.'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Tiếng Việt' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Dấu câu' }
    ],
    difficulty_level: 2,
    points: 10,
    time_limit: 30
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'Từ trái nghĩa với "cao" là:',
      options: [
        { id: 'A', text: 'thấp' },
        { id: 'B', text: 'bé' },
        { id: 'C', text: 'nhỏ' },
        { id: 'D', text: 'to' }
      ],
      correct_answer: 'A',
      explanation: '"Cao" trái nghĩa với "thấp"'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Tiếng Việt' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Từ trái nghĩa' }
    ],
    difficulty_level: 1,
    points: 10,
    time_limit: 20
  },

  // ============================================
  // TIẾNG ANH - LỚP 3
  // ============================================
  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'What is this? (Đây là gì?) - Hình một quả táo',
      image_url: null,
      options: [
        { id: 'A', text: 'It is an apple' },
        { id: 'B', text: 'It is a banana' },
        { id: 'C', text: 'It is an orange' },
        { id: 'D', text: 'It is a grape' }
      ],
      correct_answer: 'A',
      explanation: 'Apple = Táo. Dùng "an" trước nguyên âm.'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Tiếng Anh' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Fruits (Trái cây)' }
    ],
    difficulty_level: 1,
    points: 10,
    time_limit: 30
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'How old are you? (Bạn bao nhiêu tuổi?) - I am ___ years old.',
      options: [
        { id: 'A', text: 'eight' },
        { id: 'B', text: 'ate' },
        { id: 'C', text: 'eigt' },
        { id: 'D', text: 'eit' }
      ],
      correct_answer: 'A',
      explanation: '"Eight" (số 8) là cách viết đúng.'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Tiếng Anh' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Numbers (Số đếm)' }
    ],
    difficulty_level: 1,
    points: 10,
    time_limit: 20
  },

  {
    content_json: {
      question_type: 'multiple_choice',
      question_text: 'I ___ a student. (Tôi là một học sinh)',
      options: [
        { id: 'A', text: 'am' },
        { id: 'B', text: 'is' },
        { id: 'C', text: 'are' },
        { id: 'D', text: 'be' }
      ],
      correct_answer: 'A',
      explanation: 'Với chủ ngữ "I" ta dùng động từ "am"'
    },
    tags: [
      { tag_type: 'subject', tag_value: 'Tiếng Anh' },
      { tag_type: 'grade', tag_value: 'Lớp 3' },
      { tag_type: 'topic', tag_value: 'Grammar (Ngữ pháp)' }
    ],
    difficulty_level: 2,
    points: 10,
    time_limit: 30
  }
];

function seedDatabase() {
  console.log('🌱 Starting seed process for Grade 3 questions...\n');

  try {
    // Check if questions already exist
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM questions').get();

    if (existingCount.count > 0) {
      console.log(`⚠️  Database already has ${existingCount.count} question(s).`);
      console.log('Do you want to continue? This will add more questions.\n');
      // For now, we'll continue. In production, you might want to ask for confirmation.
    }

    // Get or create admin user for created_by field
    let adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();

    if (!adminUser) {
      console.log('📝 No admin user found. Creating default admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);

      const result = db.prepare(`
        INSERT INTO users (username, email, password_hash, display_name, role, auth_provider)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('admin', 'admin@vuotvumon.com', hashedPassword, 'System Admin', 'admin', 'manual');

      adminUser = { id: result.lastInsertRowid };
      console.log(`✅ Admin user created (ID: ${adminUser.id})\n`);
    }

    // Use transaction to insert all questions
    const insertTransaction = db.transaction((questions, userId) => {
      const insertQuestion = db.prepare(`
        INSERT INTO questions (content_json, difficulty_level, points, time_limit, created_by, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `);

      const insertTag = db.prepare(`
        INSERT INTO question_tags (question_id, tag_type, tag_value)
        VALUES (?, ?, ?)
      `);

      const insertedQuestions = [];

      for (const q of questions) {
        // Insert question
        const contentJson = JSON.stringify(q.content_json);
        const questionResult = insertQuestion.run(
          contentJson,
          q.difficulty_level,
          q.points,
          q.time_limit,
          userId
        );

        const questionId = questionResult.lastInsertRowid;

        // Insert tags
        for (const tag of q.tags) {
          insertTag.run(questionId, tag.tag_type, tag.tag_value);
        }

        insertedQuestions.push({
          id: questionId,
          subject: q.tags.find(t => t.tag_type === 'subject')?.tag_value,
          topic: q.tags.find(t => t.tag_type === 'topic')?.tag_value
        });
      }

      return insertedQuestions;
    });

    // Execute transaction
    console.log(`📦 Inserting ${seedQuestions.length} questions...\n`);
    const insertedQuestions = insertTransaction(seedQuestions, adminUser.id);

    // Display results
    console.log('✅ Successfully inserted questions:\n');

    const subjects = {};
    insertedQuestions.forEach(q => {
      if (!subjects[q.subject]) {
        subjects[q.subject] = [];
      }
      subjects[q.subject].push(q);
    });

    for (const [subject, questions] of Object.entries(subjects)) {
      console.log(`📚 ${subject}: ${questions.length} questions`);
      questions.forEach(q => {
        console.log(`   - Question #${q.id}: ${q.topic}`);
      });
      console.log('');
    }

    // Show summary
    const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get();
    const totalTags = db.prepare('SELECT COUNT(*) as count FROM question_tags').get();

    console.log('📊 Database Summary:');
    console.log(`   Total questions: ${totalQuestions.count}`);
    console.log(`   Total tags: ${totalTags.count}`);
    console.log('');
    console.log('🎉 Seed completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
}

// Run seed if file is executed directly
if (require.main === module) {
  seedDatabase();
  process.exit(0);
}

module.exports = { seedDatabase, seedQuestions };
