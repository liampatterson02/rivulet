'use strict';

const { loadConfig } = require('../services/configService');

exports.getDiscover = (req, res) => {
  const { serverPort, serverHostname, friendlyName, numTuners } = loadConfig();

  const discoverData = {
    FriendlyName: friendlyName || "Rivulet HDHR Emulator",
    Manufacturer: "Silicondust",
    ModelNumber: "HDTC-2US",
    FirmwareName: "hdhomeruntc_atsc",
    TunerCount: numTuners || 1,
    FirmwareVersion: "20201021",
    DeviceID: "12345678",
    DeviceAuth: "test1234",
    BaseURL: `http://${serverHostname}:${serverPort}`,
    LineupURL: `http://${serverHostname}:${serverPort}/lineup.json`
  };

  res.json(discoverData);
};
