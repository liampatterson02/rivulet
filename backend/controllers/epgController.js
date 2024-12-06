'use strict';

const { getParsedChannels } = require('../services/m3uParser');
const { generateEPG } = require('../services/epgService');

exports.getEPG = (req, res) => {
  const channels = getParsedChannels();
  const epg = generateEPG(channels);
  // Return JSON EPG (simple format)
  res.json(epg);
};
