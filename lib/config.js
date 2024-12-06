//**
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'config.db');
const DEFAULT_CONFIG_FILE = path.join(__dirname, '..', 'config.json');
const EXAMPLE_CONFIG_FILE = path.join(__dirname, '..', 'config.example.json');

let cachedConfig = null;

// Initialize the database and load configuration synchronously
function initConfig() {
 let initialConfig;
 if (!fs.existsSync(DB_PATH)) {
   // Create DB
   const db = new sqlite3.Database(DB_PATH);
   db.serialize(() => {
     db.run("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)");
   });
   db.close();

   // Load defaults from config.json if available, else from config.example.json
   if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
     initialConfig = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8'));
   } else {
     initialConfig = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG_FILE, 'utf8'));
   }

   // Save initialConfig to DB
   saveAllToDB(initialConfig);
   cachedConfig = initialConfig;
 } else {
   // Load from DB
   cachedConfig = loadAllFromDB();
 }

 // Ensure serverPort exists
 if (!cachedConfig.serverPort) {
   console.error("Error: serverPort not found in configuration.");
   process.exit(1);
 }
}

function loadAllFromDB() {
 const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);
 let configObj = {};
 const rows = db.prepare("SELECT key, value FROM config").all();
 rows.forEach(row => {
   let val;
   try {
     val = JSON.parse(row.value);
   } catch (e) {
     val = row.value;
   }
   configObj[row.key] = val;
 });
 db.close();
 return configObj;
}

function saveAllToDB(obj) {
 const db = new sqlite3.Database(DB_PATH);
 db.serialize(() => {
   const stmt = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?,?)");
   for (let k in obj) {
     stmt.run(k, JSON.stringify(obj[k]));
   }
   stmt.finalize();
 });
 db.close();
}

// Set all config values at runtime
function setAll(obj) {
 saveAllToDB(obj);
 cachedConfig = obj;
}

// Get a single config value
function get(key) {
 return cachedConfig[key];
}

// Get all config
function getAll() {
 return cachedConfig;
}

initConfig();

module.exports = {
 get,
 getAll,
 setAll
};
