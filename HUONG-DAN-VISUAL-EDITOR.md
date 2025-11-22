# 🎨 HƯỚNG DẪN SỬ DỤNG VISUAL EDITOR

> **Tùy chỉnh Text, Icon, Màu sắc Game như WordPress - KHÔNG CẦN CODE!**

---

## 📍 TRUY CẬP VISUAL EDITOR

### Đường dẫn:
```
http://localhost:5173/admin/game-config
```

### Giao diện:
- **4 Tabs:** Chung, Cấp độ, Màn hình, Màu sắc
- **Live Preview:** Xem thay đổi ngay lập tức
- **Lưu & Export:** Download file config JSON

---

## 🎯 CÁC CHỨC NĂNG CHÍNH

### 1. **Tab "Chung" (General)**
Chỉnh sửa các thông tin cơ bản:

| Field | Ví dụ | Mô tả |
|-------|-------|-------|
| Tiêu đề chính | `KHỞI ĐỘNG THỬ THÁCH` | Title game ở header |
| Câu hỏi chọn lớp | `Bạn đang học lớp mấy?` | Câu hỏi hướng dẫn user |
| Màu nền câu hỏi | `#FFE5E5` | Background color box |
| Màu viền câu hỏi | `#FF6B6B` | Border color box |
| Text nút bắt đầu | `Bắt đầu thử thách! 🚀` | Text trên button Start |
| Text khi đang tải | `Đang tải câu hỏi...` | Loading state |

---

### 2. **Tab "Cấp độ" (Levels)**
Tùy chỉnh Lớp 3, 4, 5:

