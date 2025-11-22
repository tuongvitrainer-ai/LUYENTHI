# 🎮 HƯỚNG DẪN SỬ DỤNG LAYOUT CHO GAME MỚI

## ✅ ĐÃ ĐỒNG BỘ SIDEBAR

- ✅ **Chỉ còn 1 sidebar duy nhất** - Trang chủ và GameLayout dùng chung
- ✅ **Màu Blue Pastel** - Gradient #B3D9FF → #87CEEB (khớp với nền website)
- ✅ **Xóa sidebar cũ** - Không còn trùng lặp

---

## 🚀 CÁCH DÙNG LAYOUT CHO GAME MỚI

### **Phương pháp 1: Không dùng GameLayout (Đơn giản)**

Nếu game không cần timer, score, các nút đặc biệt:

```jsx
// File: client/src/pages/GameMap/Grade3/TenGameMoi.jsx

import React from 'react';

const TenGameMoi = () => {
  return (
    <div className="game-container">
      {/* Nội dung game của bạn */}
      <h1>Tên Game Mới</h1>
      <p>Nội dung game...</p>
    </div>
  );
};

export default TenGameMoi;
```

**Sau đó thêm route trong App.jsx:**

```jsx
// File: client/src/App.jsx

import TenGameMoi from './pages/GameMap/Grade3/TenGameMoi';

// Thêm route này:
<Route
  path="/game/grade3/ten-game-moi"
  element={
    <GuestRoute>
      <Layout>
        <TenGameMoi />
      </Layout>
    </GuestRoute>
  }
/>
```

**Kết quả:**
- ✅ Sidebar tự động có (220px bên trái)
- ✅ Responsive sẵn
- ✅ Không cần code gì thêm

---

### **Phương pháp 2: Dùng GameLayout (Nâng cao)**

Nếu game cần timer, score, sound toggle, fullscreen:

```jsx
// File: client/src/pages/GameMap/Grade3/TenGameMoi.jsx

import React, { useState, useEffect } from 'react';
import GameLayout from '../../../components/layout/GameLayout';

const TenGameMoi = () => {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 phút
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <GameLayout
      title="TÊN GAME MỚI"
      showTimer={true}
      timerValue={timeRemaining}
      showScore={true}
      scoreValue={score}
      showSoundToggle={true}
      soundEnabled={soundEnabled}
      onSoundToggle={() => setSoundEnabled(!soundEnabled)}
    >
      {/* Nội dung game */}
      <div className="game-content">
        <h2>Chơi game nào!</h2>
        <button onClick={() => setScore(score + 10)}>
          Tăng điểm (+10)
        </button>
      </div>
    </GameLayout>
  );
};

export default TenGameMoi;
```

**Sau đó thêm route trong App.jsx:**

```jsx
// File: client/src/App.jsx

import TenGameMoi from './pages/GameMap/Grade3/TenGameMoi';
import { LayoutProvider } from './context/LayoutContext';

// Thêm route này:
<Route
  path="/game/grade3/ten-game-moi"
  element={
    <LayoutProvider>
      <TenGameMoi />
    </LayoutProvider>
  }
/>
```

**Kết quả:**
- ✅ Sidebar tự động có
- ✅ Timer hiển thị ở header (góc phải)
- ✅ Score hiển thị ở header
- ✅ Nút Sound, Fullscreen, Help (nếu muốn)
- ✅ Nút "Về trang chủ" tự động có

---

## 📋 SO SÁNH 2 PHƯƠNG PHÁP

| Tính năng | Layout thường | GameLayout |
|-----------|---------------|------------|
| **Sidebar** | ✅ Có | ✅ Có |
| **Nút "Về trang chủ"** | ❌ Không | ✅ Có |
| **Timer** | ❌ Không | ✅ Có |
| **Score** | ❌ Không | ✅ Có |
| **Sound toggle** | ❌ Không | ✅ Có |
| **Fullscreen** | ❌ Không | ✅ Có |
| **Help button** | ❌ Không | ✅ Có |
| **Code** | Đơn giản | Phức tạp hơn |

---

## 🎯 KHUYẾN NGHỊ

### **Dùng Layout thường khi:**
- ✅ Game đơn giản, không cần timer
- ✅ Chỉ cần sidebar + nội dung
- ✅ Không cần header phức tạp

### **Dùng GameLayout khi:**
- ✅ Game có timer, đếm ngược
- ✅ Cần hiển thị điểm số real-time
- ✅ Cần các nút điều khiển (sound, fullscreen)
- ✅ Muốn UI chuyên nghiệp như game thật

---

## 📐 PROPS CỦA GAMELAYOUT

### **Props cơ bản:**

| Prop | Kiểu | Mô tả | Mặc định |
|------|------|-------|----------|
| `title` | string | Tiêu đề game | Required |
| `children` | ReactNode | Nội dung game | Required |

### **Props timer:**

| Prop | Kiểu | Mô tả | Mặc định |
|------|------|-------|----------|
| `showTimer` | boolean | Hiển thị timer | `false` |
| `timerValue` | number | Thời gian (giây) | `0` |

### **Props score:**

