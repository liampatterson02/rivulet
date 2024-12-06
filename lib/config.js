/**
 * Configuration Manager
 * Stores config in sqlite DB, with fallback to default config.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'config.db');
const DEFAULT_CONFIG_FILE = path.join(__dirname, '..', 'config.json');
const EXAMPLE_CONFIG_FILE = path.join(__dirname, '..', 'config.example.json');

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    const db = new sqlite3.Database(DB_PATH);
    db.serialize(() => {
      db.run("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)");
    });
    db.close();

    let defaultConfig;
    if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
      defaultConfig = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8'));
    } else {
      defaultConfig = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG_FILE, 'utf8'));
    }
    setAll(defaultConfig);
  }
}

ensureDB();

function getAll() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    db.all("SELECT key, value FROM config", [], (err, rows) => {
      if (err) {
        db.close();
        return reject(err);
      }
      const configObj = {};
      rows.forEach((row) => {
        let val;
        try {
          val = JSON.parse(row.value);
        } catch (e) {
          val = row.value;
        }
        configObj[row.key] = val;
      });
      db.close();
      resolve(configObj);
    });
  });
}

let cachedConfig = null;

async function loadAll() {
  if (!cachedConfig) {
    cachedConfig = await getAll();
  }
  return cachedConfig;
}

function get(key) {
  return loadAll().then(cfg => cfg[key]);
}

function set(key, value) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    db.run("INSERT OR REPLACE INTO config (key, value) VALUES (?,?)", [key, JSON.stringify(value)], function(err) {
      db.close();
      if (err) return reject(err);
      cachedConfig[key] = value;
      resolve();
    });
  });
}

function setAll(obj) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    db.serialize(() => {
      const stmt = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?,?)");
      for (let k in obj) {
        stmt.run(k, JSON.stringify(obj[k]));
      }
      stmt.finalize((err) => {
        db.close();
        if (err) return reject(err);
        cachedConfig = obj;
        resolve();
      });
    });
  });
}

(async () => {
  await loadAll();
})();

module.exports = {
  get,
  set,
  getAll: () => cachedConfig,
  setAll
};