#### **Cấu hình từng lớp:**
- **Tên hiển thị:** `Lớp 3`, `Lớp 4`, `Lớp 5`
- **Icon (emoji):** `🎓`, `📚`, `🏆`
  - Tìm emoji tại: [https://emojipedia.org](https://emojipedia.org)
  - Copy & paste trực tiếp

#### **Cấu hình số câu hỏi:**
- **Tiêu đề:** `Chọn số lượng câu hỏi:`
- **Gợi ý:** Text hướng dẫn user

#### **Cấu hình độ khó:**
- **Tiêu đề:** `Chọn mức độ khó:`
- **Label "Dễ":** Text bên trái slider
- **Label "Khó":** Text bên phải slider

---

### 3. **Tab "Màn hình" (Screens)**

#### **Màn hình Test:**
- Tiêu đề: `LÀM BÀI TEST`
- Label Timer: `Thời gian`
- Label Grid: `Câu hỏi`

#### **Màn hình Kết quả:**
- Tiêu đề: `KẾT QUẢ BÀI TEST`
- Label điểm số: `Điểm số`
- Tiêu đề phân tích: `Phân tích theo môn học`
- Text nút "Làm lại": `Làm lại 🔄`
- Text nút "Về trang chủ": `Về trang chủ 🏠`

---

### 4. **Tab "Màu sắc" (Colors)**

#### **Bảng màu chính:**
| Màu | Mặc định | Sử dụng cho |
|-----|----------|-------------|
| Primary | `#87CEEB` | Tiêu đề, viền, highlight |
| Accent | `#FFA07A` | Nút Start, call-to-action |
| Correct | `#51CF66` | Câu đúng, success |
| Incorrect | `#FF6B6B` | Câu sai, error |
| Warning | `#FFD43B` | Cảnh báo |

#### **Màu độ khó:**
- **Dễ:** `#51CF66` (Xanh lá)
- **Trung bình:** `#FFD43B` (Vàng)
- **Khó:** `#FF6B6B` (Đỏ)

---

## 🚀 QUY TRÌNH SỬ DỤNG

### **Bước 1: Truy cập Editor**
```
http://localhost:5173/admin/game-config
```

### **Bước 2: Chỉnh sửa**
- Click vào tab cần chỉnh sửa
- Nhập text mới vào các field
- Chọn màu bằng color picker hoặc nhập mã hex

### **Bước 3: Xem Preview**
- Kéo xuống phần "Preview" để xem thay đổi
- Kiểm tra xem có đúng ý không

### **Bước 4: Lưu config**
- Click nút **"💾 Lưu & Tải xuống"**
- File `gameConfig.json` sẽ được download về máy
- File này chứa TẤT CẢ thay đổi của bạn

### **Bước 5: Apply config**
- Copy file `gameConfig.json` vừa download
- Paste vào folder:
  ```
  /home/user/LUYENTHI/vuot-vu-mon/client/src/config/
  ```
- Ghi đè file cũ

### **Bước 6: Xem kết quả**
- Refresh trang game: `http://localhost:5173/game/grade3/thu-thach-khoi-dau`
- Tất cả thay đổi sẽ xuất hiện!

---

## 💡 TIPS & TRICKS

### **1. Backup trước khi chỉnh sửa**
```bash
# Backup file config hiện tại
cp /home/user/LUYENTHI/vuot-vu-mon/client/src/config/gameConfig.json \
   /home/user/LUYENTHI/vuot-vu-mon/client/src/config/gameConfig.backup.json
```

### **2. Import config đã lưu**
- Click nút **"📂 Import Config"**
- Chọn file `gameConfig.json` đã lưu trước đó
- Editor sẽ load lại config cũ

### **3. Reset về mặc định**
- Click nút **"🔄 Reset mặc định"**
- Confirm → Config sẽ về trạng thái ban đầu

### **4. Chọn màu dễ dàng**
- Dùng **Color Picker** (click vào ô màu)
- Hoặc nhập mã hex trực tiếp: `#87CEEB`
- Website gợi ý màu: [https://colorhunt.co](https://colorhunt.co)

### **5. Tìm emoji đẹp**
- Website: [https://emojipedia.org](https://emojipedia.org)
- Tìm emoji → Click → Copy → Paste vào field "Icon"

---

## 🛠️ TROUBLESHOOTING

### **Vấn đề: Thay đổi không hiển thị**
**Giải pháp:**
1. Kiểm tra đã copy file `gameConfig.json` vào đúng folder chưa
2. Hard refresh trang (Ctrl + Shift + R hoặc Cmd + Shift + R)
3. Clear browser cache

### **Vấn đề: File config bị lỗi**
**Giải pháp:**
1. Import lại file backup
2. Hoặc click "Reset mặc định"

### **Vấn đề: Màu không đẹp**
**Giải pháp:**
- Dùng công cụ: [https://coolors.co](https://coolors.co)
- Tạo palette màu hài hòa
- Copy mã hex vào editor

---

## 📚 VÍ DỤ THỰC TẾ

### **Ví dụ 1: Đổi theme sang màu Tím**
1. Vào tab **"Màu sắc"**
2. Primary: `#9B59B6`
3. Accent: `#E74C3C`
4. Lưu & Apply

### **Ví dụ 2: Đổi icon Lớp 3, 4, 5**
1. Vào tab **"Cấp độ"**
2. Lớp 3: Icon = `🚀`
3. Lớp 4: Icon = `⚡`
4. Lớp 5: Icon = `👑`
5. Lưu & Apply

### **Ví dụ 3: Đổi text nút Start**
1. Vào tab **"Chung"**
2. Text nút bắt đầu: `Let's Go! 🎯`
3. Lưu & Apply

---

## 🔮 TÍNH NĂNG TƯƠNG LAI

- [ ] Live Preview real-time (không cần refresh)
- [ ] Drag & Drop để sắp xếp thứ tự lớp
- [ ] Upload ảnh làm background
- [ ] Font chữ customization
- [ ] Animation settings
- [ ] Mobile preview
- [ ] A/B Testing config

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console log (F12 → Console tab)
2. Network tab (xem có lỗi API không)
3. File config có đúng format JSON không

**Liên hệ:** Tạo issue trên GitHub hoặc hỏi Claude Code! 😊

---

## 🎉 KẾT LUẬN

Bây giờ bạn đã có:
- ✅ **Visual Editor** giống WordPress
- ✅ Tùy chỉnh **KHÔNG CẦN CODE**
- ✅ Import/Export config dễ dàng
- ✅ Preview trực quan
- ✅ Backup & Restore

**Chúc bạn customize vui vẻ! 🚀**
