function initializeFixtureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS fixture_kinds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_code TEXT NOT NULL CHECK(type_code IN ('FT', 'AM', 'TL')),
      project_code TEXT NOT NULL,
      kind_serial INTEGER NOT NULL CHECK(kind_serial BETWEEN 1 AND 999),
      base_number TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL DEFAULT '',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type_code, project_code, kind_serial)
    );

    CREATE TABLE IF NOT EXISTS fixture_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind_id INTEGER NOT NULL REFERENCES fixture_kinds(id),
      quantity_serial INTEGER CHECK(quantity_serial BETWEEN 1 AND 999),
      full_number TEXT NOT NULL UNIQUE,
      applicant_name TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(kind_id, quantity_serial)
    );

    CREATE TABLE IF NOT EXISTS fixture_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind_id INTEGER NOT NULL REFERENCES fixture_kinds(id),
      applicant_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 999),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_fixture_numbers_kind ON fixture_numbers(kind_id);
  `);

  const columns = db.prepare('PRAGMA table_info(fixture_numbers)').all();
  if (!columns.some(column => column.name === 'request_id')) {
    db.exec('ALTER TABLE fixture_numbers ADD COLUMN request_id INTEGER REFERENCES fixture_requests(id)');
  }

  // 旧版没有申请批次。保留每个已发放编号，并将其各计为一次历史申请。
  const legacyNumbers = db.prepare('SELECT id, kind_id, applicant_name, created_at FROM fixture_numbers WHERE request_id IS NULL').all();
  if (legacyNumbers.length > 0) {
    const insertRequest = db.prepare('INSERT INTO fixture_requests (kind_id, applicant_name, quantity, created_at) VALUES (?, ?, 1, ?)');
    const linkNumber = db.prepare('UPDATE fixture_numbers SET request_id = ? WHERE id = ?');
    db.transaction(() => {
      for (const number of legacyNumbers) {
        const request = insertRequest.run(number.kind_id, number.applicant_name, number.created_at);
        linkNumber.run(request.lastInsertRowid, number.id);
      }
    }).immediate();
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_fixture_numbers_request ON fixture_numbers(request_id);
    CREATE INDEX IF NOT EXISTS idx_fixture_requests_created ON fixture_requests(created_at);
  `);
}

module.exports = { initializeFixtureSchema };
