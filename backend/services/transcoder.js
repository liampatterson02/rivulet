'use strict';

const { loadConfig } = require('./configService');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

function createStream(inputUrl, res) {
  const { videoCodec, audioCodec, videoBitrate, audioBitrate, scale } = loadConfig();

  // Construct ffmpeg args
  const args = [
    '-i', inputUrl,
    '-c:v', videoCodec,
    '-c:a', audioCodec,
    '-f', 'mpegts',
    '-reset_timestamps', '1'
  ];

  if (videoCodec !== 'none') {
    if (videoBitrate && videoBitrate.trim() !== '') {
      args.push('-b:v', videoBitrate);
    }
    if (audioBitrate && audioBitrate.trim() !== '') {
      args.push('-b:a', audioBitrate);
    }
    if (scale && scale.trim() !== '') {
      args.push('-vf', `scale=${scale}`);
    }
  }

  args.push('pipe:1');

  const ffmpegProcess = spawn(ffmpegPath, args);

  ffmpegProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.toLowerCase().includes('error')) {
      console.warn(`ffmpeg stderr: ${msg}`);
    }
  });

  ffmpegProcess.on('close', (code) => {
    if (code !== 0) {
      console.warn(`ffmpeg exited with code ${code}`);
    }
  });

  res.setHeader('Content-Type', 'video/mp2t');
  ffmpegProcess.stdout.pipe(res);

  return ffmpegProcess;
}

module.exports = { createStream };
