# 🎨 HƯỚNG DẪN SỬ DỤNG GRAPEJS PAGE BUILDER

> **Chỉnh sửa giao diện website như WordPress - Drag & Drop trực quan!**

---

## 📍 1. TRUY CẬP PAGE BUILDER

### **URL để truy cập:**

```
Trang chủ:     http://localhost:5173/admin/builder/home
Game Map:      http://localhost:5173/admin/builder/game-map
Profile:       http://localhost:5173/admin/builder/profile
Shop:          http://localhost:5173/admin/builder/shop
```

### **Hoặc:**
```
http://localhost:5173/admin/builder
```
(Mặc định sẽ mở trang Home)

---

## 🖼️ 2. GIAO DIỆN CHI TIẾT

Khi truy cập, bạn sẽ thấy giao diện chia làm 4 khu vực:

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER - Thanh công cụ chính                                   │
│  [💻 Desktop] [📱 Tablet] [📱 Mobile]  |  [👁️ Xem] [💾 Lưu]    │
├──────────┬──────────────────────────────────────────┬───────────┤
│ SIDEBAR  │         CANVAS (Khu vực chỉnh sửa)       │  SIDEBAR  │
│  TRÁI    │                                          │   PHẢI    │
│          │   ┌────────────────────────────────┐     │           │
│ 📦 Blocks│   │  Đây là trang web của bạn     │     │ 🎨 Styles │
│ 📑 Layers│   │  Click vào để chỉnh sửa       │     │ ⚙️ Settings│
│          │   └────────────────────────────────┘     │           │
└──────────┴──────────────────────────────────────────┴───────────┘
```

### **Khu vực 1: SIDEBAR TRÁI**

#### **Tab "📦 Blocks"** (Kho thành phần)
Chứa các thành phần có sẵn để kéo thả:

```
┌────────────────┐  ┌────────────────┐
│   📝 Text      │  │   🔤 Heading   │
│   Văn bản     │  │   Tiêu đề      │
└────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│   🖼️ Image     │  │   🔘 Button    │
│   Hình ảnh    │  │   Nút bấm     │
└────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│   📦 Container │  │   📊 Grid      │
│   Hộp chứa    │  │   Lưới cột    │
└────────────────┘  └────────────────┘
```

**Cách dùng:** Kéo block → Thả vào Canvas → Xong!

#### **Tab "📑 Layers"** (Cấu trúc trang)
Hiển thị cây cấu trúc HTML của trang:

```
📄 Body
├─ 📦 Container
│  ├─ 🔤 Heading: "Trang chủ"
│  ├─ 📝 Text: "Chào mừng..."
│  └─ 🔘 Button: "Bắt đầu"
└─ 📦 Footer
   └─ 📝 Copyright
```

**Cách dùng:** Click vào layer → Element tương ứng được select

---

### **Khu vực 2: CANVAS (Giữa)**

Đây là **trang web thật** của bạn. Mọi thay đổi ở đây sẽ được lưu.

**Thao tác:**
- **Click 1 lần:** Select element
- **Double click:** Edit text trực tiếp
- **Click chuột phải:** Menu context (Copy, Delete, v.v.)
- **Kéo góc:** Resize element

---

### **Khu vực 3: SIDEBAR PHẢI**

#### **Tab "🎨 Styles"** (Chỉnh sửa CSS)
Tuỳ chỉnh CSS cho element đang select:

**Sections có sẵn:**

```
▼ Kích thước
  Width:      [500] px
  Height:     [auto]
  Padding:    [20] px
  Margin:     [10] px

▼ Văn bản
  Font size:  [16] px
  Font weight:[600] ▼ Bold
  Color:      [🎨] #333333
  Text align: [≡] Trái  [≣] Giữa  [≡] Phải

▼ Màu sắc
  Background: [🎨] #FFFFFF
  Border:     [2] px solid [🎨] #E0E0E0
  Radius:     [8] px

▼ Flex (Căn chỉnh)
  Direction:  [→] Row  [↓] Column
  Justify:    [≡] Start  [≣] Center  [≡] End
  Align:      [≡] Start  [≣] Center  [≡] End
