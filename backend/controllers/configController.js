'use strict';

const { loadConfig, saveConfig } = require('../services/configService');
const { fetchAndParseM3U } = require('../services/m3uParser');

exports.getConfig = (req, res) => {
  const conf = loadConfig();
  res.json(conf);
};

exports.saveConfig = (req, res) => {
  const newConfig = req.body;
  // Basic validation if needed
  saveConfig(newConfig);
  // Re-parse M3U if changed
  fetchAndParseM3U();
  res.json({ success: true });
};
