# 🚀 Hướng Dẫn Deploy Lên VPS

## 📋 Yêu Cầu

- VPS với Ubuntu/Debian
- Node.js 18+ đã cài đặt
- Nginx đã cài đặt (nếu dùng reverse proxy)
- Git đã cài đặt

## 🔧 Bước 1: Cấu Hình Environment Variables

### Backend (.env)

Sao chép file `.env` và cập nhật:

```bash
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Client URL (for CORS) - Update to your frontend URL
CLIENT_URL=https://your-domain.com

# JWT Secret - Change to a strong secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production-xyz123
JWT_EXPIRES_IN=7d

# Database
DB_PATH=./server/database/database.sqlite

# Session Secret - Change to a strong secret
SESSION_SECRET=your-super-secret-session-key-change-in-production-xyz456
```

### Frontend (client/.env.production)

**⚠️ QUAN TRỌNG**: Cập nhật file `client/.env.production`:

```bash
# Option 1: Backend cùng domain với frontend (recommended)
VITE_API_BASE_URL=/api

# Option 2: Backend ở port khác
VITE_API_BASE_URL=http://your-domain.com:3000/api

# Option 3: Backend ở subdomain riêng
VITE_API_BASE_URL=https://api.your-domain.com/api
```

## 📦 Bước 2: Build Frontend

```bash
cd client
npm install
npm run build
```

Sau khi build, thư mục `client/dist` sẽ chứa static files.

## 🌐 Bước 3: Cấu Hình Nginx

### Option A: Backend và Frontend cùng domain (Recommended)

Tạo file `/etc/nginx/sites-available/your-app`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend - Static files
    location / {
        root /path/to/your-project/vuot-vu-mon/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy to Node.js
    location /api {
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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Backend ở port riêng

Nếu backend chạy ở port 3000, cập nhật `client/.env.production`:

```bash
VITE_API_BASE_URL=http://your-domain.com:3000/api
```

Và mở port 3000 trên firewall:
```bash
sudo ufw allow 3000
```

## 🚀 Bước 4: Chạy Backend

### Sử dụng PM2 (Recommended)

```bash
# Cài đặt PM2
npm install -g pm2

# Start backend
cd /path/to/your-project/vuot-vu-mon
npm install
pm2 start server.js --name vuot-vu-mon

# Auto-start on reboot
pm2 startup
pm2 save
```

### Hoặc sử dụng systemd

Tạo file `/etc/systemd/system/vuot-vu-mon.service`:

```ini
[Unit]
Description=Vuot Vu Mon Backend
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/your-project/vuot-vu-mon
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable và start:
```bash
sudo systemctl enable vuot-vu-mon
sudo systemctl start vuot-vu-mon
sudo systemctl status vuot-vu-mon
```

## 🔍 Bước 5: Kiểm Tra

1. **Kiểm tra backend**:
   ```bash
   curl http://localhost:3000/api/auth/me
   ```

2. **Kiểm tra frontend**: Truy cập `http://your-domain.com`

3. **Xem logs**:
   ```bash
   # PM2
   pm2 logs vuot-vu-mon

   # Systemd
   sudo journalctl -u vuot-vu-mon -f
   ```

## 🐛 Troubleshooting

### Lỗi: "Đang khởi động game..." không mất

**Nguyên nhân**: Frontend không kết nối được backend.

**Giải pháp**:

1. Mở browser DevTools (F12) → Console tab
2. Kiểm tra log `🔧 API Base URL:` - phải đúng với backend URL
3. Kiểm tra Network tab - xem API calls có lỗi không

**Nếu thấy lỗi CORS**:
- Cập nhật `CLIENT_URL` trong backend `.env`
- Restart backend

**Nếu thấy lỗi 404**:
- Kiểm tra `VITE_API_BASE_URL` trong `client/.env.production`
- Build lại frontend: `cd client && npm run build`
- Copy `client/dist` sang VPS

**Nếu thấy lỗi Connection Refused**:
- Kiểm tra backend có chạy không: `pm2 status` hoặc `systemctl status vuot-vu-mon`
- Kiểm tra firewall: `sudo ufw status`
- Kiểm tra port: `netstat -tlnp | grep 3000`

### Lỗi: API calls bị 502 Bad Gateway

**Nguyên nhân**: Nginx không kết nối được Node.js backend.

**Giải pháp**:
1. Kiểm tra backend có chạy: `pm2 status`
2. Kiểm tra Nginx config: `sudo nginx -t`
3. Xem Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Lỗi: Frontend không load CSS/JS

**Nguyên nhân**: Vite build với base path không đúng.

**Giải pháp**:
Cập nhật `client/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/', // or '/your-path/' if deployed in subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

Build lại: `npm run build`

## 🔒 Bước 6: SSL (Optional but Recommended)

Sử dụng Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Nginx sẽ tự động cấu hình HTTPS.

## 📊 Monitoring

```bash
# PM2 monitoring
pm2 monit

# Disk usage
df -h

# Memory usage
free -m

# Backend logs
pm2 logs vuot-vu-mon --lines 100
```

## 🔄 Update Code

```bash
# Pull latest code
cd /path/to/your-project
git pull

# Update backend
npm install
pm2 restart vuot-vu-mon

# Update frontend
cd client
npm install
npm run build
# Copy dist to nginx directory or use symlink
```

## 📞 Support

Nếu vẫn gặp lỗi, hãy cung cấp:
1. Browser console logs (F12 → Console)
2. Backend logs (`pm2 logs` hoặc `journalctl`)
3. Nginx logs (`/var/log/nginx/error.log`)
4. Network tab trong DevTools để xem API calls