```

#### **Tab "⚙️ Settings"** (Cài đặt element)
Chỉnh sửa thuộc tính HTML:

```
▼ General
  ID:         [hero-section]
  Class:      [container bg-blue]

▼ Attributes
  Title:      [Tooltip text]
  Href:       [https://...]
  Target:     [_blank] ▼
```

---

### **Khu vực 4: HEADER (Thanh công cụ)**

```
┌───────────────────────────────────────────────────────────────┐
│ [💻] [📱] [📱]  |  [◀️] [▶️]  |  [👁️ Xem] [💾 Lưu] [✅ Xuất bản] │
│  Devices      Undo/Redo     Actions                          │
└───────────────────────────────────────────────────────────────┘
```

**Chức năng:**
- **💻 Desktop / 📱 Tablet / 📱 Mobile:** Xem preview responsive
- **◀️ Undo / ▶️ Redo:** Hoàn tác / Làm lại
- **👁️ Xem trước:** Mở tab mới preview
- **💾 Lưu:** Lưu thay đổi + Download JSON
- **✅ Xuất bản:** Deploy lên website live

---

## 🎯 3. CÁC THAO TÁC CƠ BẢN

### **A. THÊM ELEMENT MỚI**

#### **Ví dụ: Thêm tiêu đề**

**Bước 1:** Mở tab "📦 Blocks" (Sidebar trái)

**Bước 2:** Tìm block "🔤 Heading"

**Bước 3:** Kéo block "Heading" vào Canvas

```
┌────────────┐
│ 🔤 Heading │  ─────────→  ┌─────────────────┐
│  Tiêu đề   │             │ Heading text... │
└────────────┘             └─────────────────┘
   (Block)                    (Canvas)
```

**Bước 4:** Element xuất hiện trên Canvas!

**Bước 5:** Double-click vào text → Gõ tiêu đề của bạn → Enter

**Xong! ✅**

---

### **B. CHỈNH SỬA TEXT**

#### **Ví dụ: Đổi chữ "Welcome" thành "Chào mừng"**

**Cách 1: Edit trực tiếp**
```
1. Double-click vào chữ "Welcome"
2. Text bật chế độ edit (có cursor nhấp nháy)
3. Xóa "Welcome"
4. Gõ "Chào mừng"
5. Click ra ngoài → Xong!
```

**Cách 2: Qua Settings panel**
```
1. Click 1 lần vào text
2. Sidebar phải → Tab "⚙️ Settings"
3. Tìm field "Text content"
4. Sửa text → Enter → Xong!
```

---

### **C. ĐỔI MÀU**

#### **Ví dụ: Đổi màu chữ từ đen → xanh**

**Bước 1:** Click vào text cần đổi màu

**Bước 2:** Sidebar phải → Tab "🎨 Styles"

**Bước 3:** Mở section "▼ Văn bản"

**Bước 4:** Tìm "Color" → Click vào ô màu [🎨]

**Bước 5:** Color picker hiện ra:

```
┌─────────────────────┐
│  🎨 Color Picker    │
├─────────────────────┤
│  ┌───────────────┐  │
│  │  🌈 Gradient  │  │ ← Click chọn màu
│  └───────────────┘  │
│                     │
│  Mã màu:            │
│  [#4A90E2_______]   │ ← Hoặc gõ mã hex
│                     │
│  [OK]  [Cancel]     │
└─────────────────────┘
```

**Bước 6:** Chọn màu xanh (hoặc gõ `#4A90E2`) → OK

**Kết quả:** Text đổi màu ngay lập tức! ✅

---

### **D. THAY ĐỔI KÍCH THƯỚC**

#### **Ví dụ: Phóng to chữ từ 16px → 24px**

**Bước 1:** Click vào text

**Bước 2:** Sidebar phải → Tab "🎨 Styles"

**Bước 3:** Mở section "▼ Văn bản"

**Bước 4:** Tìm "Font size"

**Bước 5:** Thay đổi số:

```
Font size: [16] px  →  [24] px
```

**Hoặc:** Dùng slider kéo để tăng/giảm

**Kết quả:** Chữ to lên ngay! ✅

---

### **E. UPLOAD HÌNH ẢNH**

#### **Ví dụ: Thêm logo vào header**

**Bước 1:** Kéo block "🖼️ Image" vào Canvas

**Bước 2:** Popup upload hiện ra:

```
┌─────────────────────────────┐
│  📂 Upload Image            │
├─────────────────────────────┤
│                             │
│  [📤 Upload từ máy tính]    │
│                             │
│  Hoặc dán URL:              │
│  [https://________]         │
│                             │
└─────────────────────────────┘
```

**Bước 3:**
- **Option A:** Click "📤 Upload từ máy tính" → Chọn file logo.png
- **Option B:** Dán URL ảnh từ internet

**Bước 4:** Ảnh hiện lên Canvas!

**Bước 5:** Chỉnh size ảnh:
```
Sidebar phải → Tab 🎨 Styles
▼ Kích thước
  Width:  [200] px
  Height: [auto]
  ☑️ Giữ tỷ lệ
```

**Xong! ✅**

---

### **F. XÓA ELEMENT**

**Cách 1: Dùng phím Delete**
```
1. Click vào element muốn xóa
2. Nhấn phím Delete (hoặc Backspace)
3. Element biến mất!
```

**Cách 2: Chuột phải**
```
1. Click chuột phải vào element
2. Menu hiện ra → Click "Delete"
3. Element biến mất!
```

**Cách 3: Qua Layers**
```
1. Sidebar trái → Tab 📑 Layers
2. Tìm element trong cây
3. Click chuột phải → "Delete"
4. Element biến mất!
```

---

### **G. SẮP XẾP ELEMENT**

#### **Ví dụ: Dời nút xuống dưới text**

**Cách 1: Kéo thả trực tiếp**
```
1. Click giữ vào nút
2. Kéo xuống vị trí mong muốn
3. Thả chuột → Xong!
```

**Cách 2: Qua Layers**
```
Sidebar trái → Tab 📑 Layers

Trước:
├─ 📝 Text
└─ 🔘 Button  ← Kéo xuống

Sau:
├─ 🔘 Button
└─ 📝 Text
```

---

## 💾 4. LƯU VÀ XUẤT BẢN

### **A. LƯU THAY ĐỔI (Local)**

**Bước 1:** Click nút [💾 Lưu] ở header

**Bước 2:** Popup hiện ra:
```
⏳ Đang lưu...

✅ Đã lưu thành công!
📥 File JSON đã được tải xuống.
```

**Điều gì xảy ra?**
```
1. Tất cả thay đổi được lưu vào localStorage
2. File JSON được download về máy:
   → home-page.json

3. File này chứa:
   - HTML structure
   - CSS styles
   - Images URLs
   - All settings
```

---

### **B. XEM TRƯỚC (Preview)**

**Bước 1:** Click nút [👁️ Xem trước]

**Bước 2:** Tab mới mở ra với trang web hoàn chỉnh

**Bước 3:** Kiểm tra:
- Text có đúng không?
- Màu sắc OK?
- Hình ảnh load được?
- Button click được?
- Mobile responsive?

**Bước 4:**
- ✅ OK → Quay lại → Xuất bản
- ❌ Chưa OK → Quay lại → Sửa tiếp

---

### **C. XUẤT BẢN LÊN WEBSITE**

**Bước 1:** Đảm bảo đã lưu (Click [💾 Lưu])

**Bước 2:** Click nút [✅ Xuất bản]

**Bước 3:** Confirm:
```
┌─────────────────────────────────────┐
│  ⚠️ Xác nhận xuất bản               │
├─────────────────────────────────────┤
│                                     │
│  Bạn có chắc muốn xuất bản trang    │
│  này lên website live?              │
│                                     │
│  [Hủy]            [Xuất bản] ←Click │
└─────────────────────────────────────┘
```

**Bước 4:** Thông báo thành công:
```
✅ Đã xuất bản!
Refresh trang web để xem thay đổi.
```

**Bước 5:** Mở trang web chính:
```
http://localhost:5173/
```

→ Thấy thay đổi ngay! 🎉

---

## 📱 5. RESPONSIVE DESIGN

### **Xem trên các thiết bị khác nhau**

Header có 3 nút:

```
[💻 Desktop]  [📱 Tablet]  [📱 Mobile]
```

**Cách dùng:**

#### **Desktop (Mặc định)**
```
Click [💻 Desktop]
→ Canvas hiển thị full width
→ Chỉnh sửa cho màn hình lớn
```

#### **Tablet**
```
Click [📱 Tablet]
→ Canvas thu nhỏ về 768px
→ Chỉnh sửa riêng cho tablet

Ví dụ: Font size nhỏ hơn desktop
Desktop: 24px
Tablet:  20px
```

#### **Mobile**
```
Click [📱 Mobile]
→ Canvas thu nhỏ về 320px
→ Chỉnh sửa riêng cho mobile

Ví dụ: Layout đổi từ ngang → dọc
Desktop: 3 cột ngang
Mobile:  1 cột dọc
```

**GrapeJS tự động lưu CSS responsive!** ✅

---

## 🎨 6. CÁC BLOCK CÓ SẴN

### **Text & Headings**
```
📝 Text       - Đoạn văn bản
🔤 Heading    - Tiêu đề H1, H2, H3
🔗 Link       - Liên kết
📜 Quote      - Trích dẫn
```

### **Media**
```
🖼️ Image      - Hình ảnh
🎬 Video      - Video (YouTube, Vimeo)
🗺️ Map        - Google Maps
```

### **Layout**
```
📦 Container  - Hộp chứa
📊 Grid 1     - 1 cột
📊 Grid 2     - 2 cột
📊 Grid 3     - 3 cột
📊 Grid 3-7   - 30% / 70%
```

### **Forms**
```
📋 Form       - Form wrapper
✏️ Input      - Ô nhập text
📝 Textarea   - Ô nhập nhiều dòng
🔽 Select     - Dropdown
☑️ Checkbox   - Checkbox
🔘 Radio      - Radio button
🔘 Button     - Nút submit
```

### **Components**
```
🎴 Card       - Card component
📑 Accordion  - Mở/Đóng section
🎞️ Carousel   - Slideshow
🏷️ Label      - Nhãn
```

---

## ⚙️ 7. CÁC TÍP & TRICKS

### **1. Duplicate Element**
```
Cách 1:
- Click chuột phải → "Copy"
- Click chuột phải → "Paste"

Cách 2:
- Click element
- Ctrl + C (Copy)
- Ctrl + V (Paste)
```

### **2. Undo/Redo nhanh**
```
Undo: Ctrl + Z
Redo: Ctrl + Y
```

### **3. Chọn nhiều elements**
```
Giữ Ctrl + Click từng element
→ Có thể xóa hàng loạt
```

### **4. Group elements**
```
Chọn nhiều elements
→ Chuột phải → "Wrap in Container"
→ Tất cả được nhóm vào 1 Container
```

### **5. Xem code**
```
Click nút [fa-code] ở header
→ Popup hiện HTML + CSS
→ Copy code nếu cần
```

### **6. Keyboard shortcuts**
```
Delete:         Xóa element
Ctrl + Z:       Undo
Ctrl + Y:       Redo
Ctrl + C:       Copy
Ctrl + V:       Paste
Ctrl + S:       Lưu (auto-save)
F11:            Fullscreen
```

---

## 🔧 8. TROUBLESHOOTING

### **Vấn đề 1: Thay đổi không lưu**

**Nguyên nhân:** Chưa click nút Lưu

**Giải pháp:**
```
1. Click [💾 Lưu] ở header
2. Đợi thông báo "✅ Đã lưu thành công"
3. Thử lại
```

---

### **Vấn đề 2: Ảnh không hiển thị**

**Nguyên nhân:** URL ảnh sai hoặc bị chặn CORS

**Giải pháp:**
```
1. Kiểm tra URL ảnh có đúng không
2. Thử upload ảnh từ máy thay vì dùng URL
3. Hoặc dùng CDN: Cloudinary, ImageKit
```

---

### **Vấn đề 3: CSS bị lỗi**

**Nguyên nhân:** CSS conflict với website chính

**Giải pháp:**
```
1. Sidebar phải → Tab 🎨 Styles
2. Check từng property
3. Reset về default nếu cần
4. Hoặc: Chuột phải element → "Reset styles"
```

---

### **Vấn đề 4: Element không kéo được**

**Nguyên nhân:** Element bị lock hoặc parent có CSS đặc biệt

**Giải pháp:**
```
1. Sidebar trái → Tab 📑 Layers
2. Tìm element trong cây
3. Click vào để select
4. Hoặc: Unlock element nếu bị khóa
```

---

### **Vấn đề 5: Xuất bản không work**

**Nguyên nhân:** File JSON chưa được copy vào đúng folder

**Giải pháp:**
```
1. Click [💾 Lưu] → File JSON download
2. Copy file vào:
   /vuot-vu-mon/client/src/config/pages/

3. Refresh website
```

---

## 📚 9. VIDEO TUTORIALS (Text-based)

### **Tutorial 1: Tạo Hero Section**

```
00:00 - Mở Page Builder
        → http://localhost:5173/admin/builder/home

00:05 - Kéo block "Container" vào Canvas

00:10 - Kéo block "Heading" vào Container
        → Double-click → Gõ: "VƯỢT VŨ MÔN GAME"

00:20 - Kéo block "Text" vào Container
        → Double-click → Gõ: "Học tập qua trò chơi"

00:30 - Kéo block "Button" vào Container
        → Double-click → Gõ: "Bắt đầu ngay!"

00:40 - Chỉnh CSS Container:
        → Sidebar phải → Styles
        → Background: #87CEEB
        → Padding: 60px
        → Text align: center

00:55 - Chỉnh CSS Heading:
        → Font size: 48px
        → Font weight: Bold
        → Color: #FFFFFF

01:10 - Chỉnh CSS Button:
        → Background: #FFA07A
        → Color: #FFFFFF
        → Padding: 16px 48px
        → Border radius: 12px

01:25 - Click [💾 Lưu]
01:27 - Click [👁️ Preview] → Xem kết quả
01:30 - Click [✅ Xuất bản]

XONG! ✅ Hero Section đẹp hoàn chỉnh!
```

---

## 🎯 10. TÓM TẮT

### **3 Bước Chính:**

```
1. CHỈNH SỬA
   ├─ Kéo blocks từ sidebar trái
   ├─ Thả vào Canvas
   └─ Tuỳ chỉnh qua sidebar phải

2. XEM TRƯỚC
   ├─ Click [👁️ Preview]
   ├─ Kiểm tra trên Desktop/Tablet/Mobile
   └─ Sửa nếu cần

3. XUẤT BẢN
   ├─ Click [💾 Lưu]
   ├─ Click [✅ Xuất bản]
   └─ Refresh website → Xem thay đổi!
```

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:

1. **Đọc lại phần Troubleshooting** (Mục 8)
2. **Check Console** (F12 → Console tab)
3. **Refresh trang** (Ctrl + R)
4. **Clear cache** (Ctrl + Shift + R)

---

## 🎉 KẾT LUẬN

Bây giờ bạn đã biết:

✅ Cách truy cập Page Builder
✅ Giao diện và các khu vực
✅ Kéo thả blocks
✅ Chỉnh sửa text, màu sắc, kích thước
✅ Upload hình ảnh
✅ Xóa và sắp xếp elements
✅ Lưu và xuất bản
✅ Responsive design
✅ Troubleshooting

**Chúc bạn design vui vẻ! 🚀**

---

**Lưu ý:** Đây là phiên bản đầu tiên của GrapeJS Page Builder. Tính năng sẽ được cập nhật thêm trong tương lai!
