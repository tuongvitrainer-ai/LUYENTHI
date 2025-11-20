# PostgreSQL Setup Guide for VPS

## Bước 1: Cài đặt PostgreSQL (nếu chưa có)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

## Bước 2: Tạo Database và User

### Option A: Sử dụng psql với sudo (Recommended)

```bash
# Switch to postgres user
sudo -u postgres psql

# Trong psql prompt, chạy các lệnh sau:
```

```sql
-- Tạo user mới
CREATE USER vuotvumon_user WITH PASSWORD 'vuotvumon_secure_password_2024';

-- Tạo database
CREATE DATABASE vuotvumon OWNER vuotvumon_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vuotvumon TO vuotvumon_user;

-- Connect to new database
\c vuotvumon

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO vuotvumon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vuotvumon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vuotvumon_user;

-- Exit psql
\q
```

### Option B: Chạy SQL file

```bash
# Tạo file SQL
cat > setup_db.sql << 'EOF'
CREATE USER vuotvumon_user WITH PASSWORD 'vuotvumon_secure_password_2024';
CREATE DATABASE vuotvumon OWNER vuotvumon_user;
GRANT ALL PRIVILEGES ON DATABASE vuotvumon TO vuotvumon_user;
\c vuotvumon
GRANT ALL ON SCHEMA public TO vuotvumon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vuotvumon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vuotvumon_user;
EOF

# Chạy file
sudo -u postgres psql -f setup_db.sql
```

## Bước 3: Cấu hình PostgreSQL Authentication (nếu cần)

Nếu gặp lỗi authentication, cần cấu hình `pg_hba.conf`:

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Thêm hoặc sửa dòng sau (trước các dòng khác):

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    vuotvumon       vuotvumon_user  127.0.0.1/32            md5
host    vuotvumon       vuotvumon_user  ::1/128                 md5
```

Restart PostgreSQL:

```bash
sudo service postgresql restart
```

## Bước 4: Test kết nối

```bash
# Test kết nối với user mới
PGPASSWORD='vuotvumon_secure_password_2024' psql -h localhost -U vuotvumon_user -d vuotvumon -c "\dt"
```

Nếu thành công, bạn sẽ thấy danh sách tables (hoặc "Did not find any relations" nếu database mới).

## Bước 5: Cập nhật .env file

File `.env` đã được cấu hình với thông tin sau:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vuotvumon
DB_USER=vuotvumon_user
DB_PASSWORD=vuotvumon_secure_password_2024
```

**QUAN TRỌNG**: Đổi password trong production sang một giá trị mạnh và an toàn hơn!

## Bước 6: Chạy database migrations

```bash
cd /home/user/LUYENTHI/vuot-vu-mon
npm run db:migrate
```

Hoặc:

```bash
node -e "const db = require('./server/database/db'); db.runMigrations().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });"
```

## Bước 7: Restart application

```bash
pm2 restart vuot-vu-mon
pm2 logs vuot-vu-mon
```

## Troubleshooting

### Lỗi: "Peer authentication failed"

**Giải pháp**: Sử dụng TCP/IP connection thay vì Unix socket:
- Kết nối với `-h localhost` thay vì kết nối trực tiếp
- Hoặc cấu hình `pg_hba.conf` như ở Bước 3

### Lỗi: "Password authentication failed"

**Kiểm tra**:
1. Password trong `.env` khớp với password đã tạo
2. File `pg_hba.conf` có cấu hình đúng method (md5 hoặc scram-sha-256)
3. PostgreSQL đã được restart sau khi sửa config

### Lỗi: "Database does not exist"

**Giải pháp**: Chạy lại lệnh CREATE DATABASE ở Bước 2

### Lỗi: "Permission denied for schema public"

**Giải pháp**: Chạy lại các lệnh GRANT ở Bước 2:

```bash
sudo -u postgres psql -d vuotvumon -c "GRANT ALL ON SCHEMA public TO vuotvumon_user;"
sudo -u postgres psql -d vuotvumon -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vuotvumon_user;"
```

## Kiểm tra PostgreSQL đang chạy

```bash
service postgresql status
```

Nếu down, khởi động lại:

```bash
service postgresql start
```

## Xem logs PostgreSQL

```bash
tail -f /var/log/postgresql/postgresql-16-main.log
```

## Các lệnh hữu ích

```bash
# List all databases
sudo -u postgres psql -c "\l"

# List all users
sudo -u postgres psql -c "\du"

# Connect to database
sudo -u postgres psql -d vuotvumon

# Backup database
pg_dump -U vuotvumon_user -h localhost vuotvumon > backup.sql

# Restore database
psql -U vuotvumon_user -h localhost vuotvumon < backup.sql
```

## Security Best Practices

1. **Đổi password mạnh hơn**: Sử dụng password generator
2. **Giới hạn kết nối**: Chỉ cho phép kết nối từ localhost trong production
3. **Backup thường xuyên**: Tạo cron job để backup database
4. **Monitor logs**: Kiểm tra logs thường xuyên để phát hiện vấn đề sớm
