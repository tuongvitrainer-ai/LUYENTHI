# Hướng dẫn Upload Hình ảnh và Âm thanh cho Câu hỏi

## Tổng quan

Hệ thống đã được cập nhật để hỗ trợ upload hình ảnh và âm thanh cho câu hỏi. Tính năng này cho phép:
- Upload hình ảnh minh họa cho câu hỏi (JPEG, PNG, GIF, WebP)
- Upload file âm thanh cho câu hỏi nghe (MP3, WAV, OGG, M4A)
- Tự động điều chỉnh kích thước hình ảnh phù hợp với thiết bị
- Preview trước khi lưu

## Cấu trúc Database

### Migration mới: `20241122000001_add_media_fields_to_questions.js`

Thêm các trường mới vào bảng `questions`:

```sql
- image_url: STRING(500) - URL đến hình ảnh câu hỏi
- audio_url: STRING(500) - URL đến file âm thanh
- difficulty_level: INTEGER (1-5) - Độ khó hiển thị bằng số sao
- points: INTEGER - Điểm thưởng khi trả lời đúng
- time_limit: INTEGER - Thời gian giới hạn (giây)
```

### Chạy Migration

```bash
cd vuot-vu-mon
npm run db:migrate
```

Hoặc:

```bash
cd server
npx knex migrate:latest
```

## Backend API

### 1. Upload File Endpoint

**POST `/api/upload`** - Upload một file (image hoặc audio)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body:**
```
file: <binary file>
```

**Response:**
```json
{
  "success": true,
  "message": "Tải file thành công",
  "data": {
    "url": "/uploads/filename-123456789.jpg",
    "filename": "filename-123456789.jpg",
    "originalName": "my-image.jpg",
    "mimeType": "image/jpeg",
    "size": 245678
  }
}
```

### 2. Upload Multiple Files

**POST `/api/upload/multiple`**

**Body:**
```
files: <array of files> (max 5 files)
```

### 3. Tạo/Cập nhật Câu hỏi với Media

**POST `/api/admin/questions`** hoặc **PUT `/api/admin/questions/:id`**

**Body example:**
```json
{
  "content_json": {
    "question_type": "multiple_choice",
    "question_text": "Hãy chọn từ đúng trong hình?",
    "correct_answer": "A",
    "explanation": "...",
    "options": [
      { "id": "A", "text": "doll" },
      { "id": "B", "text": "robot" },
      { "id": "C", "text": "car" },
      { "id": "D", "text": "ball" }
    ]
  },
  "tags": [
    { "tag_type": "subject", "tag_value": "Tiếng Anh" },
    { "tag_type": "grade", "tag_value": "Lớp 3" },
    { "tag_type": "topic", "tag_value": "Toys" }
  ],
  "image_url": "http://localhost:3000/uploads/toy-image-123456.jpg",
  "audio_url": "http://localhost:3000/uploads/pronunciation-123456.mp3",
  "difficulty_level": 2,
  "points": 10,
  "time_limit": 60
}
```

## Frontend - Admin Panel

### QuestionForm Component

#### Upload Hình ảnh

1. Click button **"Chọn hình ảnh"**
2. Chọn file từ máy tính (chấp nhận: .jpg, .png, .gif, .webp)
3. Hệ thống tự động upload và hiển thị preview
4. Có thể xóa và upload lại bất cứ lúc nào

#### Upload Âm thanh

1. Click button **"Chọn file âm thanh"**
2. Chọn file từ máy tính (chấp nhận: .mp3, .wav, .ogg, .m4a)
3. Hệ thống hiển thị audio player để nghe thử
4. Có thể xóa và upload lại

#### Giới hạn

- **Kích thước file tối đa:** 10MB
- **Định dạng hình ảnh:** JPEG, PNG, GIF, WebP
- **Định dạng âm thanh:** MP3, WAV, OGG, M4A

#### Code Example

```jsx
<Upload
  beforeUpload={(file) => handleFileUpload(file, 'image')}
  showUploadList={false}
  accept="image/*"
>
  <Button icon={<FileImageOutlined />} loading={uploading}>
    Chọn hình ảnh
  </Button>
</Upload>

{imageUrl && (
  <Image
    src={imageUrl}
    alt="Question image"
    style={{ maxWidth: '100%', maxHeight: '200px' }}
  />
)}
```

