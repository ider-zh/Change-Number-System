// Simplified test suite that focuses on core functionality
const { setupTestEnv, generateAdminToken, createAdminInDb, closeTestDb, request } = require('./testHelper');

describe('后端 API 基础测试', () => {
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

  describe('数据库初始化', () => {
    test('应该成功创建所有表', () => {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const tableNames = tables.map(t => t.name);
      
      expect(tableNames).toContain('projects');
      expect(tableNames).toContain('number_types');
      expect(tableNames).toContain('applications');
      expect(tableNames).toContain('admins');
    });

    test('应该支持插入和查询数据', () => {
      db.prepare("INSERT INTO projects (code, name) VALUES ('TEST', 'Test Project')").run();
      const project = db.prepare("SELECT * FROM projects WHERE code = 'TEST'").get();
      
      expect(project).toBeDefined();
      expect(project.code).toBe('TEST');
    });
  });

  describe('健康检查', () => {
    test('应该返回成功响应', async () => {
      // 测试任意现有端点
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('IP 工具', () => {
    test('应该从请求中提取 IP', () => {
      const { getClientIP } = require('../src/utils/ip');
      const req = { headers: { 'x-forwarded-for': '192.168.1.1' } };
      expect(getClientIP(req)).toBe('192.168.1.1');
    });

    test('应该验证 IPv4 地址', () => {
      const { isValidIP } = require('../src/utils/ip');
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('invalid')).toBe(false);
    });
  });

  describe('管理员认证', () => {
    test('管理员应该能够登录', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ username: 'admin', password: 'Aa123456' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe('项目 API', () => {
    test('应该能够获取项目列表', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('管理员应该能够创建项目', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'TEST001', name: 'Test Project' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('TEST001');
    });
  });

  describe('编号类型 API', () => {
    test('应该能够获取编号类型列表', async () => {
      const res = await request(app).get('/api/number-types');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('申请记录 API', () => {
    test('用户应该能够提交申请', async () => {
      // 先创建必要的数据
      db.prepare("INSERT INTO projects (code, name) VALUES ('ALPHA01', 'Test')").run();
      db.prepare("INSERT INTO number_types (type_code, type_name) VALUES ('CR', 'Test')").run();

      const res = await request(app)
        .post('/api/applications')
        .send({
          applicant_name: '测试用户',
          project_code: 'ALPHA01',
          number_type: 'CR'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.full_number).toContain('CR-ALPHA01');
    });
  });
});
