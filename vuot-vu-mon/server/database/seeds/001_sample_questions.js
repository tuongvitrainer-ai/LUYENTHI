/**
 * Seed file: Sample questions for "Thử thách khởi đầu" game
 * Includes questions for Grade 3, 4, 5 across 4 subjects:
 * - Toán học (Math)
 * - Tiếng Việt (Vietnamese)
 * - Tiếng Anh (English)
 * - Tư duy Logic (Logic)
 */

exports.seed = async function(knex) {
  // Clear existing questions (optional - comment out if you want to keep existing data)
  // await knex('questions').where({ subject: 'math' }).del();

  // Sample questions for Grade 3
  const grade3Questions = [
    // Toán học - Grade 3
    {
      subject: 'math',
      topic: 'Phép cộng',
      grade_level: 3,
      question_text: '125 + 378 = ?',
      options_json: JSON.stringify(['493', '503', '513', '523']),
      correct_answer: '503',
      explanation: '125 + 378 = 503',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'math',
      topic: 'Phép trừ',
      grade_level: 3,
      question_text: '500 - 247 = ?',
      options_json: JSON.stringify(['253', '263', '243', '273']),
      correct_answer: '253',
      explanation: '500 - 247 = 253',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'math',
      topic: 'Phép nhân',
      grade_level: 3,
      question_text: '8 × 7 = ?',
      options_json: JSON.stringify(['54', '56', '58', '64']),
      correct_answer: '56',
      explanation: '8 × 7 = 56',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'math',
      topic: 'Phép chia',
      grade_level: 3,
      question_text: '72 ÷ 8 = ?',
      options_json: JSON.stringify(['7', '8', '9', '10']),
      correct_answer: '9',
      explanation: '72 ÷ 8 = 9',
      difficulty: 'easy',
      is_active: true
    },

    // Tiếng Việt - Grade 3
    {
      subject: 'vietnamese',
      topic: 'Chính tả',
      grade_level: 3,
      question_text: 'Từ nào viết đúng?',
      options_json: JSON.stringify(['Học sịnh', 'Học sinh', 'Hoc sinh', 'Học xịnh']),
      correct_answer: 'Học sinh',
      explanation: '"Học sinh" là cách viết đúng',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'vietnamese',
      topic: 'Từ vựng',
      grade_level: 3,
      question_text: 'Từ trái nghĩa của "cao" là gì?',
      options_json: JSON.stringify(['Thấp', 'Nhỏ', 'Bé', 'Ngắn']),
      correct_answer: 'Thấp',
      explanation: '"Thấp" là từ trái nghĩa của "cao"',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'vietnamese',
      topic: 'Ngữ pháp',
      grade_level: 3,
      question_text: 'Câu nào đúng?',
      options_json: JSON.stringify(['Tôi đi học', 'Tôi học đi', 'Đi tôi học', 'Học đi tôi']),
      correct_answer: 'Tôi đi học',
      explanation: '"Tôi đi học" là câu đúng ngữ pháp',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'vietnamese',
      topic: 'Đọc hiểu',
      grade_level: 3,
      question_text: 'Con vật nào sống ở nước?',
      options_json: JSON.stringify(['Chó', 'Mèo', 'Cá', 'Gà']),
      correct_answer: 'Cá',
      explanation: 'Cá là con vật sống ở nước',
      difficulty: 'easy',
      is_active: true
    },

    // Tiếng Anh - Grade 3
    {
      subject: 'english',
      topic: 'Vocabulary',
      grade_level: 3,
      question_text: 'What color is the sky?',
      options_json: JSON.stringify(['Red', 'Blue', 'Green', 'Yellow']),
      correct_answer: 'Blue',
      explanation: 'The sky is blue',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'english',
      topic: 'Numbers',
      grade_level: 3,
      question_text: 'How many fingers do you have?',
      options_json: JSON.stringify(['Five', 'Eight', 'Ten', 'Twelve']),
      correct_answer: 'Ten',
      explanation: 'We have ten fingers',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'english',
      topic: 'Grammar',
      grade_level: 3,
      question_text: 'I ___ a student.',
      options_json: JSON.stringify(['is', 'am', 'are', 'be']),
      correct_answer: 'am',
      explanation: '"I am a student" is correct',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'english',
      topic: 'Animals',
      grade_level: 3,
      question_text: 'What animal says "Meow"?',
      options_json: JSON.stringify(['Dog', 'Cat', 'Bird', 'Fish']),
      correct_answer: 'Cat',
      explanation: 'A cat says "Meow"',
      difficulty: 'easy',
      is_active: true
    },

    // Tư duy Logic - Grade 3
    {
      subject: 'logic',
      topic: 'Dãy số',
      grade_level: 3,
      question_text: 'Tìm số tiếp theo: 2, 4, 6, 8, ?',
      options_json: JSON.stringify(['9', '10', '11', '12']),
      correct_answer: '10',
      explanation: 'Dãy số tăng 2 đơn vị, số tiếp theo là 10',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'logic',
      topic: 'So sánh',
      grade_level: 3,
      question_text: 'Trong các số sau, số nào lớn nhất? 25, 52, 35, 45',
      options_json: JSON.stringify(['25', '52', '35', '45']),
      correct_answer: '52',
      explanation: '52 là số lớn nhất',
      difficulty: 'easy',
      is_active: true
    },
    {
      subject: 'logic',
      topic: 'Quy luật',
      grade_level: 3,
      question_text: 'Tìm chữ cái tiếp theo: A, C, E, G, ?',
      options_json: JSON.stringify(['H', 'I', 'J', 'K']),
      correct_answer: 'I',
      explanation: 'Bỏ qua một chữ cái, chữ tiếp theo là I',
      difficulty: 'medium',
      is_active: true
    }
  ];

  // Sample questions for Grade 4 (you can add more)
  const grade4Questions = [
    {
      subject: 'math',
      topic: 'Phép nhân',
      grade_level: 4,
      question_text: '25 × 12 = ?',
      options_json: JSON.stringify(['250', '300', '350', '400']),
      correct_answer: '300',
      explanation: '25 × 12 = 300',
      difficulty: 'medium',
      is_active: true
    },
    {
      subject: 'vietnamese',
      topic: 'Từ vựng',
      grade_level: 4,
      question_text: 'Từ đồng nghĩa với "xinh đẹp" là gì?',
      options_json: JSON.stringify(['Đẹp đẽ', 'Xấu xí', 'Bình thường', 'Khác thường']),
      correct_answer: 'Đẹp đẽ',
      explanation: '"Đẹp đẽ" là từ đồng nghĩa với "xinh đẹp"',
      difficulty: 'medium',
      is_active: true
    },
    {
      subject: 'english',
      topic: 'Vocabulary',
      grade_level: 4,
      question_text: 'What is the opposite of "big"?',
      options_json: JSON.stringify(['Large', 'Small', 'Huge', 'Giant']),
      correct_answer: 'Small',
      explanation: '"Small" is the opposite of "big"',
      difficulty: 'medium',
      is_active: true
    },
    {
      subject: 'logic',
      topic: 'Tính toán',
      grade_level: 4,
      question_text: 'Nếu 1 quả táo giá 5000đ, 3 quả táo giá bao nhiêu?',
      options_json: JSON.stringify(['10000đ', '15000đ', '20000đ', '25000đ']),
      correct_answer: '15000đ',
      explanation: '3 × 5000đ = 15000đ',
      difficulty: 'medium',
      is_active: true
    }
  ];

  // Sample questions for Grade 5 (you can add more)
  const grade5Questions = [
    {
      subject: 'math',
      topic: 'Phân số',
      grade_level: 5,
      question_text: '1/2 + 1/4 = ?',
      options_json: JSON.stringify(['1/6', '2/6', '3/4', '2/4']),
      correct_answer: '3/4',
      explanation: '1/2 + 1/4 = 2/4 + 1/4 = 3/4',
      difficulty: 'hard',
      is_active: true
    },
    {
      subject: 'vietnamese',
      topic: 'Thành ngữ',
      grade_level: 5,
      question_text: '"Một cây làm chẳng nên non" có nghĩa là gì?',
      options_json: JSON.stringify([
        'Một người không thể làm việc gì',
        'Cần nhiều người cùng nhau làm việc',
        'Cây cối rất quan trọng',
        'Núi non rất cao'
      ]),
      correct_answer: 'Cần nhiều người cùng nhau làm việc',
      explanation: 'Thành ngữ này nhấn mạnh sức mạnh của tập thể',
      difficulty: 'hard',
      is_active: true
    },
    {
      subject: 'english',
      topic: 'Grammar',
      grade_level: 5,
      question_text: 'She ___ to school every day.',
      options_json: JSON.stringify(['go', 'goes', 'going', 'went']),
      correct_answer: 'goes',
      explanation: 'Third person singular uses "goes"',
      difficulty: 'hard',
      is_active: true
    },
    {
      subject: 'logic',
      topic: 'Suy luận',
      grade_level: 5,
      question_text: 'Nếu A > B và B > C, thì quan hệ nào đúng?',
      options_json: JSON.stringify(['A < C', 'A = C', 'A > C', 'Không xác định']),
      correct_answer: 'A > C',
      explanation: 'Theo tính chất bắc cầu: A > B > C thì A > C',
      difficulty: 'hard',
      is_active: true
    }
  ];

  // Combine all questions
  const allQuestions = [...grade3Questions, ...grade4Questions, ...grade5Questions];

  // Insert questions
  await knex('questions').insert(allQuestions);

  console.log(`✅ Seeded ${allQuestions.length} sample questions`);
  console.log(`   - Grade 3: ${grade3Questions.length} questions`);
  console.log(`   - Grade 4: ${grade4Questions.length} questions`);
  console.log(`   - Grade 5: ${grade5Questions.length} questions`);
};
