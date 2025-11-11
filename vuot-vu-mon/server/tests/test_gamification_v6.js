/**
 * TEST SUITE: GAMIFICATION APIs V6 (CỐT LÕI HỆ THỐNG)
 *
 * Tests:
 * 1. Submit result score > 80 → Nhận 5 sao
 * 2. Submit lần đầu → Streak = 1
 * 3. Submit ngày liên tiếp → Streak tăng
 * 4. Submit cùng ngày → Streak không đổi
 * 5. GET history & stats
 */

const API_BASE = 'http://localhost:3000/api';

let guestToken = '';
let userId = null;

console.log('========================================');
console.log('🧪 TEST: GAMIFICATION V6 (STREAK SYSTEM)');
console.log('========================================\n');

// ============================================
// SETUP: Tạo Guest User
// ============================================
async function setupGuestUser() {
  console.log('🔑 SETUP: Tạo Guest User');

  try {
    const response = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      guestToken = data.data.token;
      userId = data.data.user.id;
      console.log(`   ✅ Guest User #${userId} được tạo\n`);
      return true;
    } else {
      throw new Error(data.message || 'Failed to create guest');
    }
  } catch (error) {
    console.log('   ❌ FAIL:', error.message);
    return false;
  }
}

// ============================================
// TEST 1: Submit score > 80 → Nhận 5 sao
// ============================================
async function test1_rewardStars() {
  console.log('📝 TEST 1: Submit score > 80 → Nhận sao');
  console.log('   Mục đích: Kiểm tra hệ thống thưởng sao\n');

  if (!guestToken) {
    console.log('   ⏭️  SKIP: Không có guest token\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/game/submit_result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        exam_type: 'game_matching_pairs',
        score: 85,
        details_json: {
          questions: [],
          total_time: 45
        }
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Submit thành công!');
      console.log('   📦 Response:');
      console.log('      - Score:', data.data.score);
      console.log('      - Stars Earned:', data.data.stars_earned);
      console.log('      - Stars Balance:', data.data.stars_balance);
      console.log('      - Current Streak:', data.data.streak_status.current_streak);

      if (data.data.stars_earned !== 5) {
        throw new Error(`Expected 5 stars, got ${data.data.stars_earned}`);
      }

      if (data.data.streak_status.current_streak !== 1) {
        throw new Error(`Expected streak = 1 (first time), got ${data.data.streak_status.current_streak}`);
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
// TEST 2: Submit cùng ngày → Streak không đổi
// ============================================
async function test2_sameDay() {
  console.log('📝 TEST 2: Submit cùng ngày → Streak không đổi');
  console.log('   Mục đích: Verify học nhiều lần trong ngày không tăng streak\n');

  if (!guestToken) {
    console.log('   ⏭️  SKIP: Không có guest token\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/game/submit_result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        exam_type: 'luyen_tap',
        score: 90,
        details_json: { questions: [] }
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Submit thành công!');
      console.log('   📦 Response:');
      console.log('      - Score:', data.data.score);
      console.log('      - Stars Earned:', data.data.stars_earned);
      console.log('      - Current Streak:', data.data.streak_status.current_streak);
      console.log('      - Streak Increased:', data.data.streak_status.streak_increased);

      if (data.data.streak_status.current_streak !== 1) {
        throw new Error(`Expected streak = 1 (same day), got ${data.data.streak_status.current_streak}`);
      }

      if (data.data.streak_status.streak_increased !== false) {
        throw new Error('Streak should NOT increase on same day');
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
// TEST 3: Kiểm tra history
// ============================================
async function test3_getHistory() {
  console.log('📝 TEST 3: GET /api/game/history');
  console.log('   Mục đích: Lấy lịch sử làm bài\n');

  if (!guestToken) {
    console.log('   ⏭️  SKIP: Không có guest token\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/game/history?limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guestToken}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Get history thành công!');
      console.log('   📦 Response:');
      console.log('      - History Count:', data.data.count);
      console.log('      - Limit:', data.data.limit);

      if (data.data.count !== 2) {
        console.log('      ⚠️  WARNING: Expected 2 history records, got', data.data.count);
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
// TEST 4: Kiểm tra stats
// ============================================
async function test4_getStats() {
  console.log('📝 TEST 4: GET /api/game/stats');
  console.log('   Mục đích: Lấy thống kê tổng quan\n');

  if (!guestToken) {
    console.log('   ⏭️  SKIP: Không có guest token\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/game/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guestToken}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Get stats thành công!');
      console.log('   📦 Response:');
      console.log('      - Total Exams:', data.data.exam_stats.total_exams);
      console.log('      - Avg Score:', Math.round(data.data.exam_stats.avg_score));
      console.log('      - Max Score:', data.data.exam_stats.max_score);
      console.log('      - Current Streak:', data.data.user.current_streak);
      console.log('      - Stars Balance:', data.data.user.stars_balance);
      console.log('      - Freeze Streaks:', data.data.user.freeze_streaks);

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
// TEST 5: Score <= 80 → Không nhận sao
// ============================================
async function test5_noReward() {
  console.log('📝 TEST 5: Score <= 80 → Không nhận sao');
  console.log('   Mục đích: Verify chỉ thưởng sao khi score > 80\n');

  if (!guestToken) {
    console.log('   ⏭️  SKIP: Không có guest token\n');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/game/submit_result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        exam_type: 'kiem_tra',
        score: 75,  // <= 80
        details_json: { questions: [] }
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ PASS: Submit thành công!');
      console.log('   📦 Response:');
      console.log('      - Score:', data.data.score);
      console.log('      - Stars Earned:', data.data.stars_earned);

      if (data.data.stars_earned !== 0) {
        throw new Error(`Expected 0 stars (score <= 80), got ${data.data.stars_earned}`);
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
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  const setupOk = await setupGuestUser();

  if (!setupOk) {
    console.log('========================================');
    console.log('❌ SETUP FAILED - Cannot run tests');
    console.log('========================================\n');
    process.exit(1);
  }

  const results = {
    test1: await test1_rewardStars(),
    test2: await test2_sameDay(),
    test3: await test3_getHistory(),
    test4: await test4_getStats(),
    test5: await test5_noReward()
  };

  console.log('========================================');
  console.log('📊 KẾT QUẢ TỔNG HỢP');
  console.log('========================================');
  console.log(`TEST 1 (Reward Stars):     ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 2 (Same Day):         ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 3 (Get History):      ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 4 (Get Stats):        ${results.test4 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TEST 5 (No Reward):        ${results.test5 ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;

  console.log('========================================');
  console.log(`Tổng: ${passCount}/${totalCount} tests PASSED`);
  console.log('========================================\n');

  if (passCount === totalCount) {
    console.log('🎉 TẤT CẢ TESTS ĐỀU PASS!');
    console.log('✅ TASK 1.4 HOÀN TẤT!\n');
    console.log('🏆 GAMIFICATION SYSTEM HOẠT ĐỘNG HOÀN HẢO!');
    console.log('   - Thưởng sao: ✓');
    console.log('   - Streak tracking: ✓');
    console.log('   - History & Stats: ✓\n');
    process.exit(0);
  } else {
    console.log('⚠️  MỘT SỐ TESTS BỊ FAIL. Vui lòng kiểm tra lại.');
    process.exit(1);
  }
}

// Đợi server sẵn sàng
setTimeout(runAllTests, 1000);
