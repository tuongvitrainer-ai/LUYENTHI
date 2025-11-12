# ⚠️ SỬA LỖI DATABASE - QUAN TRỌNG

## Lỗi hiện tại:
```
SqliteError: table users has no column named is_anonymous
```

## Nguyên nhân:
Database trên máy của bạn vẫn đang dùng schema CŨ (V5 hoặc trước đó), chưa có các cột V6 như:
- `is_anonymous`
- `stars_balance`
- `current_streak`
- `max_streak`
- `freeze_streaks`

## Giải pháp:

### **CÁCH 1: TẠO LẠI DATABASE MỚI (Đơn giản - Khuyến nghị)**

Nếu bạn không cần giữ dữ liệu cũ, chạy các lệnh sau:

```bash
cd "/Users/haidao/Library/CloudStorage/GoogleDrive-vinaez1394@gmail.com/My Drive/Hoc he Dũng/LUYEN THI/LUYENTHI/vuot-vu-mon"

# Bước 1: Xóa database cũ
rm server/database/database.sqlite
rm server/database/database.sqlite-shm 2>/dev/null
rm server/database/database.sqlite-wal 2>/dev/null

# Bước 2: Tạo database V6 mới
node server/database/setup_v6.js

# Bước 3: Seed dữ liệu mẫu
node server/database/seed_questions_v6.js

# Bước 4: Khởi động lại server
npm start
```

### **CÁCH 2: MIGRATE DATABASE CŨ (Giữ dữ liệu)**

Nếu bạn muốn giữ dữ liệu cũ, chạy script migration:

```bash
cd "/Users/haidao/Library/CloudStorage/GoogleDrive-vinaez1394@gmail.com/My Drive/Hoc he Dũng/LUYEN THI/LUYENTHI/vuot-vu-mon"

# Chạy migration script (sẽ tạo trong bước tiếp theo)
node server/database/migrate_to_v6.js
```

## Kiểm tra sau khi sửa:

```bash
# Server sẽ chạy không lỗi
npm start

# Frontend sẽ kết nối được
cd client
npm run dev
```

## Kết quả mong đợi:

✅ Server khởi động không lỗi
✅ POST /api/auth/guest trả về 200
✅ Tạo được guest user với `is_anonymous=1`
✅ Frontend kết nối được với backend
