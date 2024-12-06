/**
 * Stream Proxy
 * Adjusted to return a mock segment stats array with various statuses.
 */

const { createTranscodeStream } = require('./transcoder');
const { parseM3U } = require('./m3uParser');
const config = require('./config');

let channelCache = null;
let lastFetchTime = 0;

// Mock segments: We’ll say we have 10 segments, each with a status.
let segmentStats = {
  segments: [
    { id: 1, status: 'active' },
    { id: 2, status: 'buffered' },
    { id: 3, status: 'buffered' },
    { id: 4, status: 'error' },
    { id: 5, status: 'active' },
    { id: 6, status: 'buffered' },
    { id: 7, status: 'active' },
    { id: 8, status: 'error' },
    { id: 9, status: 'buffered' },
    { id: 10, status: 'active' }
  ]
};

async function fetchChannels() {
  const now = Date.now();
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
  const desiredOrder = cfg.backupQualitySuffixes || ['FHD', 'HD', 'SD'];

  let variant = null;
  for (let q of desiredOrder) {
    variant = ch.variants.find(v => v.quality === q);
    if (variant) break;
  }

  if (!variant) {
    throw new Error('No variants found for channel ' + ch.name);
  }

  // Check if no transcoding option is selected:
  if (cfg.ffmpegOptions && cfg.ffmpegOptions.videoCodec === 'none') {
    // If no transcoding is selected, just return the original stream
    return fetchInputAsStream(variant.url);
  } else {
    // Transcode
    return createTranscodeStream(variant.url);
  }
}

// For "no transcoding" scenario, we need to just return the source as-is.
// We'll use node-fetch and pipe it directly.
const fetch = require('node-fetch');
const { PassThrough } = require('stream');
async function fetchInputAsStream(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch source stream');
  const pass = new PassThrough();
  response.body.pipe(pass);
  return pass;
}

function getSegmentStats() {
  return segmentStats;
}

module.exports = {
  getChannelList,
  getTranscodedStream,
  getSegmentStats
};
