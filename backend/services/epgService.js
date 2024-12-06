'use strict';

function generateEPG(channels) {
  // Simple static EPG: each channel has a single program named by channel
  // running 24/7.
  // Example structure:
  // {
  //   "channels": [
  //     { "id": <id>, "name": <name> }
  //   ],
  //   "programs": [
  //     { "channelId": <id>, "title": <name>, "start": <timestamp>, "end": <timestamp> }
  //   ]
  // }

  const now = Date.now();
  const oneDayLater = now + 24*3600*1000;
  return {
    channels: channels.map(c => ({ id: c.id, name: c.name })),
    programs: channels.map(c => ({
      channelId: c.id,
      title: c.name,
      start: now,
      end: oneDayLater
    }))
  };
}

module.exports = { generateEPG };
