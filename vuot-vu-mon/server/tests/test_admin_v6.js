/**
 * TEST SUITE: ADMIN APIs V6 (QUESTION MANAGEMENT)
 *
 * Tests:
 * 1. POST /api/admin/questions - Tạo câu hỏi (Admin only)
 * 2. GET /api/game/questions - Lấy câu hỏi theo tag (Public)
 * 3. GET /api/admin/questions - Lấy tất cả câu hỏi (Admin only)
 */

const API_BASE = 'http://localhost:3000/api';

let adminToken = '';
let createdQuestionId = null;

console.log('========================================');
console.log('🧪 TEST: ADMIN APIs V6 (QUESTIONS)');
console.log('========================================\n');

// ============================================
// SETUP: Login as Admin
// ============================================
async function setupAdminLogin() {
  console.log('🔑 SETUP: Login as Admin');

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      adminToken = data.data.token;
      console.log('   ✅ Admin login thành công\n');
      return true;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.log('   ❌ FAIL:', error.message);
    console.log('   ⚠️  Không thể test without admin token\n');
    return false;
  }
}

// ============================================
// TEST 1: Tạo câu hỏi (Admin only)
// ============================================
async function test1_createQuestion() {
  console.log('📝 TEST 1: POST /api/admin/questions');
  console.log('   Mục đích: Admin tạo câu hỏi mới với tags\n');

  if (!adminToken) {
    console.log('   ⏭️  SKIP: Không có admin token\n');
    return false;
  }

  try {
    const questionData = {
      content_json: {
        question: "5 × 3 = ?",
        options: ["10", "15", "20", "25"]
      },
      correct_answer: "15",
      type: "multiple_choice",
      explanation: "5 nhân 3 bằng 15",
      is_premium: 0,
      tags: [
        { tag_key: "môn_học", tag_value: "Toán" },
        { tag_key: "lớp_nguồn", tag_value: "3" },
        { tag_key: "game_type", tag_value: "matching_pairs_trang_chu" },
        { tag_key: "chủ_đề", tag_value: "Bảng nhân" }
      ]
    };

    const response = await fetch(`${API_BASE}/admin/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(questionData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Câu hỏi được tạo thành công!');
      console.log('   📦 Response:');
      console.log('      - Question ID:', data.data.question.id);
      console.log('      - Type:', data.data.question.type);
      console.log('      - Correct Answer:', data.data.question.correct_answer);
      console.log('      - Is Premium:', data.data.question.is_premium);
      console.log('      - Tags Count:', data.data.question.tags.length);
      console.log('      - Tags:', data.data.question.tags.map(t => `${t.tag_key}:${t.tag_value}`).join(', '));

      createdQuestionId = data.data.question.id;

      console.log('\n');
      return true;
    } else {
      throw new Error(data.message || 'Unknown error');
    }
  } catch (error) {
    console.log('   ❌ FAIL:', error.message);
    return false;
  }
}

// ============================================
// TEST 2: Lấy câu hỏi theo tag (Public)
// ============================================
async function test2_getQuestionsByTag() {
  console.log('📝 TEST 2: GET /api/game/questions?tag=matching_pairs_trang_chu');
  console.log('   Mục đích: Lấy câu hỏi theo tag (Public, không cần token)\n');

  try {
    const response = await fetch(`${API_BASE}/game/questions?tag=matching_pairs_trang_chu&limit=5`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
      // NO Authorization header - This is PUBLIC API
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Lấy câu hỏi thành công (Public API)!');
      console.log('   📦 Response:');
      console.log('      - Questions Count:', data.data.count);
      console.log('      - Limit:', data.data.limit);

      if (data.data.questions.length > 0) {
        console.log('      - Sample Question:');
        const q = data.data.questions[0];
        console.log('        • ID:', q.id);
        console.log('        • Type:', q.type);
        console.log('        • Question:', q.content_json.question || JSON.stringify(q.content_json).substring(0, 50));
        console.log('        • Tags:', q.tags.map(t => `${t.tag_key}:${t.tag_value}`).join(', '));
      }

      console.log('\n');
      return true;
    } else {
      throw new Error(data.message || 'Unknown error');
    }
  } catch (error) {
    console.log('   ❌ FAIL:', error.message);
    return false;
  }
}

// ============================================
// TEST 3: Lấy tất cả câu hỏi (Admin only)
// ============================================
async function test3_getAllQuestions() {
  console.log('📝 TEST 3: GET /api/admin/questions');
  console.log('   Mục đích: Admin lấy tất cả câu hỏi\n');

  if (!adminToken) {
    console.log('   ⏭️  SKIP: Không có admin token\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/admin/questions?limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Lấy tất cả câu hỏi thành công!');
      console.log('   📦 Response:');
      console.log('      - Questions Count:', data.data.count);
      console.log('      - Limit:', data.data.limit);
      console.log('      - Offset:', data.data.offset);

      console.log('\n');
      return true;
    } else {
      throw new Error(data.message || 'Unknown error');
    }
  } catch (error) {
    console.log('   ❌ FAIL:', error.message);
    return false;
  }
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  const setupOk = await setupAdminLogin();

  if (!setupOk) {
    console.log('========================================');
    console.log('❌ SETUP FAILED - Cannot run tests');
    console.log('========================================\n');
    process.exit(1);
  }

  const results = {
    test1: await test1_createQuestion(),
    test2: await test2_getQuestionsByTag(),
    test3: await test3_getAllQuestions()
  };

  console.log('========================================');
  console.log('📊 KẾT QUẢ TỔNG HỢP');
  console.log('========================================');
  console.log(`TEST 1 (Create Question):  ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 2 (Get By Tag):       ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 3 (Get All):          ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;

  console.log('========================================');
  console.log(`Tổng: ${passCount}/${totalCount} tests PASSED`);
  console.log('========================================\n');

  if (passCount === totalCount) {
    console.log('🎉 TẤT CẢ TESTS ĐỀU PASS!');
    console.log('✅ TASK 1.3 HOÀN TẤT!\n');
    process.exit(0);
  } else {
    console.log('⚠️  MỘT SỐ TESTS BỊ FAIL. Vui lòng kiểm tra lại.');
    process.exit(1);
  }
}

// Đợi server sẵn sàng
setTimeout(runAllTests, 1000);
