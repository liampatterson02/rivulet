/**
 * Transcoder
 * Uses ffmpeg to transcode streams.
 */

const { spawn } = require('child_process');
const config = require('./config');

function createTranscodeStream(inputUrl) {
  const ffCfg = config.getAll().ffmpegOptions;
  const args = [
    '-i', inputUrl,
    '-c:v', ffCfg.videoCodec || 'libx264',
    '-b:v', ffCfg.videoBitrate || '2000k',
    '-c:a', ffCfg.audioCodec || 'aac',
    '-b:a', ffCfg.audioBitrate || '128k',
    '-f', 'mpegts'
  ];
  if (ffCfg.scale) {
    args.push('-vf', `scale=${ffCfg.scale}`);
  }
  if (Array.isArray(ffCfg.additionalParams)) {
    args.push(...ffCfg.additionalParams);
  }
  args.push('pipe:1');

  const ffmpeg = spawn('ffmpeg', args);
  ffmpeg.stderr.on('data', data => {
    // Debug FFmpeg output if needed
    // console.error('FFmpeg:', data.toString());
  });
  return ffmpeg.stdout;
}

module.exports = {
  createTranscodeStream
};
