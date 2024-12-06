/**
 * Simple EPG Generator
 * Channels are listed with their base name (no suffix).
 */

function getEPG(channels) {
    const now = Date.now();
    return channels.map(ch => {
      return {
        channel: ch.name,
        programs: [
          {
            title: ch.name,
            start: new Date(now - 3600000).toISOString(),
            end: new Date(now + 3600000).toISOString(),
            description: `24/7 programming of ${ch.name}`,
            category: "General"
          }
        ]
      };
    });
  }
  
  module.exports = {
    getEPG
  };
  