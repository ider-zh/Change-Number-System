const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 确保数据目录存在
const dbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'app.db');
const db = new Database(dbPath);

// 配置 WAL 模式
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');

// 创建项目代号表
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '',
    status TEXT DEFAULT 'approved' CHECK(status IN ('approved', 'pending', 'rejected')),
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME
  );
`);

// 创建编号类型表
db.exec(`
  CREATE TABLE IF NOT EXISTS number_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_code TEXT UNIQUE NOT NULL,
    type_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'approved' CHECK(status IN ('approved', 'pending', 'rejected')),
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME
  );
`);

// 创建申请记录表
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_name TEXT NOT NULL,
    applicant_type TEXT,
    project_code TEXT NOT NULL,
    number_type TEXT NOT NULL,
    serial_number INTEGER NOT NULL,
    full_number TEXT NOT NULL,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 创建用户项目代号申请表
db.exec(`
  CREATE TABLE IF NOT EXISTS project_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    project_code TEXT NOT NULL,
    project_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('approved', 'pending', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewer_note TEXT
  );
`);

// 创建用户编号类型申请表
db.exec(`
  CREATE TABLE IF NOT EXISTS number_type_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type_code TEXT NOT NULL,
    type_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('approved', 'pending', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewer_note TEXT
  );
`);

// 创建管理员表
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 创建 cap.js 人机验证挑战表
db.exec(`
  CREATE TABLE IF NOT EXISTS cap_challenges (
    token TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires INTEGER NOT NULL
  );
`);

// 创建 cap.js 人机验证令牌表
db.exec(`
  CREATE TABLE IF NOT EXISTS cap_tokens (
    key TEXT PRIMARY KEY,
    expires INTEGER NOT NULL
  );
`);

// 创建系统设置表（功能开关）
db.exec(`
  CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 插入预设数据
const insertProject = db.prepare(`
  INSERT OR IGNORE INTO projects (code, name, status, approved_at)
  VALUES (?, ?, 'approved', CURRENT_TIMESTAMP)
`);

const insertNumberType = db.prepare(`
  INSERT OR IGNORE INTO number_types (type_code, type_name, description, status, approved_at)
  VALUES (?, ?, '', 'approved', CURRENT_TIMESTAMP)
`);

// 事务插入预设数据
const insertPresets = db.transaction(() => {
  insertProject.run('ALPHA01', 'Alpha Project 01');
  insertProject.run('BETA88', 'Beta Project 88');
  insertProject.run('NOVA02', 'Nova Project 02');

  insertNumberType.run('CR', 'Change Request');
  insertNumberType.run('DCP', 'Design Change Proposal');
  insertNumberType.run('CN', 'Change Notice');
  insertNumberType.run('TD', 'Technical Document');

  // 插入默认功能开关（默认关闭）
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description)
    VALUES (?, ?, ?)
  `);
  insertSetting.run('allow_request_project', 'false', '允许用户申请新项目代号');
  insertSetting.run('allow_request_number_type', 'false', '允许用户申请新编号类型');
});

insertPresets();

console.log('Database initialized successfully with WAL mode');
console.log('Tables created: projects, number_types, applications, project_requests, number_type_requests, admins, cap_challenges, cap_tokens, system_settings');
console.log('Preset data inserted: 3 projects, 3 number types, 2 feature toggles');

module.exports = db;
