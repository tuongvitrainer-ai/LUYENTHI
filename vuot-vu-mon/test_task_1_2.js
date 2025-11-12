const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

console.log('========================================');
console.log('🧪 TESTING TASK 1.2: API XÁC THỰC GUEST-FIRST');
console.log('========================================\n');

async function testTask12() {
  let testsPassed = 0;
  let testsFailed = 0;

  // ============================================
  // TEST 1: POST /api/auth/guest
  // ============================================
  console.log('TEST 1: POST /api/auth/guest (Tạo Guest User)');
  try {
    const response = await axios.post(`${API_URL}/auth/guest`);

    if (response.data.success) {
      const { user, token } = response.data.data;

      // Verify user properties
      const checks = [
        { name: 'user.role = guest', pass: user.role === 'guest' },
        { name: 'user.is_anonymous = 1', pass: user.is_anonymous === 1 },
        { name: 'user.freeze_streaks = 2', pass: user.freeze_streaks === 2 },
        { name: 'user.stars_balance = 0', pass: user.stars_balance === 0 },
        { name: 'token exists', pass: !!token }
      ];

      const allPassed = checks.every(c => c.pass);

      checks.forEach(c => {
        console.log(`  ${c.pass ? '✅' : '❌'} ${c.name}`);
      });

      if (allPassed) {
        console.log('  ✅ TEST 1 PASSED\n');
        testsPassed++;

        // Save token for next test
        global.guestToken = token;
        global.guestUserId = user.id;
      } else {
        console.log('  ❌ TEST 1 FAILED\n');
        testsFailed++;
      }
    } else {
      console.log('  ❌ API returned success=false\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message, '\n');
    testsFailed++;
  }

  // ============================================
  // TEST 2: POST /api/auth/register (Guest Upgrade)
  // ============================================
  console.log('TEST 2: POST /api/auth/register (Nâng cấp Guest → Student)');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: 'password123',
      full_name: 'Test User',
      guestToken: global.guestToken
    });

    if (response.data.success) {
      const { user, token, upgraded } = response.data.data;

      const checks = [
        { name: 'upgraded = true', pass: upgraded === true },
        { name: 'user.id = guestUserId', pass: user.id === global.guestUserId },
        { name: 'user.role = student', pass: user.role === 'student' },
        { name: 'user.is_anonymous = 0', pass: user.is_anonymous === 0 },
        { name: 'user.email = ' + testEmail, pass: user.email === testEmail },
        { name: 'stars_balance preserved', pass: user.stars_balance === 0 }, // Should keep old value
        { name: 'new token exists', pass: !!token }
      ];

      const allPassed = checks.every(c => c.pass);

      checks.forEach(c => {
        console.log(`  ${c.pass ? '✅' : '❌'} ${c.name}`);
      });

      if (allPassed) {
        console.log('  ✅ TEST 2 PASSED\n');
        testsPassed++;

        global.studentEmail = testEmail;
        global.studentPassword = 'password123';
      } else {
        console.log('  ❌ TEST 2 FAILED\n');
        testsFailed++;
      }
    } else {
      console.log('  ❌ API returned success=false\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('  ❌ Error:', error.response?.data?.message || error.message, '\n');
    testsFailed++;
  }

  // ============================================
  // TEST 3: POST /api/auth/login (Thủ công)
  // ============================================
  console.log('TEST 3: POST /api/auth/login (Đăng nhập thủ công)');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: global.studentEmail,
      password: global.studentPassword
    });

    if (response.data.success) {
      const { user, token } = response.data.data;

      const checks = [
        { name: 'user.email matches', pass: user.email === global.studentEmail },
        { name: 'user.role = student', pass: user.role === 'student' },
        { name: 'user.is_anonymous = 0', pass: user.is_anonymous === 0 },
        { name: 'token exists', pass: !!token }
      ];

      const allPassed = checks.every(c => c.pass);

      checks.forEach(c => {
        console.log(`  ${c.pass ? '✅' : '❌'} ${c.name}`);
      });

      if (allPassed) {
        console.log('  ✅ TEST 3 PASSED\n');
        testsPassed++;
      } else {
        console.log('  ❌ TEST 3 FAILED\n');
        testsFailed++;
      }
    } else {
      console.log('  ❌ API returned success=false\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('  ❌ Error:', error.response?.data?.message || error.message, '\n');
    testsFailed++;
  }

  // ============================================
  // TEST 4: POST /api/auth/register (Tạo mới không có guest)
  // ============================================
  console.log('TEST 4: POST /api/auth/register (Tạo user mới từ đầu)');
  try {
    const testEmail2 = `newuser_${Date.now()}@example.com`;
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail2,
      password: 'password456',
      full_name: 'New User'
    });

    if (response.data.success) {
      const { user, token, upgraded } = response.data.data;

      const checks = [
        { name: 'upgraded = false', pass: upgraded === false },
        { name: 'user.role = student', pass: user.role === 'student' },
        { name: 'user.is_anonymous = 0', pass: user.is_anonymous === 0 },
        { name: 'user.email = ' + testEmail2, pass: user.email === testEmail2 },
        { name: 'token exists', pass: !!token }
      ];

      const allPassed = checks.every(c => c.pass);

      checks.forEach(c => {
        console.log(`  ${c.pass ? '✅' : '❌'} ${c.name}`);
      });

      if (allPassed) {
        console.log('  ✅ TEST 4 PASSED\n');
        testsPassed++;
      } else {
        console.log('  ❌ TEST 4 FAILED\n');
        testsFailed++;
      }
    } else {
      console.log('  ❌ API returned success=false\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('  ❌ Error:', error.response?.data?.message || error.message, '\n');
    testsFailed++;
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================');
  console.log(`✅ Passed: ${testsPassed}/4`);
  console.log(`❌ Failed: ${testsFailed}/4`);
  console.log('========================================\n');

  if (testsPassed === 4) {
    console.log('🎉 TASK 1.2 HOÀN TẤT 100%!\n');
    console.log('✅ API 1: POST /api/auth/guest - Hoạt động đúng');
    console.log('✅ API 2: POST /api/auth/register - Nâng cấp Guest → Student');
    console.log('✅ API 3: POST /api/auth/login - Đăng nhập thủ công');
    console.log('✅ Bonus: Tạo user mới không qua Guest\n');
  } else {
    console.log('⚠️  TASK 1.2 chưa hoàn tất. Vui lòng kiểm tra các test failed.\n');
    process.exit(1);
  }
}

testTask12().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
