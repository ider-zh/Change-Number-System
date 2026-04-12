const Cap = require('@cap.js/server');
const db = require('./db/init');

/**
 * SQLite 存储实现，对接 @cap.js/server 的 storage 接口
 *
 * challenges.store(token, challengeData) - challengeData 包含 { expires, challenge }
 * tokens.store(key, expires) - key 和 expires 分开存储
 */
const capStorage = {
  challenges: {
    store: async (token, challengeData) => {
      db.prepare(
        'INSERT OR REPLACE INTO cap_challenges (token, data, expires) VALUES (?, ?, ?)'
      ).run(token, JSON.stringify(challengeData), challengeData.expires);
    },
    read: async (token) => {
      const row = db.prepare(
        'SELECT * FROM cap_challenges WHERE token = ?'
      ).get(token);
      if (!row) return null;
      return JSON.parse(row.data);
    },
    delete: async (token) => {
      db.prepare(
        'DELETE FROM cap_challenges WHERE token = ?'
      ).run(token);
    },
    deleteExpired: async () => {
      db.prepare(
        'DELETE FROM cap_challenges WHERE expires < ?'
      ).run(Date.now());
    }
  },
  tokens: {
    store: async (key, expires) => {
      db.prepare(
        'INSERT OR REPLACE INTO cap_tokens (key, expires) VALUES (?, ?)'
      ).run(key, expires);
    },
    get: async (key) => {
      const row = db.prepare(
        'SELECT * FROM cap_tokens WHERE key = ?'
      ).get(key);
      return row ? row.expires : null;
    },
    delete: async (key) => {
      db.prepare(
        'DELETE FROM cap_tokens WHERE key = ?'
      ).run(key);
    },
    deleteExpired: async () => {
      db.prepare(
        'DELETE FROM cap_tokens WHERE expires < ?'
      ).run(Date.now());
    }
  }
};

// 初始化 Cap 实例
const cap = new Cap({
  storage: capStorage,
  // 默认配置：challengeDifficulty=4, expiresMs=600000 (10分钟)
});

module.exports = cap;
