const TYPES = new Set(['FT', 'AM', 'TL']);

class FixtureInputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function normalizeProject(value) {
  const firstSegment = typeof value === 'string' ? value.trim().toUpperCase().split('-')[0] : '';
  if (!/^[A-Z0-9]+$/.test(firstSegment)) {
    throw new FixtureInputError('请选择有效的项目代号');
  }
  return firstSegment;
}

function formatSerial(value) {
  return String(value).padStart(2, '0');
}

function listKinds(db, search = '') {
  const keyword = typeof search === 'string' ? search.trim().toUpperCase().slice(0, 60) : '';
  return db.prepare(`
    SELECT k.id, k.type_code, k.project_code, k.kind_serial, k.base_number, k.label, k.created_at,
      COALESCE((SELECT MAX(n.quantity_serial) FROM fixture_numbers n WHERE n.kind_id = k.id), 0) AS max_quantity_serial,
      (SELECT COUNT(*) FROM fixture_numbers n WHERE n.kind_id = k.id) AS issued_count,
      (SELECT COUNT(*) FROM fixture_requests r WHERE r.kind_id = k.id) AS request_count
    FROM fixture_kinds k
    WHERE ? = '' OR k.base_number LIKE ? OR UPPER(k.label) LIKE ?
    ORDER BY k.id DESC LIMIT 100
  `).all(keyword, `%${keyword}%`, `%${keyword}%`);
}

function issueNumbers(db, input) {
  const applicant = typeof input.applicant_name === 'string' ? input.applicant_name.trim() : '';
  if (!applicant || applicant.length > 100) throw new FixtureInputError('请填写 1–100 字的申请人姓名');

  const quantity = input.quantity;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    throw new FixtureInputError('申请数量须为 1–999');
  }
  if (input.mode !== 'new' && input.mode !== 'existing' && input.mode !== 'replica') {
    throw new FixtureInputError('请选择全新种类、复刻种类或已有种类');
  }

  let typeCode;
  let projectCode;
  let label = '';
  let existingBase = '';
  let includeQuantity = true;
  if (input.mode === 'new') {
    typeCode = typeof input.type_code === 'string' ? input.type_code.trim().toUpperCase() : '';
    if (!TYPES.has(typeCode)) throw new FixtureInputError('类型代码须为 FT、AM 或 TL');
    const selectedProject = typeof input.project_code === 'string' ? input.project_code.trim() : '';
    if (input.omit_type_separator === true && selectedProject) {
      throw new FixtureInputError('特殊类别不需要选择项目代号');
    }
    projectCode = input.omit_type_separator === true ? '' : normalizeProject(input.project_code);
    label = typeof input.label === 'string' ? input.label.trim() : '';
    if (label.length > 100) throw new FixtureInputError('种类名称不能超过 100 字');
    if (input.include_quantity === false) {
      if (quantity !== 1) throw new FixtureInputError('多套工装必须启用数量流水号');
      includeQuantity = false;
    }
  }
  if (input.mode === 'replica' && input.include_quantity === false) {
    throw new FixtureInputError('复刻种类必须启用数量流水号');
  }
  if (input.mode !== 'new') {
    existingBase = typeof input.base_number === 'string' ? input.base_number.trim().toUpperCase() : '';
    if (!/^(FT|AM|TL)(?:-?[A-Z0-9]+)?-\d{2,3}$/.test(existingBase)) {
      throw new FixtureInputError('请输入系统内已有的种类编号，如 FT-CM-01 或 TL-02');
    }
  }

  return db.transaction(() => {
    let kind;
    if (input.mode === 'new') {
      const row = db.prepare(`
        SELECT MAX(kind_serial) AS maximum FROM fixture_kinds
        WHERE type_code = ? AND project_code = ?
      `).get(typeCode, projectCode);
      const next = (row.maximum || 0) + 1;
      if (next > 999) throw new FixtureInputError('该类型与项目的种类流水号已用完', 409);
      const prefix = projectCode ? `${typeCode}-${projectCode}` : typeCode;
      const baseNumber = `${prefix}-${formatSerial(next)}`;
      const result = db.prepare(`
        INSERT INTO fixture_kinds (type_code, project_code, kind_serial, base_number, label)
        VALUES (?, ?, ?, ?, ?)
      `).run(typeCode, projectCode, next, baseNumber, label);
      kind = { id: Number(result.lastInsertRowid), base_number: baseNumber, type_code: typeCode, project_code: projectCode, kind_serial: next, label };
    } else {
      kind = db.prepare('SELECT * FROM fixture_kinds WHERE base_number = ?').get(existingBase);
      if (!kind) {
        const message = input.mode === 'replica'
          ? '未查询到匹配的种类编号，请从“全新种类”界面取号'
          : '该种类编号不在系统中，请先申请全新种类';
        throw new FixtureInputError(message, 404);
      }
    }

    const maxRow = db.prepare('SELECT MAX(quantity_serial) AS maximum FROM fixture_numbers WHERE kind_id = ?').get(kind.id);
    const first = (maxRow.maximum || 0) + 1;
    if (includeQuantity && first + quantity - 1 > 999) {
      throw new FixtureInputError('该种类的数量流水号已用完', 409);
    }
    const request = db.prepare('INSERT INTO fixture_requests (kind_id, applicant_name, quantity) VALUES (?, ?, ?)')
      .run(kind.id, applicant, quantity);
    const requestId = Number(request.lastInsertRowid);
    const insert = db.prepare('INSERT INTO fixture_numbers (kind_id, request_id, quantity_serial, full_number, applicant_name) VALUES (?, ?, ?, ?, ?)');
    const numbers = [];
    for (let offset = 0; offset < quantity; offset += 1) {
      const serial = includeQuantity ? first + offset : null;
      const fullNumber = serial === null ? kind.base_number : `${kind.base_number}-${formatSerial(serial)}`;
      insert.run(kind.id, requestId, serial, fullNumber, applicant);
      numbers.push(fullNumber);
    }
    return { request_id: requestId, base_number: kind.base_number, numbers, label: kind.label };
  }).immediate();
}

