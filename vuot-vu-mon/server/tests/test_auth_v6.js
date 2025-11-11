/**
 * TEST SUITE: AUTH APIs V6 (GUEST-FIRST)
 *
 * Tests:
 * 1. POST /api/auth/guest - Tạo guest user
 * 2. POST /api/auth/register - Nâng cấp guest → student
 * 3. POST /api/auth/login - Đăng nhập
 * 4. GET /api/auth/me - Get current user
 */

const API_BASE = 'http://localhost:3000/api';

let guestToken = '';
let studentToken = '';
let testEmail = `test_${Date.now()}@example.com`;

console.log('========================================');
console.log('🧪 TEST: AUTH APIs V6 (GUEST-FIRST)');
console.log('========================================\n');

// ============================================
// TEST 1: Tạo Guest User
// ============================================
async function test1_createGuest() {
  console.log('📝 TEST 1: POST /api/auth/guest');
  console.log('   Mục đích: Tạo guest user để chơi ngay lập tức\n');

  try {
    const response = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Guest user được tạo thành công!');
      console.log('   📦 Response:');
      console.log('      - User ID:', data.data.user.id);
      console.log('      - Role:', data.data.user.role);
      console.log('      - Is Anonymous:', data.data.user.is_anonymous);
      console.log('      - Stars Balance:', data.data.user.stars_balance);
      console.log('      - Freeze Streaks:', data.data.user.freeze_streaks);
      console.log('      - Token:', data.data.token ? 'Yes ✓' : 'No ✗');

      guestToken = data.data.token;

      if (data.data.user.role !== 'guest' || data.data.user.is_anonymous !== 1) {
        throw new Error('Guest user có thuộc tính không đúng!');
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
// TEST 2: Nâng cấp Guest → Student
// ============================================
async function test2_upgradeGuest() {
  console.log('📝 TEST 2: POST /api/auth/register (với guestToken)');
  console.log('   Mục đích: Nâng cấp guest → student (giữ nguyên stars & streak)\n');

  if (!guestToken) {
    console.log('   ⏭️  SKIP: Không có guestToken từ TEST 1\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        full_name: 'Test User',
        guestToken: guestToken
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Guest đã được nâng cấp thành Student!');
      console.log('   📦 Response:');
      console.log('      - User ID:', data.data.user.id);
      console.log('      - Email:', data.data.user.email);
      console.log('      - Role:', data.data.user.role);
      console.log('      - Is Anonymous:', data.data.user.is_anonymous);
      console.log('      - Stars Balance:', data.data.user.stars_balance);
      console.log('      - Freeze Streaks:', data.data.user.freeze_streaks);
      console.log('      - Upgraded:', data.data.upgraded);

      studentToken = data.data.token;

      if (data.data.user.role !== 'student' || data.data.user.is_anonymous !== 0) {
        throw new Error('Upgraded user có thuộc tính không đúng!');
      }

      if (!data.data.upgraded) {
        console.log('   ⚠️  WARNING: upgraded flag = false (có thể tạo user mới thay vì upgrade)');
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
// TEST 3: Login thủ công
// ============================================
async function test3_login() {
  console.log('📝 TEST 3: POST /api/auth/login');
  console.log('   Mục đích: Đăng nhập bằng email/password\n');

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Login thành công!');
      console.log('   📦 Response:');
      console.log('      - User ID:', data.data.user.id);
      console.log('      - Email:', data.data.user.email);
      console.log('      - Role:', data.data.user.role);
      console.log('      - Token:', data.data.token ? 'Yes ✓' : 'No ✗');

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
// TEST 4: Get Me
// ============================================
async function test4_getMe() {
  console.log('📝 TEST 4: GET /api/auth/me');
  console.log('   Mục đích: Lấy thông tin user hiện tại từ token\n');

  if (!studentToken) {
    console.log('   ⏭️  SKIP: Không có studentToken từ TEST 2\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Get Me thành công!');
      console.log('   📦 Response:');
      console.log('      - User ID:', data.data.user.id);
      console.log('      - Email:', data.data.user.email);
      console.log('      - Stars:', data.data.user.stars_balance);
      console.log('      - Current Streak:', data.data.user.current_streak);
      console.log('      - Stats:', data.data.user.stats);

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
  const results = {
    test1: await test1_createGuest(),
    test2: await test2_upgradeGuest(),
    test3: await test3_login(),
    test4: await test4_getMe()
  };

  console.log('========================================');
  console.log('📊 KẾT QUẢ TỔNG HỢP');
  console.log('========================================');
  console.log(`TEST 1 (Create Guest):    ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 2 (Upgrade Guest):   ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 3 (Login):          ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 4 (Get Me):         ${results.test4 ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;

  console.log('========================================');
  console.log(`Tổng: ${passCount}/${totalCount} tests PASSED`);
  console.log('========================================\n');

  if (passCount === totalCount) {
    console.log('🎉 TẤT CẢ TESTS ĐỀU PASS!');
    console.log('✅ TASK 1.2 HOÀN TẤT!\n');
    process.exit(0);
  } else {
    console.log('⚠️  MỘT SỐ TESTS BỊ FAIL. Vui lòng kiểm tra lại.');
    process.exit(1);
  }
}

// Đợi server sẵn sàng
setTimeout(runAllTests, 1000);
