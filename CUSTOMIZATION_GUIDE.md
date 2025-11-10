# 🎨 Hướng Dẫn Tuỳ Chỉnh Website - Phong Cách WordPress

Hướng dẫn chi tiết cách tuỳ chỉnh giao diện và nội dung website **Vượt Vũ Môn** theo phong cách trực quan giống WordPress.

---

## 📋 Mục Lục

1. [Tuỳ Chỉnh Giao Diện (Theme Customizer)](#1-tuỳ-chỉnh-giao-diện-theme-customizer)
2. [Chỉnh Sửa Màu Sắc](#2-chỉnh-sửa-màu-sắc)
3. [Thay Đổi Hình Ảnh & Logo](#3-thay-đổi-hình-ảnh--logo)
4. [Quản Lý Nội Dung](#4-quản-lý-nội-dung)
5. [Thêm/Xoá Trang](#5-thêmxoá-trang)
6. [Tuỳ Chỉnh Menu](#6-tuỳ-chỉnh-menu)
7. [Widget & Sidebar](#7-widget--sidebar)
8. [CSS Tuỳ Chỉnh](#8-css-tuỳ-chỉnh)

---

## 1. Tuỳ Chỉnh Giao Diện (Theme Customizer)

### 🎯 Cách Truy Cập Theme Customizer

Hiện tại website đã có **Theme Selector** tích hợp sẵn:

**Bước 1:** Click vào **Avatar Icon** (góc phải màn hình)
**Bước 2:** Chọn **🎨 Giao diện** trong menu dropdown
**Bước 3:** Chọn theme yêu thích (6 options có sẵn)

### 📦 6 Theme Có Sẵn

1. **💙 Xanh Dương (Blue)** - Theme mặc định, màu dịu mắt
2. **💗 Hồng (Pink)** - Dễ thương, nữ tính
3. **💜 Tím (Purple)** - Độc đáo, sáng tạo
4. **💚 Xanh Lá (Green)** - Tự nhiên, thân thiện
5. **💛 Vàng (Yellow)** - Vui vẻ, năng động
6. **🧡 Cam (Orange)** - Ấm áp, nhiệt huyết

### 💾 Lưu Trữ

Theme preference được lưu tự động vào **localStorage**, không cần click "Lưu"!

---

## 2. Chỉnh Sửa Màu Sắc

### 🎨 Cấu Trúc Theme System

Tất cả màu sắc được quản lý bằng **CSS Variables** trong file:

```
vuot-vu-mon/client/src/context/ThemeContext.jsx
```

### 📝 Thêm Theme Mới

**Bước 1:** Mở file `ThemeContext.jsx`

**Bước 2:** Thêm theme mới vào object `themes`:

```javascript
export const themes = {
  // ... các theme hiện tại

  custom: {  // ← Tên theme mới
    id: 'custom',
    name: 'Tuỳ Chỉnh',
    icon: '✨',

    // Định nghĩa màu sắc
    primary: '#FF6B9D',          // Màu chính
    secondary: '#FFB4D5',        // Màu phụ
    accent: '#FFD6E8',           // Màu nhấn

    // Background gradient
    background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8ED 50%, #FFD6E0 100%)',

    // Màu card
    cardBg: 'rgba(255, 255, 255, 0.95)',

    // Màu chữ (phải tương phản tốt!)
    text: '#7A2E4A',            // Chữ chính (tối)
    textLight: '#9B4866',       // Chữ phụ

    // Border & shadow
    border: '#FF6B9D',
    shadow: 'rgba(255, 107, 157, 0.15)'
  }
};
```

**Bước 3:** Theme mới sẽ hiện trong menu **🎨 Giao diện** tự động!

### 🎨 Tuỳ Chỉnh Màu Gradient

Gradient backgrounds được tạo từ 3 màu:

```css
background: linear-gradient(
  135deg,        /* Góc nghiêng */
  #FFF5F8 0%,    /* Màu bắt đầu (sáng) */
  #FFE8ED 50%,   /* Màu giữa */
  #FFD6E0 100%   /* Màu kết thúc */
);
```

**Tips:**
- Dùng màu SÁNG (95-100% brightness) cho background
- Gradient phải dịu, không quá tương phản
- Test trên nhiều màn hình (bright & dark mode)

---

## 3. Thay Đổi Hình Ảnh & Logo

### 🖼️ Thay Logo Website

**Bước 1:** Chuẩn bị logo (PNG hoặc SVG, kích thước khuyến nghị: 200x60px)

**Bước 2:** Đặt file vào thư mục:
```
vuot-vu-mon/client/public/images/logo.png
```

**Bước 3:** Cập nhật header component:

Mở file: `vuot-vu-mon/client/src/pages/GameMap.jsx`

Thay dòng:
```jsx
<h1>Vượt Vũ Môn</h1>
```

Bằng:
```jsx
<img src="/images/logo.png" alt="Vượt Vũ Môn" className="site-logo" />
```

**Bước 4:** Thêm CSS cho logo vào `GameMap.css`:
```css
.site-logo {
  height: 48px;
  width: auto;
  animation: bounce 1s ease;
}
```

### 👤 Thêm Avatar Cho User

**Cách 1: Từ Profile Page**
1. Click vào Avatar → Chọn **👤 Hồ sơ**
2. Click **✏️ Chỉnh sửa thông tin**
3. *(Tính năng upload avatar sẽ được thêm sau)*

**Cách 2: Thêm URL Avatar (Developer)**

Update qua API:
```javascript
await fetch('http://localhost:3000/api/auth/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    avatar_url: 'https://example.com/avatar.jpg'
  })
});
```

---

## 4. Quản Lý Nội Dung

### 📝 Thay Đổi Nội Dung Tĩnh

#### **Trang Chủ (GameMap)**

File: `vuot-vu-mon/client/src/pages/GameMap.jsx`

**Thay đổi tiêu đề chào mừng:**
```jsx
<h2>Chào mừng trở lại! 👋</h2>
<p>Chọn môn học để bắt đầu luyện tập</p>
```

**Thêm/Sửa môn học:**
```javascript
const subjects = [
  {
    id: 'toan',
    name: 'Toán',
    icon: '🔢',
    color: '#3498db',
    description: 'Phép tính, hình học'
  },
  // Thêm môn mới:
  {
    id: 'khoa-hoc',
    name: 'Khoa Học',
    icon: '🔬',
    color: '#9b59b6',
    description: 'Khám phá thế giới'
  }
];
```

#### **Trang Shop**

File: `vuot-vu-mon/client/src/pages/Shop.jsx`

**Thay tiêu đề:**
```jsx
<h1>🛒 Cửa Hàng</h1>
```

**Thay categories:**
```javascript
const categoryInfo = {
  avatar: { name: 'Avatar', icon: '👤', color: '#3498db' },
  badge: { name: 'Huy Hiệu', icon: '🏅', color: '#f39c12' },
  powerup: { name: 'Power-ups', icon: '⚡', color: '#9b59b6' },
  theme: { name: 'Giao Diện', icon: '🎨', color: '#1abc9c' },
  // Thêm category mới:
  sticker: { name: 'Nhãn Dán', icon: '🎀', color: '#e74c3c' }
};
```

---

## 5. Thêm/Xoá Trang

### ➕ Thêm Trang Mới

**Ví dụ: Tạo trang "Leaderboard"**

**Bước 1:** Tạo component mới

File: `vuot-vu-mon/client/src/pages/Leaderboard.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import './Leaderboard.css';

function Leaderboard() {
  const navigate = useNavigate();

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Về trang chủ
          </button>
          <h1>🏆 Bảng Xếp Hạng</h1>
          <div className="header-right">
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="leaderboard-container">
        <h2>Nội dung leaderboard ở đây...</h2>
      </div>
    </div>
  );
}

export default Leaderboard;
```

**Bước 2:** Tạo file CSS

File: `vuot-vu-mon/client/src/pages/Leaderboard.css`

```css
.leaderboard-page {
  min-height: 100vh;
  background: var(--theme-background, var(--gradient-rainbow));
}

.leaderboard-header {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-md) 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.leaderboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}
```

**Bước 3:** Thêm route vào App.jsx

File: `vuot-vu-mon/client/src/App.jsx`

```jsx
import Leaderboard from './pages/Leaderboard';  // ← Thêm import

// ... trong Routes:
<Route
  path="/leaderboard"
  element={
    <ProtectedRoute>
      <Leaderboard />
    </ProtectedRoute>
  }
/>
```

**Bước 4:** Thêm link vào menu

File: `vuot-vu-mon/client/src/components/UserAvatar.jsx`

Thêm menu item mới:
```jsx
<button className="menu-item" onClick={() => navigate('/leaderboard')}>
  <span className="menu-icon">🏆</span>
  <span>Bảng xếp hạng</span>
</button>
```

---

## 6. Tuỳ Chỉnh Menu

### 🍔 Menu Avatar Dropdown

File: `vuot-vu-mon/client/src/components/UserAvatar.jsx`

**Thêm menu item mới:**

```jsx
<button className="menu-item" onClick={() => navigate('/new-page')}>
  <span className="menu-icon">🎯</span>  {/* Icon */}
  <span>Tên Mục Mới</span>
</button>
```

**Thay đổi thứ tự menu:**

Di chuyển các `<button className="menu-item">` lên/xuống trong JSX

**Xoá menu item:**

Comment hoặc xoá đoạn code tương ứng

---

## 7. Widget & Sidebar

### 📊 Thêm Stats Widget

**Vị trí:** Trang GameMap (trang chủ)

File: `vuot-vu-mon/client/src/pages/GameMap.jsx`

**Thêm widget "Hoạt động gần đây":**

```jsx
{/* Sau phần stats-section */}
<div className="recent-activity-section">
  <h3>📌 Hoạt động gần đây</h3>
  <div className="activity-list">
    <div className="activity-item">
      <span className="activity-icon">✓</span>
      <span>Hoàn thành bài Toán - Phép cộng</span>
      <span className="activity-time">5 phút trước</span>
    </div>
    {/* Thêm các activity items khác */}
  </div>
</div>
```

**CSS cho widget:**

File: `vuot-vu-mon/client/src/pages/GameMap.css`

```css
.recent-activity-section {
  background: var(--theme-card-bg, white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
  border: 3px solid var(--theme-border);
  box-shadow: var(--shadow-md);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--theme-accent);
  border-radius: var(--radius-md);
  transition: all 0.3s;
}

.activity-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}
```

---

## 8. CSS Tuỳ Chỉnh

### 🎨 Thêm Custom CSS

**Cách 1: Chỉnh CSS Variables (Khuyến nghị)**

File: `vuot-vu-mon/client/src/App.css`

```css
:root {
  /* Tuỳ chỉnh spacing */
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* Tuỳ chỉnh border radius */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;

  /* Tuỳ chỉnh font */
  --font-display: 'Comic Sans MS', 'Chalkboard SE', cursive;
}
```

**Cách 2: Override CSS Classes**

Thêm vào cuối file CSS bất kỳ:

```css
/* Custom styles - Override defaults */
.btn-primary {
  background: linear-gradient(135deg, #FF6B9D, #FF8FB3) !important;
  border-radius: 30px !important;
}

.card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}
```

### 🔠 Thay Đổi Font Chữ

**Bước 1:** Thêm Google Font vào `index.html`

File: `vuot-vu-mon/client/index.html`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet">
```

**Bước 2:** Cập nhật CSS Variables

File: `vuot-vu-mon/client/src/App.css`

```css
:root {
  --font-primary: 'Quicksand', sans-serif;
  --font-display: 'Quicksand', 'Comic Sans MS', cursive;
}
```

---

## 🚀 Best Practices

### ✅ Nên Làm

- ✓ Test trên nhiều thiết bị (mobile, tablet, desktop)
- ✓ Kiểm tra tương phản màu (text phải dễ đọc)
- ✓ Backup code trước khi chỉnh sửa lớn
- ✓ Commit từng thay đổi nhỏ với git
- ✓ Dùng CSS variables thay vì hardcode màu

### ❌ Không Nên

- ✗ Xoá CSS variables trong App.css
- ✗ Dùng `!important` quá nhiều
- ✗ Hardcode màu sắc thay vì dùng theme system
- ✗ Chỉnh sửa trực tiếp trong node_modules

---

## 🔧 Công Cụ Hỗ Trợ

### Màu Sắc
- [Coolors](https://coolors.co/) - Tạo color palette
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Kiểm tra tương phản

### Icon
- [Emojipedia](https://emojipedia.org/) - Tìm emoji
- [Iconify](https://icon-sets.iconify.design/) - Icon library

### CSS
- [CSS Gradient Generator](https://cssgradient.io/)
- [Cubic Bezier](https://cubic-bezier.com/) - Animation timing

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu cần hỗ trợ thêm:
- 📧 Email: support@example.com
- 💬 Discord: [Link]
- 📚 Documentation: [Link]

---

**Cập nhật lần cuối:** 2025-01-10
**Version:** 1.0.0