function listRequests(db, query = {}) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new FixtureInputError('分页参数无效');
  }

  const clauses = [];
  const params = [];
  if (query.month) {
    if (typeof query.month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(query.month)) {
      throw new FixtureInputError('月份格式须为 YYYY-MM');
    }
    clauses.push("strftime('%Y-%m', r.created_at) = ?");
    params.push(query.month);
  }
  if (query.type_code) {
    const typeCode = String(query.type_code).toUpperCase();
    if (!TYPES.has(typeCode)) throw new FixtureInputError('类型代码须为 FT、AM 或 TL');
    clauses.push('k.type_code = ?');
    params.push(typeCode);
  }
  if (query.search) {
    const keyword = String(query.search).trim().slice(0, 60);
    clauses.push('(r.applicant_name LIKE ? OR k.base_number LIKE ? OR k.project_code LIKE ? OR k.label LIKE ?)');
    params.push(...Array(4).fill(`%${keyword}%`));
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const from = `FROM fixture_requests r JOIN fixture_kinds k ON k.id = r.kind_id ${where}`;
  const total = db.prepare(`SELECT COUNT(*) AS count ${from}`).get(...params).count;
  const rows = db.prepare(`
    SELECT r.id, r.applicant_name, r.quantity, r.created_at,
      k.type_code, k.project_code, k.base_number, k.label,
      (SELECT GROUP_CONCAT(full_number, char(10)) FROM
        (SELECT full_number FROM fixture_numbers WHERE request_id = r.id ORDER BY id)) AS numbers_text
    ${from}
    ORDER BY r.id DESC LIMIT ? OFFSET ?
  `).all(...params, limit, (page - 1) * limit);
  return {
    data: rows.map(({ numbers_text, ...row }) => ({ ...row, numbers: numbers_text ? numbers_text.split('\n') : [] })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

function getRequestStats(db) {
  return db.prepare(`
    SELECT strftime('%Y-%m', r.created_at) AS month, k.type_code,
      COUNT(*) AS applications, SUM(r.quantity) AS numbers
    FROM fixture_requests r JOIN fixture_kinds k ON k.id = r.kind_id
    GROUP BY month, k.type_code ORDER BY month ASC
  `).all();
}

function exportRequestsCSV(db) {
  const rows = db.prepare(`
    SELECT r.id, r.applicant_name, r.quantity, r.created_at,
      k.type_code, k.project_code, k.base_number, k.label,
      (SELECT GROUP_CONCAT(full_number, '; ') FROM
        (SELECT full_number FROM fixture_numbers WHERE request_id = r.id ORDER BY id)) AS numbers_text
    FROM fixture_requests r JOIN fixture_kinds k ON k.id = r.kind_id
    ORDER BY r.id DESC
  `).all();
  const headers = ['申请ID', '申请人', '类型代码', '项目代号', '种类编号', '种类名称', '申请数量', '发放编号', '申请时间'];
  const escapeCell = value => {
    const text = String(value ?? '');
    // 避免 Excel 将用户输入的申请人或种类名称作为公式执行。
    const safe = /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return '\uFEFF' + [headers, ...rows.map(row => [
    row.id, row.applicant_name, row.type_code, row.project_code, row.base_number,
    row.label, row.quantity, row.numbers_text || '', row.created_at,
  ])].map(row => row.map(escapeCell).join(',')).join('\n');
}

module.exports = { FixtureInputError, listKinds, issueNumbers, listRequests, getRequestStats, exportRequestsCSV };
