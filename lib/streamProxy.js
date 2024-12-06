/**
 * Stream Proxy
 * Fetches channels from M3U, merges backups into single channels without suffixes for display.
 * Handles selecting variants and transcoding.
 */

const { createTranscodeStream } = require('./transcoder');
const { parseM3U } = require('./m3uParser');
const config = require('./config');

let channelCache = null;
let lastFetchTime = 0;
let segmentStats = {
  downloaded: 0,
  sent: 0,
  errors: 0
};

async function fetchChannels() {
  const now = Date.now();
  // Refresh channel list every 5 min
  if (channelCache && (now - lastFetchTime < 300000)) {
    return channelCache;
  }
  const cfg = config.getAll();
  const channels = await parseM3U(cfg.m3uUrl, cfg.backupQualitySuffixes);
  channelCache = channels;
  lastFetchTime = now;
  return channels;
}

async function getChannelList() {
  return await fetchChannels();
}

async function getTranscodedStream(channelName) {
  const channels = await getChannelList();
  const cfg = config.getAll();

  const ch = channels.find(c => c.name === channelName);
  if (!ch) throw new Error('Channel not found: ' + channelName);

  return chooseVariantAndTranscode(ch, channelName);
}

function chooseVariantAndTranscode(ch) {
  const cfg = config.getAll();
  const desiredOrder = cfg.backupQualitySuffixes || ['FHD','HD','SD'];

  // Pick first available variant in desired order
  let variant = null;
  for (let q of desiredOrder) {
    variant = ch.variants.find(v => v.quality === q);
    if (variant) break;
  }
  if (!variant) {
    // no variants found? broken channel
    throw new Error('No variants found for channel ' + ch.name);
  }

  // Return ffmpeg transcoded stream
  return createTranscodeStream(variant.url);
}

function getSegmentStats() {
  return segmentStats;
}

module.exports = {
  getChannelList,
  getTranscodedStream,
  getSegmentStats
};
