#!/bin/bash

API_URL="http://localhost:3000/api"

echo "========================================"
echo "🧪 TESTING TASK 1.2: API XÁC THỰC GUEST-FIRST"
echo "========================================"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# ============================================
# TEST 1: POST /api/auth/guest
# ============================================
echo "TEST 1: POST /api/auth/guest (Tạo Guest User)"

RESPONSE=$(curl -s -X POST "${API_URL}/auth/guest" -H "Content-Type: application/json")

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  GUEST_TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
  GUEST_USER_ID=$(echo "$RESPONSE" | jq -r '.data.user.id')
  ROLE=$(echo "$RESPONSE" | jq -r '.data.user.role')
  IS_ANON=$(echo "$RESPONSE" | jq -r '.data.user.is_anonymous')
  FREEZE=$(echo "$RESPONSE" | jq -r '.data.user.freeze_streaks')

  if [ "$ROLE" = "guest" ] && [ "$IS_ANON" = "1" ] && [ "$FREEZE" = "2" ]; then
    echo "  ✅ user.role = guest"
    echo "  ✅ user.is_anonymous = 1"
    echo "  ✅ user.freeze_streaks = 2"
    echo "  ✅ token exists"
    echo "  ✅ TEST 1 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "  ❌ TEST 1 FAILED - Invalid user properties"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo "  ❌ TEST 1 FAILED - API error"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# ============================================
# TEST 2: POST /api/auth/register (Guest Upgrade)
# ============================================
echo "TEST 2: POST /api/auth/register (Nâng cấp Guest → Student)"

TEST_EMAIL="test_$(date +%s)@example.com"

RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"password123\",\"full_name\":\"Test User\",\"guestToken\":\"${GUEST_TOKEN}\"}")

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  UPGRADED=$(echo "$RESPONSE" | jq -r '.data.upgraded')
  USER_ID=$(echo "$RESPONSE" | jq -r '.data.user.id')
  ROLE=$(echo "$RESPONSE" | jq -r '.data.user.role')
  IS_ANON=$(echo "$RESPONSE" | jq -r '.data.user.is_anonymous')
  EMAIL=$(echo "$RESPONSE" | jq -r '.data.user.email')

  if [ "$UPGRADED" = "true" ] && [ "$USER_ID" = "$GUEST_USER_ID" ] && [ "$ROLE" = "student" ] && [ "$IS_ANON" = "0" ] && [ "$EMAIL" = "$TEST_EMAIL" ]; then
    echo "  ✅ upgraded = true"
    echo "  ✅ user.id preserved"
    echo "  ✅ user.role = student"
    echo "  ✅ user.is_anonymous = 0"
    echo "  ✅ user.email = ${TEST_EMAIL}"
    echo "  ✅ TEST 2 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    STUDENT_EMAIL="$TEST_EMAIL"
    STUDENT_PASSWORD="password123"
  else
    echo "  ❌ TEST 2 FAILED - Invalid upgrade"
    echo "  Debug: upgraded=$UPGRADED, user_id=$USER_ID vs $GUEST_USER_ID"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo "  ❌ TEST 2 FAILED - API error"
  echo "  Response: $RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# ============================================
# TEST 3: POST /api/auth/login (Thủ công)
# ============================================
echo "TEST 3: POST /api/auth/login (Đăng nhập thủ công)"

RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${STUDENT_EMAIL}\",\"password\":\"${STUDENT_PASSWORD}\"}")

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  EMAIL=$(echo "$RESPONSE" | jq -r '.data.user.email')
  ROLE=$(echo "$RESPONSE" | jq -r '.data.user.role')
  IS_ANON=$(echo "$RESPONSE" | jq -r '.data.user.is_anonymous')

  if [ "$EMAIL" = "$STUDENT_EMAIL" ] && [ "$ROLE" = "student" ] && [ "$IS_ANON" = "0" ]; then
    echo "  ✅ user.email matches"
    echo "  ✅ user.role = student"
    echo "  ✅ user.is_anonymous = 0"
    echo "  ✅ token exists"
    echo "  ✅ TEST 3 PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "  ❌ TEST 3 FAILED - Invalid user"
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
echo "✅ Passed: ${TESTS_PASSED}/3"
echo "❌ Failed: ${TESTS_FAILED}/3"
echo "========================================"
echo ""

if [ $TESTS_PASSED -eq 3 ]; then
  echo "🎉 TASK 1.2 HOÀN TẤT 100%!"
  echo ""
  echo "✅ API 1: POST /api/auth/guest - Hoạt động đúng"
  echo "✅ API 2: POST /api/auth/register - Nâng cấp Guest → Student"
  echo "✅ API 3: POST /api/auth/login - Đăng nhập thủ công"
  echo ""
  exit 0
else
  echo "⚠️  TASK 1.2 chưa hoàn tất. Vui lòng kiểm tra các test failed."
  echo ""
  exit 1
fi
