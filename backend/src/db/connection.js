const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function getDatabase() {
  if (db) {
    return db;
  }

  const dbDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = process.env.DB_PATH || path.join(dbDir, 'app.db');
  db = new Database(dbPath);

  // 配置 WAL 模式
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('busy_timeout = 5000');

  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
};
