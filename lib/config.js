/**
 * Configuration Manager (Synchronous)
 *
 * Uses better-sqlite3 for synchronous database operations.
 * This ensures that by the time server.js runs, we have a fully loaded config.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'config.db');
const DEFAULT_CONFIG_FILE = path.join(__dirname, '..', 'config.json');
const EXAMPLE_CONFIG_FILE = path.join(__dirname, '..', 'config.example.json');

let cachedConfig = null;

function initConfig() {
  let initialConfig;
  // Check if db exists
  const dbExists = fs.existsSync(DB_PATH);
  const db = new Database(DB_PATH);

  if (!dbExists) {
    // Create table
    db.prepare("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)").run();
    // Load defaults
    if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
      initialConfig = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8'));
    } else {
      initialConfig = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG_FILE, 'utf8'));
    }
    saveAllToDB(db, initialConfig);
    cachedConfig = initialConfig;
  } else {
    // Load from DB
    cachedConfig = loadAllFromDB(db);
  }

  // Ensure serverPort exists
  if (!cachedConfig.serverPort) {
    console.error("Error: serverPort not found in configuration.");
    process.exit(1);
  }

  db.close();
}

function loadAllFromDB(db) {
  const rows = db.prepare("SELECT key, value FROM config").all();
  const configObj = {};
  for (const row of rows) {
    let val;
    try {
      val = JSON.parse(row.value);
    } catch (e) {
      val = row.value;
    }
    configObj[row.key] = val;
  }
  return configObj;
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

initConfig();

module.exports = {
  get,
  getAll,
  setAll
};
