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
    expect(list.body.data).toEqual([expect.objectContaining({ base_number: 'FT-QCI-01', max_quantity_serial: 3 })]);

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
    const second = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 1, omit_type_separator: true });
    const third = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'AM', project_code: 'QCI', quantity: 1 });
    expect(first.numbers).toEqual(['FT-QCI-01']);
    expect(second.numbers).toEqual(['FTQCI-02-01']);
    expect(third.numbers).toEqual(['AM-QCI-01-01']);
  });

  test('流水号超过 99 时自动扩为三位', () => {
    db.prepare("INSERT INTO fixture_kinds (type_code, project_code, kind_serial, base_number) VALUES ('FT', 'QCI', 99, 'FT-QCI-99')").run();
    const next = issueNumbers(db, { mode: 'new', applicant_name: 'A', type_code: 'FT', project_code: 'QCI', quantity: 1 });
    expect(next.numbers).toEqual(['FT-QCI-100-01']);
    db.prepare('UPDATE fixture_numbers SET quantity_serial = 99, full_number = ? WHERE full_number = ?').run('FT-QCI-100-99', next.numbers[0]);
    expect(issueNumbers(db, { mode: 'existing', applicant_name: 'B', base_number: next.base_number, quantity: 1 }).numbers).toEqual(['FT-QCI-100-100']);
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
