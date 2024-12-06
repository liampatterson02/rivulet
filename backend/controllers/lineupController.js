'use strict';

const { loadConfig } = require('../services/configService');
const { getParsedChannels } = require('../services/m3uParser');

exports.getLineup = (req, res) => {
  const channels = getParsedChannels();
  const { serverHostname, serverPort } = loadConfig();
  const lineup = channels.map(ch => ({
    GuideNumber: ch.number.toString(),
    GuideName: ch.name,
    URL: `http://${serverHostname}:${serverPort}/stream/${ch.id}`
  }));
  res.json(lineup);
};

exports.getLineupStatus = (req, res) => {
  res.json({ ScanInProgress: false, ScanPossible: true, Source: "Cable", SourceList: ["Cable"] });
};
