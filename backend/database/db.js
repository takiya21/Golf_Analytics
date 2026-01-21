const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/golf.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database methods
db.run = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite3.Database.prototype.run.call(this, sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.get = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite3.Database.prototype.get.call(this, sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.all = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite3.Database.prototype.all.call(this, sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const initializeDatabase = () => {
  db.serialize(() => {
    // Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Holes table - stores hole metadata
    db.run(`
      CREATE TABLE IF NOT EXISTS holes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        hole_number INTEGER NOT NULL,
        par INTEGER NOT NULL,
        yardage INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id),
        UNIQUE(course_id, hole_number)
      )
    `);

    // Rounds table - one record per round (18 holes)
    db.run(`
      CREATE TABLE IF NOT EXISTS rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        play_date DATE NOT NULL,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Round_scores table - 18 records per round
    db.run(`
      CREATE TABLE IF NOT EXISTS round_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        hole_id INTEGER NOT NULL,
        score INTEGER,
        putts INTEGER,
        first_club TEXT,
        fairway_kept BOOLEAN,
        greens_on INTEGER,
        bogey_on BOOLEAN,
        ob_count INTEGER DEFAULT 0,
        bunker_count INTEGER DEFAULT 0,
        one_penalty INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (round_id) REFERENCES rounds(id),
        FOREIGN KEY (hole_id) REFERENCES holes(id),
        UNIQUE(round_id, hole_id)
      )
    `);

    // OCR raw data table - for storing pending OCR results
    db.run(`
      CREATE TABLE IF NOT EXISTS ocr_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER,
        raw_text TEXT,
        extracted_data TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (round_id) REFERENCES rounds(id)
      )
    `);

    console.log('Database initialized successfully');
  });
};

module.exports = {
  db,
  initializeDatabase
};
