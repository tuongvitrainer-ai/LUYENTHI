# Production Setup Guide

## VPS Configuration

### 1. Cấu hình Environment Variables

Khi deploy lên VPS production, **PHẢI** cập nhật file `.env` với các giá trị production:

```bash
# Copy template
cp .env.production.example .env

# Sau đó edit file .env và cập nhật:
nano .env
```

**Các giá trị BẮT BUỘC phải thay đổi:**

1. **NODE_ENV**: Đổi thành `production`
2. **CLIENT_URL**: Thay bằng domain thực tế (ví dụ: `https://luyenthi.io.vn`)
3. **JWT_SECRET**: Tạo secret mới bằng lệnh:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. **SESSION_SECRET**: Tạo secret mới (dùng lệnh trên)

### 2. Database Setup

#### Sử dụng SQLite (Mặc định):
```bash
# Set trong .env
USE_SQLITE=true
DB_PATH=./server/database/database.sqlite

# Chạy migrations
npm run db:migrate
```

#### Chuyển sang PostgreSQL (Tùy chọn):
```bash
# 1. Cài đặt PostgreSQL
sudo apt install postgresql postgresql-contrib

# 2. Tạo database và user
sudo -u postgres psql
CREATE DATABASE vuotvumon;
CREATE USER vuotvumon_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vuotvumon TO vuotvumon_user;
\q

# 3. Cập nhật .env
# Comment dòng USE_SQLITE=true
# Uncomment và cập nhật thông tin PostgreSQL
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vuotvumon
DB_USER=vuotvumon_user
DB_PASSWORD=your_secure_password

# 4. Chạy migrations
npm run db:migrate
```

### 3. Build Client

```bash
cd client
npm install --legacy-peer-deps
npm run build
cd ..
```

### 4. PM2 Setup

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name vuot-vu-mon

# Setup auto-start on boot
pm2 startup
pm2 save

# View logs
pm2 logs vuot-vu-mon

# Restart after config changes
pm2 restart vuot-vu-mon --update-env
```

### 5. Rebuild Native Dependencies

Nếu gặp lỗi với `better-sqlite3` hoặc native modules:

```bash
npm rebuild better-sqlite3
pm2 restart vuot-vu-mon
```

### 6. Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name luyenthi.io.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7. SSL Certificate (với Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d luyenthi.io.vn
```

## Checklist Production

- [ ] Cập nhật `.env` với giá trị production
- [ ] Thay đổi JWT_SECRET và SESSION_SECRET
- [ ] Build client (`cd client && npm run build`)
- [ ] Chạy database migrations
- [ ] Rebuild native dependencies nếu cần
- [ ] Setup PM2 và auto-start
- [ ] Cấu hình Nginx reverse proxy
- [ ] Cài đặt SSL certificate
- [ ] Test tất cả API endpoints
- [ ] Monitor logs với `pm2 logs`

## Troubleshooting

### Lỗi "invalid ELF header" với better-sqlite3
```bash
npm rebuild better-sqlite3
pm2 restart vuot-vu-mon
```

### CORS errors
Kiểm tra `CLIENT_URL` trong `.env` khớp với domain thực tế

### Database connection errors
- SQLite: Kiểm tra `DB_PATH` đúng và thư mục tồn tại
- PostgreSQL: Kiểm tra PostgreSQL đang chạy và thông tin kết nối đúng

### Server không khởi động
```bash
pm2 logs vuot-vu-mon --lines 50
```
