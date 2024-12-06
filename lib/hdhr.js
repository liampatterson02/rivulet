const config = require('./config');

function getDiscoverJson(cfg) {
  const host = cfg.serverHostname || 'localhost';
  const port = cfg.serverPort || 3000;
  
  return {
    "FriendlyName": cfg.friendlyName || "rivulet HDHomeRun",
    "Manufacturer": "Silicondust",
    "ModelNumber": "HDTC-2US",
    "FirmwareName": "hdhomeruntc_atsc",
    "FirmwareVersion": "20150826",
    "DeviceID": "12345678",
    "DeviceAuth": "test123",
    "BaseURL": `http://${host}:${port}`,
    "LineupURL": `http://${host}:${port}/hdhr/lineup.json`,
    "TunerCount": cfg.numTuners || 1
  };
}

function getLineupStatus() {
  return {
    ScanInProgress: 0,
    ScanPossible: 1,
    Source: "Cable",
    SourceList: ["Cable"]
  };
}

module.exports = {
  getDiscoverJson,
  getLineupStatus
};
