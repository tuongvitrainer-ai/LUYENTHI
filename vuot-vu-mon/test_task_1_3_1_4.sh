#!/bin/bash

API_URL="http://localhost:3000/api"

echo "========================================"
echo "🧪 TESTING TASK 1.3 & 1.4"
echo "========================================"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# ============================================
# SETUP: Login as admin
# ============================================
echo "SETUP: Login as admin@example.com"

RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ADMIN_TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "  ❌ Failed to get admin token"
  echo "  Response: $RESPONSE"
  exit 1
fi

echo "  ✅ Admin logged in"
echo ""

# ============================================
# TASK 1.3 - TEST 1: POST /api/admin/questions
# ============================================
echo "TASK 1.3 - TEST 1: POST /api/admin/questions (Tạo câu hỏi với tags)"

QUESTION_DATA='{
  "content_json": {
    "question": "10 + 5 = ?",
    "options": ["10", "15", "20", "25"]
  },
  "correct_answer": "15",
  "type": "multiple_choice",
  "explanation": "10 cộng 5 bằng 15",
  "is_premium": 0,
  "tags": [
    {"tag_key": "môn_học", "tag_value": "Toán"},
    {"tag_key": "lớp_nguồn", "tag_value": "Lớp 3"},
    {"tag_key": "game_type", "tag_value": "quiz_race"}
  ]
}'

