# 📚 HƯỚNG DẪN QUẢN LÝ USER ADMIN

Hướng dẫn tạo và quản lý user admin cho hệ thống Vượt Vũ Môn.

---

## 🎯 TÓM TẮT NHANH

| Công việc | Lệnh |
|-----------|------|
| **Liệt kê tất cả users** | `node server/scripts/listUsers.js` |
| **Tạo admin user mới** | `node server/scripts/createAdmin.js` |
| **Chuyển user thành admin** | `node server/scripts/updateUserToAdmin.js <email>` |

---

## 📋 1. LIỆT KÊ TẤT CẢ USERS

### Lệnh:
```bash
node server/scripts/listUsers.js
```

### Kết quả:
- Hiển thị danh sách tất cả users
- Thống kê theo role (admin, student, guest)
- Hiển thị email, username, stars, active status
- Highlight các admin users

### Ví dụ output:
```
📋 DANH SÁCH TẤT CẢ USERS

Tổng số users: 5

📊 THỐNG KÊ THEO ROLE:
   ⭐ admin     : 1 users
   👨‍🎓 student   : 3 users
   👤 guest     : 1 users

─────────────────────────────────────────────────────────────────
ID   | Email                     | Username      | Role      | Stars
─────┼───────────────────────────┼───────────────┼───────────┼──────
1    | admin@vuotvumon.com       | admin         | admin ⭐  | 9999
2    | user@example.com          | student1      | student   | 150
...
```

---

## ➕ 2. TẠO ADMIN USER MỚI

### Lệnh:
```bash
node server/scripts/createAdmin.js
```

### Thông tin admin mặc định:
- **Username:** `admin`
- **Email:** `admin@vuotvumon.com`
- **Password:** `Admin@123`
- **Role:** `admin`
- **Stars:** 9999
- **Freeze Streaks:** 99

### Tùy chỉnh thông tin admin:

Mở file `server/scripts/createAdmin.js` và sửa:

```javascript
const adminData = {
  username: 'your-admin-username',     // Tên đăng nhập
  email: 'your-email@example.com',     // Email admin
  password: 'YourSecurePassword',      // Mật khẩu mạnh
  full_name: 'Your Full Name',         // Tên đầy đủ
  role: 'admin'
};
```

### Lưu ý:
- ⚠️ **Đổi mật khẩu ngay sau khi đăng nhập lần đầu!**
- Email và username phải **duy nhất** (chưa tồn tại)
- Script sẽ **tự động hash** mật khẩu
- Script sẽ **báo lỗi** nếu email/username đã tồn tại

---

## 🔄 3. CHUYỂN USER HIỆN TẠI THÀNH ADMIN

### Lệnh:
```bash
node server/scripts/updateUserToAdmin.js <email>
```

### Ví dụ:
```bash
# Chuyển user user@example.com thành admin
node server/scripts/updateUserToAdmin.js user@example.com
```

### Kết quả:
```
✅ CẬP NHẬT THÀNH CÔNG!

📋 THÔNG TIN SAU KHI CẬP NHẬT:
─────────────────────────────────────
   ID:           5
   Email:        user@example.com
   Role:         admin ⭐
   Updated at:   2024-11-19T10:30:00.000Z
─────────────────────────────────────

🎉 User này giờ có thể truy cập Admin Panel!
```

### Lưu ý:
- User phải **đã tồn tại** trong database
- User **không thể** là anonymous (is_anonymous = false)
- Script tự động **set is_anonymous = false** khi update

---

## 🔑 4. ĐĂNG NHẬP VÀO ADMIN PANEL

### Bước 1: Truy cập trang đăng nhập
```
http://localhost:5173/login
```

### Bước 2: Đăng nhập với thông tin admin
- **Email:** admin@vuotvumon.com
- **Password:** Admin@123 (hoặc mật khẩu bạn đã đặt)

### Bước 3: Truy cập Admin Panel
Sau khi đăng nhập, click vào menu "Quản trị" hoặc truy cập:
```
http://localhost:5173/admin/dashboard
```

---

## 📊 5. CẤU TRÚC BẢNG USERS

