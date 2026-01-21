# Golfys Configuration

## Backend Configuration (.env)

Located in `backend/.env`:

```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/golf.db
LOG_LEVEL=debug
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | バックエンドサーバーのポート |
| NODE_ENV | development | 実行環境（development/production） |
| DATABASE_PATH | ./data/golf.db | SQLiteデータベースのパス |
| LOG_LEVEL | debug | ログレベル（error/warn/info/debug） |

## Frontend Configuration (vite.config.js)

フロントエンドサーバーのポート: `3000`

API プロキシ設定:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

## Database Configuration

### SQLite Location
```
/root/Data/takiya21/Golf_Analytics/backend/data/golf.db
```

### Schema
- courses: コース情報
- holes: ホール情報
- rounds: ラウンド記録
- round_scores: スコア詳細
- ocr_results: OCR処理結果

## Course Images Location

```
/root/Data/takiya21/Golf_Analytics/hole_img/{course_name}/
```

File naming convention:
```
Hole{1-18}_par{N}_{yardage}yard.webp
```

Example:
```
Hole1_par4_420yard.webp
Hole2_par4_306yard.webp
```

## API Configuration

### Base URL
Development: `http://localhost:5000/api`
Production: `https://your-domain.com/api`

### CORS Settings
- Enabled for local development
- Can be configured in `backend/server.js`

## Customization

### OCR Language Support
In `backend/utils/ocr.js`:
```javascript
await Tesseract.recognize(processedImagePath, 'jpn+eng')
```

Change languages as needed:
- `jpn` - Japanese
- `eng` - English
- `jpn+eng` - Both

### Database Location
To use a different database path:
```bash
DATABASE_PATH=/path/to/custom.db npm run dev
```

### Port Configuration
To use different ports:

**Backend:**
```bash
PORT=5001 npm run dev
```

**Frontend:** Edit `vite.config.js`:
```javascript
server: {
  port: 3001,
  // ...
}
```

## Production Deployment

### Backend

1. Set environment variables:
```bash
export NODE_ENV=production
export PORT=5000
```

2. Start server:
```bash
npm start
```

### Frontend

1. Build for production:
```bash
npm run build
```

2. Deploy `dist/` folder to web server

## Security Recommendations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure for production domain
3. **API Keys**: If using external services, use environment variables
4. **Database**: Backup SQLite file regularly
5. **File Upload**: Validate and sanitize file uploads

## Performance Tuning

### Database
- Add indexes for frequently queried columns
- Vacuum database periodically:
```bash
sqlite3 data/golf.db "VACUUM;"
```

### Frontend
- Enable gzip compression in production
- Use CDN for static assets
- Implement lazy loading for images

## Monitoring

### Backend Logs
```bash
# Check recent logs
tail -f backend/data/logs.txt
```

### Database Status
```bash
# Check database size
ls -lh backend/data/golf.db

# Verify integrity
sqlite3 backend/data/golf.db "PRAGMA integrity_check;"
```

---

For more details, see README.md and QUICKSTART.md