## Frontend - QuestionView (Hiển thị cho User)

### Hiển thị Media

Hình ảnh và âm thanh được hiển thị giữa tiêu đề câu hỏi và các lựa chọn:

```jsx
{(currentQuestion.image_url || currentQuestion.audio_url) && (
  <div className="question-media">
    {currentQuestion.image_url && (
      <img
        src={currentQuestion.image_url}
        alt="Question illustration"
        style={{
          maxWidth: '100%',
          maxHeight: '300px',
          height: 'auto',
          objectFit: 'contain'
        }}
      />
    )}
    {currentQuestion.audio_url && (
      <audio controls src={currentQuestion.audio_url} />
    )}
  </div>
)}
```

### Responsive Design

Hình ảnh tự động điều chỉnh kích thước:
- **Desktop:** Tối đa 100% width, height tối đa 300px
- **Mobile:** Tự động scale theo màn hình
- **objectFit: contain** - Giữ tỷ lệ gốc, không bị méo

Audio player:
- **Width:** 100% (tối đa 400px)
- Responsive controls tự động của browser

## File Storage

### Cấu trúc thư mục

```
vuot-vu-mon/
├── uploads/                    # Thư mục chứa file upload
│   ├── image-123456.jpg
│   ├── audio-789012.mp3
│   └── ...
├── server/
│   └── middleware/
│       └── upload.js          # Multer config
└── .gitignore                 # uploads/ đã được ignore
```

### Static File Serving

File được serve tại `/uploads/*` bởi Express:

```javascript
// server/app.js
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

URL đầy đủ:
```
http://localhost:3000/uploads/filename-123456.jpg
```

## Testing

### Test Upload API

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Test Question with Media

1. Đăng nhập admin panel: `http://localhost:5173/admin`
2. Tạo câu hỏi mới
3. Upload hình ảnh/âm thanh
4. Lưu câu hỏi
5. Truy cập QuestionView để xem hiển thị

## Security

### File Validation

- **File type checking:** Chỉ chấp nhận image/* và audio/*
- **File size limit:** 10MB tối đa
- **Authentication:** Chỉ admin mới được upload
- **Filename sanitization:** Tự động rename với timestamp + random

### Best Practices

1. **Không upload file nhạy cảm** - Tất cả file trong /uploads có thể truy cập công khai
2. **Kiểm tra file trước khi upload** - Đảm bảo nội dung phù hợp
3. **Xóa file cũ** - Khi cập nhật câu hỏi với media mới, nên xóa file cũ (manual hoặc script)
4. **Backup định kỳ** - Backup thư mục uploads cùng với database

## Troubleshooting

### Lỗi: "Không có file nào được tải lên"

- Kiểm tra `Content-Type: multipart/form-data`
- Đảm bảo field name là `file`

### Lỗi: "connect ECONNREFUSED"

- Database chưa chạy, start PostgreSQL:
  ```bash
  sudo service postgresql start
  ```

### Hình ảnh không hiển thị

- Kiểm tra URL có đúng format: `http://localhost:3000/uploads/...`
- Kiểm tra file tồn tại trong thư mục `uploads/`
- Kiểm tra static serving trong `app.js`

### Audio không phát

- Browser có thể block autoplay
- Kiểm tra định dạng audio (MP3 được hỗ trợ rộng rãi nhất)
- Thử click vào audio controls để phát thủ công

## Migration từ hệ thống cũ

Nếu có câu hỏi cũ với media nhúng trong rich text:

1. Extract image/audio URLs từ `content_json`
2. Re-upload files qua API mới
3. Update questions với `image_url` và `audio_url` mới
4. Clean up HTML trong `question_text`

## Roadmap

### Phase 2 (Future)

- [ ] Cloud storage (AWS S3, Cloudinary)
- [ ] Image compression/optimization
- [ ] Video support
- [ ] Multiple images per question
- [ ] Image editing trong admin panel
- [ ] Automatic cleanup của unused files

## Support

Nếu gặp vấn đề, check logs:

```bash
# Server logs
npm run dev

# Database logs
npm run db:status
```

Hoặc tạo issue trên GitHub repository.
