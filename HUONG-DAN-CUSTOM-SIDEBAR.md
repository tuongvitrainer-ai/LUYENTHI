# 📖 HƯỚNG DẪN CUSTOM SIDEBAR

## 🎨 ĐÃ HOÀN THÀNH

✅ **Đồng bộ màu sidebar** - Đổi từ xanh lá sang xanh da trời (#87CEEB)
✅ **Cập nhật màu text** - Xanh đậm (#003d5c) dễ đọc hơn
✅ **Thêm comments hướng dẫn** - Dễ dàng tìm và custom

---

## 📐 CÁCH CHỈNH CHIỀU RỘNG SIDEBAR

### **File cần sửa:**
```
/home/user/LUYENTHI/vuot-vu-mon/client/src/components/layout/Sidebar.css
```

### **1. Desktop (màn hình lớn ≥ 768px)**

**Tìm dòng 10 trong file:**
```css
.sidebar {
  width: 220px; /* CUSTOM: Thay đổi số này để chỉnh chiều rộng */
  ...
}
```

**Thay đổi:**
- Muốn rộng hơn: `width: 250px;` hoặc `width: 280px;`
- Muốn hẹp hơn: `width: 200px;` hoặc `width: 180px;`

---

### **2. Compact Mode**

**Tìm dòng 38:**
```css
.sidebar--compact {
  width: 180px; /* CUSTOM: Chiều rộng cho compact mode */
  ...
}
```

**Khi nào dùng:** GameLayout tự động dùng compact mode

---

### **3. Tablet (768px - 1024px)**

**Tìm dòng 386:**
```css
@media (max-width: 1024px) {
  .sidebar {
    width: 200px; /* CUSTOM: Chiều rộng trên tablet */
  }

  .sidebar--compact {
    width: 160px; /* CUSTOM: Chiều rộng compact trên tablet */
  }
}
```

---

### **4. Mobile (≤ 767px)**

**Tìm dòng 400:**
```css
@media (max-width: 767px) {
  .sidebar {
    width: 280px; /* CUSTOM: Chiều rộng trên mobile */
  }

  .sidebar--collapsed {
    width: 280px; /* CUSTOM: Chiều rộng mobile khi collapsed */
  }
}
```

---

## 🎨 CÁC MÀU SIDEBAR (ĐÃ CẬP NHẬT)

### **Background Gradient:**
```css
background: linear-gradient(180deg, #87CEEB 0%, #5DADE2 100%);
```

**Cách đổi màu:**
- Đổi `#87CEEB` thành màu khác (ví dụ: `#FF6B6B` - màu đỏ)
- Đổi `#5DADE2` thành màu gradient kết thúc

### **Text Colors:**
```css
color: #003d5c;  /* Màu text xanh đậm */
```

### **Active State:**
```css
background: #1976d2;  /* Màu item đang active */
```

### **Hover Active:**
```css
background: #1565c0;  /* Màu khi hover vào item active */
```

---

## 📏 VÍ DỤ CUSTOM CHIỀU RỘNG

### **Ví dụ 1: Sidebar rộng hơn (250px)**

**Sửa file Sidebar.css:**
```css
/* Dòng 10 */
.sidebar {
  width: 250px; /* Tăng từ 220px lên 250px */
  ...
}

/* Dòng 386 - Tablet */
@media (max-width: 1024px) {
  .sidebar {
    width: 220px; /* Tăng từ 200px lên 220px */
  }
}
```

**Kết quả:** Sidebar rộng hơn 30px

---

### **Ví dụ 2: Sidebar hẹp hơn (180px)**

**Sửa file Sidebar.css:**
```css
/* Dòng 10 */
.sidebar {
  width: 180px; /* Giảm từ 220px xuống 180px */
  ...
}

/* Dòng 386 - Tablet */
@media (max-width: 1024px) {
  .sidebar {
    width: 160px; /* Giảm từ 200px xuống 160px */
  }
}
```

**Kết quả:** Sidebar hẹp hơn 40px, nhiều không gian hơn cho content

---

### **Ví dụ 3: Sidebar tự động điều chỉnh (responsive)**

**Chiều rộng theo breakpoint:**
```css
/* Desktop lớn */
.sidebar { width: 250px; }

/* Tablet */
@media (max-width: 1024px) {
  .sidebar { width: 220px; }
}

/* Mobile */
@media (max-width: 767px) {
  .sidebar { width: 300px; }  /* Mobile rộng hơn để dễ nhìn */
}
```

---

## 🔧 CÔNG CỤ TEST

### **1. Test trên trang demo:**
```
http://localhost:5173/demo-game-layout
```

### **2. Test responsive:**
- **Chrome DevTools:** F12 → Toggle device toolbar (Ctrl+Shift+M)
- Chọn device: iPhone, iPad, Desktop
- Xem sidebar thay đổi theo từng breakpoint

### **3. Test real-time:**
1. Mở file `Sidebar.css`
2. Sửa `width: 220px;` → `width: 250px;`
3. Save file (Ctrl+S)
4. Browser tự động reload
5. Xem kết quả ngay!

---

## 🎯 LƯU Ý QUAN TRỌNG

### **⚠️ Khi tăng chiều rộng sidebar:**
- Content bên phải sẽ hẹp hơn
- Cần kiểm tra responsive trên mobile
- Nên giữ tối đa **280px** trên desktop

### **⚠️ Khi giảm chiều rộng sidebar:**
- Text có thể bị cắt nếu quá hẹp
- Nên giữ tối thiểu **180px** để text không bị ngắt dòng
- Icon sẽ vẫn hiển thị tốt

### **⚠️ Collapsed mode:**
- Chiều rộng cố định: `70px` (chỉ hiện icon)
- Không nên sửa giá trị này
- Dùng để tiết kiệm không gian

---

## 📊 CHIỀU RỘNG KHUYẾN NGHỊ

| Loại màn hình | Chiều rộng khuyến nghị | Ghi chú |
|--------------|----------------------|---------|
| Desktop lớn  | 220px - 250px       | Cân bằng giữa menu và content |
| Desktop nhỏ  | 200px - 220px       | Tiết kiệm không gian |
| Tablet       | 180px - 200px       | Ưu tiên content |
| Mobile       | 280px - 320px       | Full width dễ nhìn |
| Collapsed    | 70px (cố định)      | Chỉ icon |

---

## 🚀 CÁCH APPLY THAY ĐỔI

### **Bước 1: Mở file**
```bash
code /home/user/LUYENTHI/vuot-vu-mon/client/src/components/layout/Sidebar.css
```

### **Bước 2: Tìm dòng cần sửa**
- Nhấn `Ctrl+F` → Tìm "CUSTOM"
- Sẽ thấy tất cả vị trí có comment hướng dẫn

### **Bước 3: Sửa giá trị**
```css
width: 220px; /* CUSTOM: Thay đổi số này */
       ⬆️ Đổi số này (ví dụ: 250px)
```

### **Bước 4: Save & Test**
- Save file: `Ctrl+S`
- Mở browser: `http://localhost:5173/demo-game-layout`
- Xem kết quả ngay!

---

## 🎨 BONUS: Custom màu sidebar

### **Đổi màu gradient nền:**
**File:** `Sidebar.css` - Dòng 11
```css
background: linear-gradient(180deg, #87CEEB 0%, #5DADE2 100%);
                                    ⬆️           ⬆️
                            Màu đầu        Màu cuối
```

**Ví dụ màu khác:**
```css
/* Màu tím */
background: linear-gradient(180deg, #9C27B0 0%, #7B1FA2 100%);

/* Màu đỏ */
background: linear-gradient(180deg, #FF6B6B 0%, #EE5A6F 100%);

/* Màu xanh lá */
background: linear-gradient(180deg, #4CAF50 0%, #388E3C 100%);
```

---

## ✅ CHECKLIST

- [ ] Đã sửa chiều rộng desktop (dòng 10)
- [ ] Đã sửa chiều rộng tablet (dòng 386)
- [ ] Đã sửa chiều rộng mobile (dòng 400)
- [ ] Đã test trên trang demo
- [ ] Đã test responsive (F12 → Device toolbar)
- [ ] Đã kiểm tra text không bị cắt
- [ ] Đã save file và xem kết quả

---

## 🆘 TROUBLESHOOTING

### **Vấn đề: Sidebar không thay đổi sau khi sửa**
**Giải pháp:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear cache: `Ctrl+Shift+Delete`
3. Kiểm tra file đã save chưa

### **Vấn đề: Text bị cắt khi thu hẹp**
**Giải pháp:**
1. Tăng `width` lên một chút
2. Hoặc giảm `font-size` trong CSS
3. Hoặc dùng `text-overflow: ellipsis`

### **Vấn đề: Sidebar che mất content**
**Giải pháp:**
1. Kiểm tra `z-index` (hiện tại: 1000)
2. Kiểm tra `margin-left` của content

---

**Tài liệu được tạo: 2025-11-22**
**Version: 1.0**
**Commit: fca10c7**
