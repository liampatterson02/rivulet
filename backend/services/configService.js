'use strict';

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db', 'config.db');
let db;

function initDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }

  db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as cnt FROM config').get().cnt;
  if (count === 0) {
    const defaults = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'config.example.json'), 'utf-8'));
    const insert = db.prepare('INSERT INTO config (key, value) VALUES (@key, @value)');
    const insertMany = db.transaction((items) => {
      for (const [key, value] of Object.entries(items)) {
        insert.run({ key, value: JSON.stringify(value) });
      }
    });
    insertMany(defaults);
  }
}

function loadConfig() {
  if (!db) initDB();
  const rows = db.prepare('SELECT key, value FROM config').all();
  const config = {};
  for (const row of rows) {
    try {
      config[row.key] = JSON.parse(row.value);
    } catch (e) {
      console.warn(`Failed to parse config for key ${row.key}: ${e.message}`);
    }
  }
  return config;
}

function saveConfig(newConfig) {
  if (!db) initDB();

  const update = db.prepare('INSERT INTO config (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value=@value');
  const updateMany = db.transaction((items) => {
    for (const [key, value] of Object.entries(items)) {
      update.run({ key, value: JSON.stringify(value) });
    }
  });
  updateMany(newConfig);
}

module.exports = { loadConfig, saveConfig };
