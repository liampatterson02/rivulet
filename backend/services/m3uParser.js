'use strict';

const fetch = require('node-fetch');
const { loadConfig } = require('./configService');
const { sortChannelsBySuffixes } = require('./suffixService');

let cachedChannels = [];

function parseM3U(m3uContent) {
  const lines = m3uContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const channels = [];
  let channelInfo = null;
  let channelNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#EXTINF')) {
      const nameMatch = line.match(/,(.*)$/);
      const name = nameMatch ? nameMatch[1].trim() : `Channel ${channelNumber}`;
      channelInfo = { name, variants: [], number: channelNumber };
      channelNumber++;
    } else if (channelInfo && (line.startsWith('http://') || line.startsWith('https://'))) {
      channelInfo.variants.push({ url: line });
      channels.push(channelInfo);
      channelInfo = null;
    }
  }

  return channels;
}

function fetchAndParseM3U() {
  const { m3uUrl, serverHostname, serverPort, suffixes } = loadConfig();
  if (!m3uUrl) {
    console.warn('No m3uUrl configured, returning empty channel list.');
    cachedChannels = [];
    return;
  }
  fetch(m3uUrl)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch M3U playlist.');
      return res.text();
    })
    .then(body => {
      let parsed = parseM3U(body);

      // Sort variants using suffixes
      parsed.forEach(ch => {
        ch.variants = sortChannelsBySuffixes(ch.variants, suffixes || []);
      });

      cachedChannels = parsed.map((ch, idx) => ({
        ...ch,
        id: idx,
        serverHostname,
        serverPort
      }));
      if (cachedChannels.length === 0) {
        console.warn('No channels found in M3U playlist.');
      }
    })
    .catch(err => {
      console.warn(`Error fetching M3U: ${err.message}`);
      cachedChannels = [];
    });
}

function getParsedChannels() {
  return cachedChannels;
}

// On startup
fetchAndParseM3U();

module.exports = { getParsedChannels, fetchAndParseM3U };
