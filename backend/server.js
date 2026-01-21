const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
const db = require('./database/db');
db.initializeDatabase();

// Routes
app.use('/api/rounds', require('./routes/rounds'));
app.use('/api/holes', require('./routes/holes'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/stats', require('./routes/stats'));

// Serve static files
app.use('/hole_img', express.static(path.join(__dirname, '../hole_img')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🏌️ Golf Analytics Backend running on http://localhost:${PORT}`);
});
