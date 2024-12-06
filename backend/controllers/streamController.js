'use strict';

const { getParsedChannels } = require('../services/m3uParser');
const { loadConfig } = require('../services/configService');
const { createStream } = require('../services/transcoder');
const fetch = require('node-fetch');

exports.getStream = async (req, res) => {
  const channelId = parseInt(req.params.channelId, 10);
  const channels = getParsedChannels();
  const channel = channels.find(c => c.id === channelId);

  if (!channel) {
    console.warn(`Requested channelId ${channelId} not found.`);
    return res.status(404).send('Channel not found');
  }

  // For simplicity, always take the first variant if no suffix logic needed
  // If suffix logic is needed, it's handled in getParsedChannels sorting
  const sourceUrl = channel.variants[0].url;

  const { videoCodec } = loadConfig();

  if (videoCodec === 'none') {
    // Direct stream
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        console.warn(`Source stream error for channel ${channel.name}: ${response.statusText}`);
        return res.status(500).send('Stream source error');
      }

      res.setHeader('Content-Type', 'video/mp2t');
      response.body.pipe(res);
    } catch (err) {
      console.warn(`Error piping direct stream: ${err.message}`);
      res.status(500).send('Stream error');
    }
  } else {
    // Transcode
    const ffmpegProcess = createStream(sourceUrl, res);
    ffmpegProcess.on('error', (err) => {
      console.warn(`ffmpeg error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).send('Transcode error');
      }
    });
  }
};
