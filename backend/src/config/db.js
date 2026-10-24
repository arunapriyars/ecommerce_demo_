const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'vibecart.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Clean SQLite wrapper that matches modern database operations
 */
const dbWrapper = {
  raw: db,

  query(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      return stmt.all(...params);
    } catch (err) {
      console.error('Database query error:', err.message, { sql, params });
      throw err;
    }
  },

  get(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      return stmt.get(...params);
    } catch (err) {
      console.error('Database get error:', err.message, { sql, params });
      throw err;
    }
  },

  run(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      return stmt.run(...params);
    } catch (err) {
      console.error('Database run error:', err.message, { sql, params });
      throw err;
    }
  },

  exec(sql) {
    try {
      return db.exec(sql);
    } catch (err) {
      console.error('Database exec error:', err.message, { sql });
      throw err;
    }
  },

  transaction(fn) {
    db.exec('BEGIN TRANSACTION;');
    try {
      const result = fn();
      db.exec('COMMIT;');
      return result;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
};

module.exports = dbWrapper;
