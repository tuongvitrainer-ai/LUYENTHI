# 🎵 Hướng Dẫn Thêm File Âm Thanh Cho Game

## 📁 Thư Mục Này Dùng Để Làm Gì?

Thư mục `public/sounds/` chứa các file âm thanh cho game **"Lật Thẻ Trí Nhớ"**.

---

## 🎼 File Âm Thanh Cần Thiết

### 1. **background.mp3** - Nhạc Nền Khi Chơi

**Yêu cầu:**
- File nhạc vui nhộn, nhẹ nhàng, phù hợp trẻ em
- Thời lượng: 30 giây - 2 phút (sẽ loop lại)
- Format: `.mp3`, `.wav`, hoặc `.ogg`
- Volume: Không quá to (code sẽ set volume = 30%)

**Gợi ý nguồn nhạc miễn phí:**
- [Pixabay Music](https://pixabay.com/music/) - Free music without copyright
- [Bensound](https://www.bensound.com/) - Royalty free music
- [Free Music Archive](https://freemusicarchive.org/) - Creative Commons music
- [YouTube Audio Library](https://studio.youtube.com/) - Free background music

**Từ khóa tìm kiếm:**
- "Happy kids music"
- "Cheerful background music"
- "Playful children tune"
- "Upbeat cartoon music"

---

### 2. **victory.mp3** (Optional) - Âm Thanh Chiến Thắng

**Yêu cầu:**
- Âm thanh ngắn (2-5 giây) khi hoàn thành game
- Vui vẻ, phấn khích
- Format: `.mp3`, `.wav`, hoặc `.ogg`

**Gợi ý từ khóa:**
- "Victory sound effect"
- "Win celebration sound"
- "Success fanfare"
- "Achievement unlock sound"

**Lưu ý:** Nếu không có file này, game sẽ dùng melody tự tạo bằng Web Audio API.

---

## 📥 Cách Thêm File Âm Thanh

### Bước 1: Download File Nhạc

1. Truy cập một trong các website miễn phí bên trên
2. Tìm nhạc phù hợp với từ khóa gợi ý
3. Download file về máy (định dạng MP3 hoặc WAV)

### Bước 2: Đổi Tên File

```bash
# Đổi tên file thành:
background.mp3    # Cho nhạc nền
victory.mp3       # Cho âm thanh chiến thắng (optional)
```

### Bước 3: Copy File Vào Thư Mục

```bash
# Copy file vào thư mục này:
vuot-vu-mon/client/public/sounds/

# Cấu trúc thư mục sẽ như sau:
vuot-vu-mon/
├── client/
│   ├── public/
│   │   └── sounds/
│   │       ├── README.md (file này)
│   │       ├── background.mp3   ← Thêm file này
│   │       └── victory.mp3      ← Thêm file này (optional)
```

### Bước 4: Test Game

1. Start dev server: `cd client && npm run dev`
2. Mở browser: `http://localhost:5173/sandbox-game-lat-the-tri-nho`
3. Chọn level → Nhạc nền sẽ tự động phát
4. Hoàn thành game → Nghe nhạc chiến thắng

---

## 🔧 Troubleshooting

### Nhạc không phát?

**Nguyên nhân:** Trình duyệt chặn autoplay (bảo mật)

**Giải pháp:**
- Nhấn vào màn hình 1 lần để browser cho phép phát nhạc
- Hoặc check console (F12) để xem thông báo lỗi

### File không tìm thấy?

**Check lại:**
1. File có đúng tên `background.mp3` không? (lowercase, không dấu)
2. File có nằm trong `public/sounds/` không?
3. Server đã restart chưa? (Ctrl+C và chạy lại `npm run dev`)

---

## 🎨 Gợi Ý Nhạc Nền Cụ Thể

### Từ Pixabay (100% Free)

1. **"Happy Kids" by Lesfm** - Vui nhộn, nhẹ nhàng
2. **"Sunny Day" by Music_Unlimited** - Tươi sáng, phù hợp trẻ em
3. **"Playground Fun" by Ashot-Danielyan-Composer** - Năng động, vui tươi

### Từ Bensound

1. **"Ukulele"** - Nhẹ nhàng, vui tươi
2. **"Happy Rock"** - Năng động nhưng không ồn
3. **"Summer"** - Tươi sáng, phù hợp học sinh

---

## 📝 License & Copyright

**Quan trọng:** Chỉ sử dụng nhạc có license phù hợp:
- ✅ Creative Commons (CC0, CC BY)
- ✅ Royalty-free music
- ✅ Public domain
- ❌ **KHÔNG** dùng nhạc có bản quyền (YouTube rip, Spotify, etc.)

---

## 💡 Nếu Không Muốn Dùng File Nhạc

**Option 1:** Xóa dòng code gọi `startBackgroundMusic()` trong `GameLatTheTriNho.jsx`

**Option 2:** Game sẽ tự động skip nhạc nền nếu không tìm thấy file (không ảnh hưởng gameplay)

---

## 🎉 Kết Quả

Sau khi thêm file nhạc:
- ✅ Nhạc nền tự động phát khi chọn level
- ✅ Nhạc nền dừng khi về menu hoặc hoàn thành
- ✅ Nhạc nền loop liên tục khi chơi
- ✅ Volume 30% (không quá ồn)
- ✅ Âm thanh chiến thắng phát khi hoàn thành

---

**Chúc bạn tìm được nhạc nền phù hợp! 🎵**
