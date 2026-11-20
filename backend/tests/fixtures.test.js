const { setupTestEnv, generateAdminToken, request } = require('./testHelper');
const { initializeFixtureSchema } = require('../src/fixtures/schema');
const fixtureRoutes = require('../src/fixtures/routes');
const { issueNumbers } = require('../src/fixtures/service');

jest.mock('../src/cap', () => ({
  validateToken: jest.fn(async token => ({ success: token === 'valid-token' })),
}));

describe('工装治具取号', () => {
  let app;
  let db;
  let close;

  beforeEach(() => {
    ({ app, db, close } = setupTestEnv());
    initializeFixtureSchema(db);
    app.use('/api/fixtures', fixtureRoutes);
  });

  afterEach(() => close());

  test('全新种类按申请数量发放，已有种类从历史最大数量流水号继续', async () => {
    const first = await request(app).post('/api/fixtures/issue').send({
      mode: 'new', applicant_name: '张三', type_code: 'FT', project_code: 'QCI-ABC',
      label: '定位治具', quantity: 3, capToken: 'valid-token',
    });
    expect(first.status).toBe(200);
    expect(first.body.data.numbers).toEqual(['FT-QCI-01-01', 'FT-QCI-01-02', 'FT-QCI-01-03']);

    const list = await request(app).get('/api/fixtures/kinds?search=定位');
    expect(list.body.data).toEqual([expect.objectContaining({
      base_number: 'FT-QCI-01', max_quantity_serial: 3, issued_count: 3, request_count: 1,
      created_at: expect.any(String),
    })]);

    const next = await request(app).post('/api/fixtures/issue').send({
      mode: 'existing', applicant_name: '李四', base_number: 'ft-qci-01',
      quantity: 2, capToken: 'valid-token',
    });
    expect(next.status).toBe(200);
    expect(next.body.data.numbers).toEqual(['FT-QCI-01-04', 'FT-QCI-01-05']);
    expect(db.prepare('SELECT COUNT(*) AS count FROM fixture_numbers').get().count).toBe(5);
    expect(db.prepare('SELECT COUNT(*) AS count FROM fixture_requests').get().count).toBe(2);

    db.prepare("UPDATE fixture_requests SET created_at = '2026-04-12 10:00:00'").run();
    const stats = await request(app).get('/api/fixtures/stats');
    expect(stats.body.data).toEqual([{ month: '2026-04', type_code: 'FT', applications: 2, numbers: 5 }]);
    const history = await request(app).get('/api/fixtures/requests?month=2026-04&type_code=FT&page=1&limit=1');
    expect(history.status).toBe(200);
    expect(history.body.data.pagination).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
    expect(history.body.data.data[0].numbers).toEqual(['FT-QCI-01-04', 'FT-QCI-01-05']);
  });

  test('类型和项目分别分配种类流水，单套可省略数量流水', () => {
    const first = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 1, include_quantity: false });
    const second = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 1 });
    const third = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'AM', project_code: 'QCI', quantity: 1 });
    expect(first.numbers).toEqual(['FT-QCI-01']);
    expect(second.numbers).toEqual(['FT-QCI-02-01']);
    expect(third.numbers).toEqual(['AM-QCI-01-01']);
  });

  test('项目列表中的长代号和数字可以取号并继续领取数量流水', async () => {
    const first = await request(app).post('/api/fixtures/issue').send({
      mode: 'new', applicant_name: '张三', type_code: 'FT', project_code: 'QCIPLAT9-ABC',
      quantity: 1, capToken: 'valid-token',
    });
    expect(first.status).toBe(200);
    expect(first.body.data.numbers).toEqual(['FT-QCIPLAT9-01-01']);

    const continuation = await request(app).post('/api/fixtures/issue').send({
      mode: 'existing', applicant_name: '李四', base_number: 'FT-QCIPLAT9-01',
      quantity: 1, capToken: 'valid-token',
    });
    expect(continuation.status).toBe(200);
    expect(continuation.body.data.numbers).toEqual(['FT-QCIPLAT9-01-02']);
  });

  test('省略项目代号后按类型分配种类流水，已有种类可继续发号', async () => {
    const first = await request(app).post('/api/fixtures/issue').send({
      mode: 'new', applicant_name: '张三', type_code: 'TL', omit_type_separator: true,
      quantity: 1, capToken: 'valid-token',
    });
    expect(first.status).toBe(200);
    expect(first.body.data.numbers).toEqual(['TL-01-01']);

    issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'QCI', quantity: 1 });
    const second = await request(app).post('/api/fixtures/issue').send({
      mode: 'new', applicant_name: '李四', type_code: 'TL', project_code: '',
      omit_type_separator: true, quantity: 2, capToken: 'valid-token',
    });
    expect(second.status).toBe(200);
    expect(second.body.data.numbers).toEqual(['TL-02-01', 'TL-02-02']);
    expect(db.prepare("SELECT project_code FROM fixture_kinds WHERE base_number = 'TL-02'").get().project_code).toBe('');

    const continuation = await request(app).post('/api/fixtures/issue').send({
      mode: 'existing', applicant_name: '王五', base_number: 'tl-02',
      quantity: 1, capToken: 'valid-token',
    });
    expect(continuation.status).toBe(200);
    expect(continuation.body.data.numbers).toEqual(['TL-02-03']);
    expect(() => issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', quantity: 1 })).toThrow('项目代号');
    expect(() => issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'QCI', omit_type_separator: true, quantity: 1 })).toThrow('特殊类别不需要选择项目代号');
  });

  test('流水号超过 99 时自动扩为三位', () => {
    db.prepare("INSERT INTO fixture_kinds (type_code, project_code, kind_serial, base_number) VALUES ('FT', 'QCI', 99, 'FT-QCI-99')").run();
    const next = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 1 });
    expect(next.numbers).toEqual(['FT-QCI-100-01']);
    db.prepare('UPDATE fixture_numbers SET quantity_serial = 99, full_number = ? WHERE full_number = ?').run('FT-QCI-100-99', next.numbers[0]);
    expect(issueNumbers(db, { mode: 'existing', applicant_name: 'B', base_number: next.base_number, quantity: 1 }).numbers).toEqual(['FT-QCI-100-100']);
  });

  test('TL-CM 种类和数量流水号从两位开始并在 99 后扩为三位', () => {
    const first = issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'CM', quantity: 1 });
    expect(first.numbers).toEqual(['TL-CM-01-01']);
    db.prepare("INSERT INTO fixture_kinds (type_code, project_code, kind_serial, base_number) VALUES ('TL', 'CM', 99, 'TL-CM-99')").run();
    const hundredth = issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'CM', quantity: 1 });
    expect(hundredth.numbers).toEqual(['TL-CM-100-01']);
    db.prepare('UPDATE fixture_numbers SET quantity_serial = 99, full_number = ? WHERE full_number = ?').run('TL-CM-100-99', hundredth.numbers[0]);
    expect(issueNumbers(db, { mode: 'existing', applicant_name: '乙', base_number: hundredth.base_number, quantity: 1 }).numbers)
      .toEqual(['TL-CM-100-100']);
  });

  test('复刻种类须输入系统内完整编号，并从历史最大数量号续发', async () => {
    issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'CM', quantity: 9 });
    const existing = await request(app).post('/api/fixtures/issue').send({
      mode: 'replica', applicant_name: '乙',
      base_number: 'tl-cm-01', quantity: 2, capToken: 'valid-token',
    });
    expect(existing.status).toBe(200);
    expect(existing.body.data.numbers).toEqual(['TL-CM-01-10', 'TL-CM-01-11']);

    const missing = await request(app).post('/api/fixtures/issue').send({
      mode: 'replica', applicant_name: '丙',
      base_number: 'TL-CM-03', quantity: 5, capToken: 'valid-token',
    });
    expect(missing.status).toBe(404);
    expect(missing.body.message).toContain('请从“全新种类”界面取号');
    expect(db.prepare('SELECT COUNT(*) AS count FROM fixture_kinds').get().count).toBe(1);
    expect(db.prepare('SELECT COUNT(*) AS count FROM fixture_requests').get().count).toBe(2);

    issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'CM', quantity: 1 });
    issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'CM', quantity: 5 });
    expect(issueNumbers(db, { mode: 'replica', applicant_name: '丁', base_number: 'TL-CM-03', quantity: 1 }).numbers)
      .toEqual(['TL-CM-03-06']);
    expect(db.prepare("SELECT COUNT(*) AS count FROM fixture_kinds WHERE type_code = 'TL' AND project_code = 'CM'").get().count).toBe(3);
    expect(issueNumbers(db, { mode: 'new', applicant_name: '戊', type_code: 'TL', project_code: 'CM', quantity: 1 }).numbers)
      .toEqual(['TL-CM-04-01']);
  });

  test('FT、AM、TL 均可复刻，按类型和项目分别续发数量流水号', () => {
    for (const typeCode of ['FT', 'AM', 'TL']) {
      for (let index = 1; index <= 3; index += 1) {
        issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: typeCode, project_code: 'CM', quantity: 1 });
      }
    }
    for (const typeCode of ['FT', 'AM', 'TL']) {
      const next = issueNumbers(db, { mode: 'replica', applicant_name: '乙', base_number: `${typeCode}-CM-03`, quantity: 1 });
      expect(next.numbers).toEqual([`${typeCode}-CM-03-02`]);
    }
    issueNumbers(db, { mode: 'new', applicant_name: '丙', type_code: 'AM', project_code: 'QCI', quantity: 1 });
    expect(issueNumbers(db, { mode: 'replica', applicant_name: '丁', base_number: 'AM-QCI-01', quantity: 1 }).numbers)
      .toEqual(['AM-QCI-01-02']);
  });

  test('复刻取号仅依赖完整种类编号，并要求数量流水号', () => {
    const payload = { mode: 'replica', applicant_name: '甲', quantity: 1 };
    expect(() => issueNumbers(db, { ...payload, base_number: 'TL-CM-1' })).toThrow('已有的种类编号');
    expect(() => issueNumbers(db, { ...payload, base_number: 'TL-CM-01', include_quantity: false })).toThrow('必须启用数量流水号');
    issueNumbers(db, { mode: 'new', applicant_name: '甲', type_code: 'TL', project_code: 'CM', quantity: 1 });
    expect(issueNumbers(db, { ...payload, base_number: 'TL-CM-01' }).numbers).toEqual(['TL-CM-01-02']);
    expect(db.prepare('SELECT COUNT(*) AS count FROM fixture_kinds').get().count).toBe(1);
  });

  test('无效种类、非法数量和流水号耗尽均不会留下半批编号', async () => {
    const missing = await request(app).post('/api/fixtures/issue').send({ mode: 'existing', applicant_name: 'A', base_number: 'FT-QCI-01', quantity: 1, capToken: 'valid-token' });
    expect(missing.status).toBe(404);
    expect(() => issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 2, include_quantity: false })).toThrow('多套工装');

    const first = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 1 });
    db.prepare('UPDATE fixture_numbers SET quantity_serial = 999, full_number = ? WHERE full_number = ?').run('FT-QCI-01-999', first.numbers[0]);
    expect(() => issueNumbers(db, { mode: 'existing', applicant_name: 'A', base_number: first.base_number, quantity: 2 })).toThrow('已用完');
    expect(db.prepare('SELECT COUNT(*) AS count FROM fixture_numbers').get().count).toBe(1);
  });

  test('取号接口要求有效人机验证', async () => {
    const payload = { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 1 };
    expect((await request(app).post('/api/fixtures/issue').send(payload)).status).toBe(400);
    expect((await request(app).post('/api/fixtures/issue').send({ ...payload, capToken: 'invalid' })).status).toBe(400);
    expect(db.prepare('SELECT COUNT(*) AS count FROM fixture_kinds').get().count).toBe(0);
  });

  test('仅管理员可导出全部申请，批量编号保持在同一行并安全转义', async () => {
    issueNumbers(db, { mode: 'new', applicant_name: '=SUM(1,1)', type_code: 'FT', project_code: 'QCI', label: '定位,"治具"', quantity: 2 });
    for (let index = 0; index < 9; index += 1) {
      issueNumbers(db, { mode: 'existing', applicant_name: `申请人${index}`, base_number: 'FT-QCI-01', quantity: 1 });
    }

    expect((await request(app).get('/api/fixtures/export')).status).toBe(401);
    const result = await request(app).get('/api/fixtures/export').set('Authorization', `Bearer ${generateAdminToken()}`);
    expect(result.status).toBe(200);
    expect(result.headers['content-type']).toMatch(/text\/csv/);
    expect(result.headers['content-disposition']).toMatch(/fixture_requests_.*\.csv/);
    expect(result.text.charCodeAt(0)).toBe(0xfeff);
    const lines = result.text.slice(1).split('\n');
    expect(lines).toHaveLength(11);
    expect(lines[0]).toContain('发放编号');
    expect(lines[1]).toContain('FT-QCI-01-11');
    expect(lines[10]).toContain('FT-QCI-01-01; FT-QCI-01-02');
    expect(lines[10]).toContain("'=SUM(1,1)");
    expect(lines[10]).toContain('定位,""治具""');
  });
});
