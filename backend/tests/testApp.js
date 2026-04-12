const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { createTestDb, initTestSchema, closeTestDb } = require('./testDb');

// 模拟 dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

/**
 * 创建测试用 Express 应用
 * @param {Database} testDb 测试数据库实例
 * @returns {express.Application}
 */
function createTestApp(testDb) {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 将数据库实例挂载到应用上
  app.set('db', testDb);

  return app;
}

/**
 * 创建完整的测试环境
 * @returns {{ app: express.Application, db: Database, close: Function }}
 */
function setupTestEnv() {
  const db = createTestDb();
  initTestSchema(db);
  
  const app = createTestApp(db);
  
  const close = () => {
    closeTestDb(db);
  };

  return { app, db, close };
}

/**
 * 生成管理员认证 Token
 * @param {express.Application} app 应用实例
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<string>} JWT Token
 */
async function getAdminToken(app, username = 'admin', password = 'Aa123456') {
  const response = await request(app)
    .post('/api/admin/login')
    .send({ username, password });
  
  return response.body.data?.token;
}

module.exports = {
  createTestApp,
  setupTestEnv,
  getAdminToken,
  request
};
