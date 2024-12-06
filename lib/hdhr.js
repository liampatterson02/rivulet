/**
 * HDHomeRun Emulation for rivulet
 */

function getDiscoverJson(config) {
    return {
      "FriendlyName": config.friendlyName || "rivulet HDHomeRun",
      "Manufacturer": "Silicondust",
      "ModelNumber": "HDTC-2US",
      "FirmwareName": "hdhomeruntc_atsc",
      "FirmwareVersion": "20150826",
      "DeviceID": "12345678",
      "DeviceAuth": "test123",
      "BaseURL": `http://localhost:${config.serverPort}`,
      "LineupURL": `http://localhost:${config.serverPort}/hdhr/lineup.json`
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
  