### Schema:
```sql
CREATE TABLE users (
  id                INTEGER PRIMARY KEY,
  username          VARCHAR(50) UNIQUE,
  email             VARCHAR(100) UNIQUE,
  password_hash     VARCHAR(255),
  full_name         VARCHAR(100),
  role              VARCHAR(20) DEFAULT 'student',  -- student, admin, guest
  stars_balance     INTEGER DEFAULT 0,
  current_streak    INTEGER DEFAULT 0,
  max_streak        INTEGER DEFAULT 0,
  freeze_streaks    INTEGER DEFAULT 0,
  is_anonymous      BOOLEAN DEFAULT false,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

### Roles:
- **admin** - Toàn quyền quản trị
- **student** - Học sinh thông thường
- **guest** - Khách (chưa đăng ký)

---

## ⚠️ 6. LƯU Ý BẢO MẬT

### Mật khẩu mạnh:
- Tối thiểu 8 ký tự
- Có chữ hoa, chữ thường
- Có số và ký tự đặc biệt
- Ví dụ: `Admin@2024!`, `SecurePass#123`

### Đổi mật khẩu:
1. Đăng nhập vào Admin Panel
2. Vào **Hồ sơ**
3. Chọn **Đổi mật khẩu**

### Backup database:
```bash
# SQLite
cp server/database/database.sqlite server/database/database.backup.sqlite

# PostgreSQL
pg_dump vuotvumon > backup.sql
```

---

## 🐛 7. TROUBLESHOOTING

### Lỗi: "Email hoặc username đã tồn tại"

**Giải pháp:**
- Dùng `listUsers.js` để xem danh sách users
- Dùng `updateUserToAdmin.js` để update user đó thành admin

### Lỗi: "Không tìm thấy user"

**Giải pháp:**
- Kiểm tra lại email đã nhập
- Dùng `listUsers.js` để xem email chính xác
- Email phân biệt hoa/thường

### Lỗi: "Database connection failed"

**Giải pháp:**
- Kiểm tra file `.env` có đúng không
- Chạy migration: `npm run migrate`
- Khởi động lại server

### Không vào được Admin Panel

**Nguyên nhân:**
- User chưa có role = 'admin'
- Chưa đăng nhập
- Token hết hạn

**Giải pháp:**
- Kiểm tra role bằng `listUsers.js`
- Đăng xuất và đăng nhập lại
- Xóa localStorage và cookies

---

## 📝 8. VÍ DỤ WORKFLOW

### Tình huống 1: Lần đầu setup hệ thống

```bash
# Bước 1: Xem có user nào chưa
node server/scripts/listUsers.js

# Bước 2: Tạo admin user đầu tiên
node server/scripts/createAdmin.js

# Bước 3: Đăng nhập vào http://localhost:5173/login
# Email: admin@vuotvumon.com
# Password: Admin@123
```

### Tình huống 2: Đã có user, muốn thêm quyền admin

```bash
# Bước 1: Liệt kê users để tìm email
node server/scripts/listUsers.js

# Bước 2: Update user thành admin
node server/scripts/updateUserToAdmin.js user@example.com

# Bước 3: User đó login lại để nhận quyền admin
```

### Tình huống 3: Tạo nhiều admin

```bash
# Tạo admin 1
node server/scripts/createAdmin.js
# (Sửa email thành admin1@vuotvumon.com)

# Tạo admin 2
node server/scripts/createAdmin.js
# (Sửa email thành admin2@vuotvumon.com)
```

---

## 📞 9. HỖ TRỢ

Nếu gặp vấn đề:

1. **Kiểm tra logs:**
   ```bash
   # Server logs
   npm run dev
   ```

2. **Kiểm tra database:**
   ```bash
   # SQLite
   sqlite3 server/database/database.sqlite
   SELECT * FROM users WHERE role = 'admin';

   # PostgreSQL
   psql vuotvumon
   SELECT * FROM users WHERE role = 'admin';
   ```

3. **Reset database (CHỈ TRONG DEVELOPMENT):**
   ```bash
   npm run migrate:rollback
   npm run migrate
   npm run seed
   ```

---

## ✅ CHECKLIST

- [ ] Đã tạo admin user
- [ ] Đã test đăng nhập admin
- [ ] Đã truy cập được Admin Panel
- [ ] Đã đổi mật khẩu mặc định
- [ ] Đã backup database
- [ ] Đã ghi chú thông tin admin ở nơi an toàn

---

**Cập nhật:** 2024-11-19
**Phiên bản:** 1.0
