// 测试功能开关API
const { setupTestEnv, generateAdminToken, createAdminInDb, closeTestDb, request } = require('./testHelper');

describe('功能开关 API 测试', () => {
  let app, db, adminToken;

  beforeEach(async () => {
    const env = setupTestEnv();
    app = env.app;
    db = env.db;
    await createAdminInDb(db);
    adminToken = generateAdminToken();
  });

  afterEach(() => {
    closeTestDb(db);
  });

  describe('GET /api/settings/feature-toggles', () => {
    test('应该返回功能开关状态', async () => {
      const res = await request(app).get('/api/settings/feature-toggles');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('allow_request_project');
      expect(res.body.data).toHaveProperty('allow_request_number_type');
      expect(typeof res.body.data.allow_request_project).toBe('boolean');
      expect(typeof res.body.data.allow_request_number_type).toBe('boolean');
    });

    test('应该返回正确的开关数据结构', async () => {
      const res = await request(app).get('/api/settings/feature-toggles');

      expect(res.body.data).toHaveProperty('allow_request_project');
      expect(res.body.data).toHaveProperty('allow_request_number_type');
    });
  });

  describe('PUT /api/settings/feature-toggles', () => {
    test('管理员应该能够更新功能开关状态', async () => {
      const res = await request(app)
        .put('/api/settings/feature-toggles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          allow_request_project: true,
          allow_request_number_type: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.allow_request_project).toBe(true);
      expect(res.body.data.allow_request_number_type).toBe(true);
    });

    test('管理员应该能够单独更新某个开关', async () => {
      // 先重置为关闭
      await request(app)
        .put('/api/settings/feature-toggles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          allow_request_project: false,
          allow_request_number_type: false
        });

      const res = await request(app)
        .put('/api/settings/feature-toggles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          allow_request_project: true
        });

      expect(res.status).toBe(200);
      expect(res.body.data.allow_request_project).toBe(true);
      expect(res.body.data.allow_request_number_type).toBe(false);
    });

    test('非管理员不能更新功能开关状态', async () => {
      const res = await request(app)
        .put('/api/settings/feature-toggles')
        .send({
          allow_request_project: true
        });

      expect(res.status).toBe(401);
    });

    test('应该拒绝无效的布尔值', async () => {
      const res = await request(app)
        .put('/api/settings/feature-toggles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          allow_request_project: 'invalid'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('更新后应该持久化到数据库', async () => {
      // 确保初始状态为关闭
      await request(app)
        .put('/api/settings/feature-toggles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          allow_request_project: false
        });

      // 更新为开启
      await request(app)
        .put('/api/settings/feature-toggles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          allow_request_project: true
        });

      // 查询数据库验证
      const setting = db.prepare(`
        SELECT setting_value FROM system_settings WHERE setting_key = ?
      `).get('allow_request_project');

      expect(setting.setting_value).toBe('true');
    });
  });
});