| Prop | Kiểu | Mô tả | Mặc định |
|------|------|-------|----------|
| `showScore` | boolean | Hiển thị score | `false` |
| `scoreValue` | number | Điểm số | `0` |

### **Props actions:**

| Prop | Kiểu | Mô tả | Mặc định |
|------|------|-------|----------|
| `showSoundToggle` | boolean | Nút bật/tắt nhạc | `false` |
| `soundEnabled` | boolean | Trạng thái âm thanh | `true` |
| `onSoundToggle` | function | Handler toggle sound | - |
| `showFullscreenToggle` | boolean | Nút fullscreen | `false` |
| `onFullscreenToggle` | function | Handler fullscreen | - |
| `showHelpButton` | boolean | Nút trợ giúp | `false` |
| `onHelp` | function | Handler help | - |

---

## 🔧 VÍ DỤ ĐẦY ĐỦ

### **Game Toán Cơ Bản (Có Timer + Score):**

```jsx
import React, { useState, useEffect } from 'react';
import GameLayout from '../../../components/layout/GameLayout';

const MathBasicGame = () => {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 phút
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 10);
    }
    setCurrentQuestion(currentQuestion + 1);
  };

  return (
    <GameLayout
      title="TOÁN CƠ BẢN"
      showTimer={true}
      timerValue={timeRemaining}
      showScore={true}
      scoreValue={score}
      showHelpButton={true}
      onHelp={() => alert('Chọn đáp án đúng để được điểm!')}
    >
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Câu {currentQuestion + 1}: 5 + 3 = ?</h2>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button onClick={() => handleAnswer(true)}>8</button>
          <button onClick={() => handleAnswer(false)}>7</button>
          <button onClick={() => handleAnswer(false)}>9</button>
        </div>
      </div>
    </GameLayout>
  );
};

export default MathBasicGame;
```

**Route trong App.jsx:**

```jsx
import MathBasicGame from './pages/GameMap/Grade3/MathBasicGame';
import { LayoutProvider } from './context/LayoutContext';

<Route
  path="/game/grade3/math-basic"
  element={
    <LayoutProvider>
      <MathBasicGame />
    </LayoutProvider>
  }
/>
```

**URL truy cập:**
```
http://localhost:5173/game/grade3/math-basic
```

---

## ✅ CHECKLIST TẠO GAME MỚI

### **Bước 1: Tạo file game**
- [ ] Tạo file: `client/src/pages/GameMap/Grade3/TenGame.jsx`
- [ ] Import React và các hook cần thiết
- [ ] Quyết định dùng Layout thường hay GameLayout

### **Bước 2: Code game**
- [ ] Viết logic game (state, functions)
- [ ] Wrap bằng `<GameLayout>` hoặc để trống
- [ ] Test trên localhost

### **Bước 3: Thêm route**
- [ ] Mở `client/src/App.jsx`
- [ ] Import component game
- [ ] Thêm `<Route>` mới
- [ ] Wrap bằng `<GuestRoute>` và `<Layout>` hoặc `<LayoutProvider>`

### **Bước 4: Test**
- [ ] Truy cập URL game
- [ ] Kiểm tra sidebar hiển thị
- [ ] Test responsive (mobile/tablet)
- [ ] Test timer/score (nếu có)

---

## 🆘 TROUBLESHOOTING

### **Lỗi: Sidebar không hiện**
**Nguyên nhân:** Thiếu `<Layout>` trong route

**Giải pháp:**
```jsx
// ❌ SAI
<Route path="/game" element={<GameComponent />} />

// ✅ ĐÚNG
<Route
  path="/game"
  element={
    <GuestRoute>
      <Layout>
        <GameComponent />
      </Layout>
    </GuestRoute>
  }
/>
```

---

### **Lỗi: GameLayout không hoạt động**
**Nguyên nhân:** Thiếu `<LayoutProvider>`

**Giải pháp:**
```jsx
// ❌ SAI
<Route path="/game" element={<GameWithLayout />} />

// ✅ ĐÚNG
<Route
  path="/game"
  element={
    <LayoutProvider>
      <GameWithLayout />
    </LayoutProvider>
  }
/>
```

---

### **Lỗi: Timer không đếm**
**Nguyên nhân:** Không có `useEffect` để countdown

**Giải pháp:**
```jsx
const [time, setTime] = useState(300);

useEffect(() => {
  const timer = setInterval(() => {
    setTime(prev => prev > 0 ? prev - 1 : 0);
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

## 🎨 CUSTOM SIDEBAR (Nếu cần)

Sidebar giờ đã đồng bộ cho cả trang chủ và GameLayout.

**File:** `client/src/components/layout/Sidebar.css`

**Chỉnh chiều rộng:**
```css
.sidebar {
  width: 220px; /* Đổi số này (ví dụ: 250px, 200px) */
}
```

**Chỉnh màu:**
```css
.sidebar {
  background: linear-gradient(180deg, #B3D9FF 0%, #87CEEB 100%);
  /* Đổi 2 màu này */
}
```

---

**Tài liệu cập nhật: 2025-11-22**
**Commit: (sắp commit)**
