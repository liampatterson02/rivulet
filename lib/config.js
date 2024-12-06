/**
 * Configuration Manager (Synchronous)
 *
 * Uses better-sqlite3 for synchronous database operations.
 * Ensures that the 'config' table exists at startup.
 * If the 'config' table is empty, loads from config.json or config.example.json.
 * If 'config.db' doesn't exist or is empty, defaults are loaded.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'config.db');
const DEFAULT_CONFIG_FILE = path.join(__dirname, '..', 'config.json');
const EXAMPLE_CONFIG_FILE = path.join(__dirname, '..', 'config.example.json');

let cachedConfig = null;

function initConfig() {
  const db = new Database(DB_PATH);

  // Ensure the config table exists, regardless of whether db was newly created or existing
  db.prepare("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)").run();

  // Attempt to load config from DB
  const rows = db.prepare("SELECT key, value FROM config").all();
  if (rows.length === 0) {
    // No config in DB, load defaults from config.json or example
    let initialConfig;
    if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
      initialConfig = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8'));
    } else {
      initialConfig = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG_FILE, 'utf8'));
    }
    saveAllToDB(db, initialConfig);
    cachedConfig = initialConfig;
  } else {
    // We have rows, load them into cachedConfig
    cachedConfig = {};
    for (const row of rows) {
      let val;
      try {
        val = JSON.parse(row.value);
      } catch (e) {
        val = row.value;
      }
      cachedConfig[row.key] = val;
    }
  }

  // Ensure serverPort exists
  if (!cachedConfig.serverPort) {
    console.error("Error: serverPort not found in configuration.");
    process.exit(1);
  }

  db.close();
}

function saveAllToDB(db, obj) {
  const insert = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (@key, @value)");
  const transaction = db.transaction((items) => {
    for (const key in items) {
      insert.run({ key, value: JSON.stringify(items[key]) });
    }
  });
  transaction(obj);
}

function setAll(obj) {
  const db = new Database(DB_PATH);
  saveAllToDB(db, obj);
  db.close();
  cachedConfig = obj;
}

function get(key) {
  return cachedConfig[key];
}

function getAll() {
  return cachedConfig;
}

// Initialize config at module load
initConfig();

module.exports = {
  get,
  getAll,
  setAll
};
