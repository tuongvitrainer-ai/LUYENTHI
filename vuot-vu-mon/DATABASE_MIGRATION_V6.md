# 🔄 Database Migration Guide - V6

## ⚠️ Quan Trọng

Database trên VPS đang dùng schema cũ, cần migrate lên **V6** để hỗ trợ:
- Guest-First mode (cột `is_anonymous`)
- Gamification (streaks, stars, freeze_streaks)
- Schema mới cho questions và tags

## 🚀 Hướng Dẫn Migration

### Bước 1: Backup Database (Quan Trọng!)

```bash
cd /var/www/luyenthi/LUYENTHI/vuot-vu-mon/server/database

# Tạo backup thủ công
cp database.sqlite database_backup_manual_$(date +%Y%m%d_%H%M%S).sqlite

# Liệt kê backups
ls -lah database*.sqlite
```

### Bước 2: Chạy Migration Script

```bash
cd /var/www/luyenthi/LUYENTHI/vuot-vu-mon

# Chạy migration script
node server/database/migrate_to_v6.js
```

**Kết quả mong đợi:**
```
🔄 MIGRATING DATABASE TO V6...

📦 Creating backup: database_backup_1234567890.sqlite
✅ Backup created!

📊 Checking current schema...
Current columns: id, email, password_hash, role, full_name, ...

🔨 Adding V6 columns to users table...
  ✅ Added column: is_anonymous
  ✅ Added column: stars_balance
  ✅ Added column: current_streak
  ✅ Added column: max_streak
  ✅ Added column: freeze_streaks
  ✅ Added column: last_learnt_date

🔄 Updating existing users...
  ✅ Updated X users

✅ MIGRATION COMPLETED!

📋 Final users table schema:
🆕 is_anonymous (INTEGER)
🆕 stars_balance (INTEGER)
🆕 current_streak (INTEGER)
🆕 max_streak (INTEGER)
🆕 freeze_streaks (INTEGER)
🆕 last_learnt_date (TEXT)

👥 Total users: X
📝 Total questions: Y

🎉 Database is now V6-compatible!
```

### Bước 3: Restart Backend

```bash
pm2 restart vuot-vu-mon

# Xem logs để đảm bảo không có lỗi
pm2 logs vuot-vu-mon --lines 50
```

### Bước 4: Test trên Browser

1. Mở **https://luyenthi.io.vn**
2. Trang web phải load được (không còn "Đang khởi động game..." mãi)
3. Kiểm tra Console logs (F12) - không có lỗi SQLITE
4. Thử tạo guest user và chơi game

---

## 🐛 Nếu Migration Thất Bại

### Lỗi: "Database is locked"

**Nguyên nhân:** Backend đang chạy và đang giữ database lock.

**Giải pháp:**
```bash
# Dừng backend trước
pm2 stop vuot-vu-mon

# Chạy migration
node server/database/migrate_to_v6.js

# Start lại backend
pm2 start vuot-vu-mon
```

### Lỗi: Migration script báo lỗi

**Rollback bằng backup:**
```bash
cd /var/www/luyenthi/LUYENTHI/vuot-vu-mon/server/database

# Xem danh sách backup
ls -lah database_backup*.sqlite

# Restore từ backup mới nhất
cp database_backup_<timestamp>.sqlite database.sqlite

# Hoặc restore từ backup thủ công
cp database_backup_manual_<timestamp>.sqlite database.sqlite

# Restart backend
pm2 restart vuot-vu-mon
```

### Fresh Install (Option - Nếu muốn bắt đầu lại)

**⚠️ CẢNH BÁO: Sẽ XÓA TẤT CẢ DỮ LIỆU!**

```bash
cd /var/www/luyenthi/LUYENTHI/vuot-vu-mon

# Backup database cũ
cp server/database/database.sqlite server/database/database_old_$(date +%Y%m%d).sqlite

# Xóa database cũ
rm server/database/database.sqlite

# Tạo database V6 mới
node server/database/setup_v6.js

# Seed questions (optional)
node server/database/seed_questions_v6.js

# Restart backend
pm2 restart vuot-vu-mon
```

---

## 📊 Kiểm Tra Database Schema

Sau khi migration, kiểm tra schema:

```bash
cd /var/www/luyenthi/LUYENTHI/vuot-vu-mon

# Chạy verify script
node server/database/verify_v6.js
```

Hoặc kiểm tra trực tiếp:

```bash
sqlite3 server/database/database.sqlite

# Trong sqlite3 prompt:
.schema users
.quit
```

**Schema users phải có các cột:**
- `is_anonymous` INTEGER
- `stars_balance` INTEGER
- `current_streak` INTEGER
- `max_streak` INTEGER
- `freeze_streaks` INTEGER
- `last_learnt_date` TEXT

---

## 📝 Chi Tiết Migration

### Các thay đổi trong V6:

**Users table - Thêm các cột:**
- `is_anonymous` - Đánh dấu guest user (1) hay registered user (0)
- `stars_balance` - Số sao/điểm tích lũy
- `current_streak` - Streak hiện tại (số ngày học liên tục)
- `max_streak` - Streak cao nhất từng đạt được
- `freeze_streaks` - Số khiên bảo vệ streak (mặc định: 2)
- `last_learnt_date` - Ngày học gần nhất (format: YYYY-MM-DD)

**Questions table - Schema mới:**
- Lưu content dạng JSON linh hoạt
- Hỗ trợ nhiều loại câu hỏi
- Tag system cho filtering

**Question_tags table - Mới:**
- Gắn tags cho câu hỏi (môn học, lớp, chủ đề, game type)
- Index để query nhanh

**Exam_results table - Mới:**
- Lưu kết quả làm bài của user
- Hỗ trợ nhiều loại bài thi/game

---

## 💡 Tips

1. **Luôn backup trước khi migration!**
2. **Stop backend trước khi migrate** để tránh database locked
3. **Kiểm tra logs sau migration** để đảm bảo không có lỗi
4. **Test trên browser** sau khi restart backend
5. **Giữ backup cũ** ít nhất 7 ngày

---

## 🆘 Hỗ Trợ

Nếu cần hỗ trợ, cung cấp:
1. Output của migration script
2. Backend logs: `pm2 logs vuot-vu-mon`
3. Database schema: `sqlite3 server/database/database.sqlite ".schema users"`
