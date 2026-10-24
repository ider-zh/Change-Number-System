const { setupTestEnv, closeTestDb, request, generateAdminToken } = require('./testHelper');

describe('其他质量体系文件编号', () => {
  let app;
  let db;

  beforeEach(() => {
    ({ app, db } = setupTestEnv());
  });

  afterEach(() => closeTestDb(db));

  const apply = (app, keyword, ip) => request(app)
    .post('/api/applications')
    .set('X-Forwarded-For', ip)
    .send({
      applicant_name: '测试用户',
      document_name: `质量文件 ${ip}`,
      category: 'OTHER_QUALITY_SYSTEM',
      project_code: keyword,
    });

  const addCode = (app, code) => request(app)
    .post('/api/technical-documents/quality-system-codes')
    .set('Authorization', `Bearer ${generateAdminToken()}`)
    .send({ code });

  test('从 1001 起按 4 位编号，跨关键代号连续且不影响 6 位流水号', async () => {
    expect((await addCode(app, 'qp04')).status).toBe(200);
    expect((await addCode(app, 'ms04')).status).toBe(200);
    db.prepare("INSERT INTO projects (code, name) VALUES ('ALPHA01', 'Test')").run();
    db.prepare(
      'INSERT INTO applications (applicant_name, project_code, number_type, serial_number, full_number) VALUES (?, ?, ?, ?, ?)'
    ).run('已有用户', 'ALPHA01', 'QTD', 234567, 'QTD-ALPHA01-234567');

    const first = await apply(app, undefined, '192.0.2.1');
    const second = await apply(app, 'ms04', '192.0.2.2');

    expect(first.status).toBe(200);
    expect(first.body.data).toMatchObject({
      category: 'OTHER_QUALITY_SYSTEM',
      number_type: 'QST',
      project_code: 'CM',
      serial_number: 1001,
      full_number: 'QST-CM-1001',
    });
    expect(second.status).toBe(200);
    expect(second.body.data.full_number).toBe('QST-MS04-1002');

    const common = await request(app)
      .post('/api/applications')
      .set('X-Forwarded-For', '192.0.2.3')
      .send({
        applicant_name: '测试用户',
        document_name: '产品技术文件',
        category: 'PRODUCT_TECH',
        project_code: 'ALPHA01',
      });

    expect(common.status).toBe(200);
    expect(common.body.data.full_number).toBe('QTD-ALPHA01-234568');
  });

  test('后台维护的代号出现在前台接口，未配置和格式错误的代号不可取号', async () => {
    const initial = await request(app).get('/api/technical-documents/quality-system-codes');
    expect(initial.body.data.map(item => item.code)).toEqual(['CM']);

    expect((await addCode(app, 'qp04')).body.data.code).toBe('QP04');
    const list = await request(app).get('/api/technical-documents/quality-system-codes');
    expect(list.body.data.map(item => item.code)).toEqual(['CM', 'QP04']);

    expect((await apply(app, 'UNKNOWN', '192.0.2.4')).status).toBe(400);
    expect((await apply(app, 'BAD CODE', '192.0.2.5')).status).toBe(400);
    expect(db.prepare('SELECT COUNT(*) AS count FROM applications').get().count).toBe(0);
  });

  test('只有管理员能修改代号，CM 不可修改或删除', async () => {
    const initial = await request(app).get('/api/technical-documents/quality-system-codes');
    const cmId = initial.body.data[0].id;
    expect((await request(app).post('/api/technical-documents/quality-system-codes').send({ code: 'QP04' })).status).toBe(401);
    expect((await request(app).put(`/api/technical-documents/quality-system-codes/${cmId}`).set('Authorization', `Bearer ${generateAdminToken()}`).send({ code: 'NEW' })).status).toBe(400);
    expect((await request(app).delete(`/api/technical-documents/quality-system-codes/${cmId}`).set('Authorization', `Bearer ${generateAdminToken()}`)).status).toBe(400);

    const created = await addCode(app, 'QP04');
    const id = created.body.data.id;
    expect((await request(app).put(`/api/technical-documents/quality-system-codes/${id}`).set('Authorization', `Bearer ${generateAdminToken()}`).send({ code: 'MS04' })).body.data.code).toBe('MS04');
    expect((await request(app).delete(`/api/technical-documents/quality-system-codes/${id}`).set('Authorization', `Bearer ${generateAdminToken()}`)).status).toBe(200);
    expect((await apply(app, 'MS04', '192.0.2.8')).status).toBe(400);
  });

  test('超过 9999 后自动扩充为 6 位流水号', async () => {
    expect((await addCode(app, 'QP04')).status).toBe(200);
    expect((await addCode(app, 'MS04')).status).toBe(200);
    db.prepare(
      'INSERT INTO applications (applicant_name, project_code, number_type, serial_number, full_number) VALUES (?, ?, ?, ?, ?)'
    ).run('已有用户', 'QP04', 'QST', 9998, 'QST-QP04-9998');

    const lastFourDigit = await apply(app, 'QP04', '192.0.2.5');
    const firstSixDigit = await apply(app, 'MS04', '192.0.2.6');

    expect(lastFourDigit.status).toBe(200);
    expect(lastFourDigit.body.data.full_number).toBe('QST-QP04-9999');
    expect(firstSixDigit.status).toBe(200);
    expect(firstSixDigit.body.data.serial_number).toBe(10000);
    expect(firstSixDigit.body.data.full_number).toBe('QST-MS04-010000');
  });
});