RESPONSE=$(curl -s -X POST "${API_URL}/admin/questions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "$QUESTION_DATA")

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  QUESTION_ID=$(echo "$RESPONSE" | jq -r '.data.question.id')
  TAGS_COUNT=$(echo "$RESPONSE" | jq -r '.data.question.tags | length')

  if [ "$TAGS_COUNT" = "3" ]; then
    echo "  ✅ Question created with transaction"
    echo "  ✅ Question ID: $QUESTION_ID"
    echo "  ✅ Tags count: $TAGS_COUNT"
    echo "  ✅ TEST 1 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "  ❌ TEST 1 FAILED - Wrong tags count: $TAGS_COUNT"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo "  ❌ TEST 1 FAILED - API error"
  echo "  Response: $RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# ============================================
# TASK 1.3 - TEST 2: GET /api/game/questions
# ============================================
echo "TASK 1.3 - TEST 2: GET /api/game/questions?subject=Toán (Lấy câu hỏi theo tag)"

RESPONSE=$(curl -s "${API_URL}/game/questions?subject=Toán&limit=5")

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  QUESTION_COUNT=$(echo "$RESPONSE" | jq -r '.data.count')

  if [ "$QUESTION_COUNT" -gt "0" ]; then
    echo "  ✅ Found $QUESTION_COUNT questions for môn_học=Toán"
    echo "  ✅ TEST 2 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "  ❌ TEST 2 FAILED - No questions found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo "  ❌ TEST 2 FAILED - API error"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# ============================================
# SETUP: Create guest user for TASK 1.4
# ============================================
echo "SETUP: Create guest user for gamification test"

RESPONSE=$(curl -s -X POST "${API_URL}/auth/guest")
GUEST_TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
GUEST_USER_ID=$(echo "$RESPONSE" | jq -r '.data.user.id')

echo "  ✅ Guest user created: ID=$GUEST_USER_ID"
echo ""

# ============================================
# TASK 1.4 - TEST 1: Submit result (First time)
# ============================================
echo "TASK 1.4 - TEST 1: POST /api/game/submit_result (Lần đầu học, score > 80)"

RESPONSE=$(curl -s -X POST "${API_URL}/game/submit_result" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GUEST_TOKEN}" \
  -d '{"exam_type":"quiz_race","score":85,"details_json":{"total_time":60}}')

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  STARS_EARNED=$(echo "$RESPONSE" | jq -r '.data.stars_earned')
  CURRENT_STREAK=$(echo "$RESPONSE" | jq -r '.data.streak_status.current_streak')
  STARS_BALANCE=$(echo "$RESPONSE" | jq -r '.data.stars_balance')

  if [ "$STARS_EARNED" = "5" ] && [ "$CURRENT_STREAK" = "1" ] && [ "$STARS_BALANCE" = "5" ]; then
    echo "  ✅ Score > 80 → Thưởng 5 sao"
    echo "  ✅ Lần đầu học → current_streak = 1"
    echo "  ✅ stars_balance = 5"
    echo "  ✅ TEST 1 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "  ❌ TEST 1 FAILED"
    echo "  Expected: stars=5, streak=1, balance=5"
    echo "  Got: stars=$STARS_EARNED, streak=$CURRENT_STREAK, balance=$STARS_BALANCE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo "  ❌ TEST 1 FAILED - API error"
  echo "  Response: $RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# ============================================
# TASK 1.4 - TEST 2: Same day submission
# ============================================
echo "TASK 1.4 - TEST 2: POST /api/game/submit_result (Cùng ngày, không tăng streak)"

RESPONSE=$(curl -s -X POST "${API_URL}/game/submit_result" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GUEST_TOKEN}" \
  -d '{"exam_type":"quiz_race","score":90,"details_json":{"total_time":50}}')

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  CURRENT_STREAK=$(echo "$RESPONSE" | jq -r '.data.streak_status.current_streak')
  STARS_BALANCE=$(echo "$RESPONSE" | jq -r '.data.stars_balance')

  if [ "$CURRENT_STREAK" = "1" ] && [ "$STARS_BALANCE" = "10" ]; then
    echo "  ✅ Cùng ngày → streak không đổi (vẫn = 1)"
    echo "  ✅ Vẫn thưởng sao → balance = 10"
    echo "  ✅ TEST 2 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "  ❌ TEST 2 FAILED"
    echo "  Expected: streak=1, balance=10"
    echo "  Got: streak=$CURRENT_STREAK, balance=$STARS_BALANCE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo "  ❌ TEST 2 FAILED - API error"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# ============================================
# TASK 1.4 - TEST 3: Low score (no stars)
# ============================================
echo "TASK 1.4 - TEST 3: POST /api/game/submit_result (Score <= 80, không thưởng sao)"

RESPONSE=$(curl -s -X POST "${API_URL}/game/submit_result" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GUEST_TOKEN}" \
  -d '{"exam_type":"quiz_race","score":50,"details_json":{"total_time":70}}')

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  STARS_EARNED=$(echo "$RESPONSE" | jq -r '.data.stars_earned')
  STARS_BALANCE=$(echo "$RESPONSE" | jq -r '.data.stars_balance')

  if [ "$STARS_EARNED" = "0" ] && [ "$STARS_BALANCE" = "10" ]; then
    echo "  ✅ Score <= 80 → Không thưởng sao"
    echo "  ✅ balance vẫn = 10"
    echo "  ✅ TEST 3 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "  ❌ TEST 3 FAILED"
    echo "  Expected: stars_earned=0, balance=10"
    echo "  Got: stars_earned=$STARS_EARNED, balance=$STARS_BALANCE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo "  ❌ TEST 3 FAILED - API error"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"
echo "✅ Passed: ${TESTS_PASSED}/5"
echo "❌ Failed: ${TESTS_FAILED}/5"
echo "========================================"
echo ""

if [ $TESTS_PASSED -eq 5 ]; then
  echo "🎉 TASK 1.3 & 1.4 HOÀN TẤT 100%!"
  echo ""
  echo "TASK 1.3: API QUẢN LÝ CÂU HỎI (ADMIN)"
  echo "  ✅ POST /api/admin/questions - Transaction insert question + tags"
  echo "  ✅ GET /api/game/questions - Lấy câu hỏi theo tag"
  echo ""
  echo "TASK 1.4: API CHẤM ĐIỂM & GAMIFICATION"
  echo "  ✅ POST /api/game/submit_result - Chấm điểm"
  echo "  ✅ Thưởng sao (score > 80 → +5 stars)"
  echo "  ✅ Tính Streak (Lazy Calculation)"
  echo "  ✅ Cùng ngày không tăng streak"
  echo "  ✅ Score <= 80 không thưởng sao"
  echo ""
  exit 0
else
  echo "⚠️  Một số test failed. Vui lòng kiểm tra."
  echo ""
  exit 1
fi
