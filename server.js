/**
 * Main server entry point
 * - Sets up Express server
 * - Serves React frontend
 * - Provides HDHomeRun endpoints
 * - Provides API endpoints for configuration, channel listing, streaming
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./lib/config');
const hdhr = require('./lib/hdhr');
const epg = require('./lib/epg');
const streamProxy = require('./lib/streamProxy');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from React build (after running build:ui)
app.use(express.static(path.join(__dirname, 'public')));

// HDHomeRun discovery endpoints
app.get('/hdhr/discover.json', (req, res) => {
  // config.getAll() returns a cached config object, no need to await here
  const cfg = config.getAll();
  res.json(hdhr.getDiscoverJson(cfg));
});

app.get('/hdhr/lineup_status.json', (req, res) => {
  res.json(hdhr.getLineupStatus());
});

app.get('/hdhr/lineup.json', async (req, res) => {
  const channels = await streamProxy.getChannelList();
  const cfg = config.getAll();
  const lineup = channels.map((ch) => ({
    GuideNumber: ch.number.toString(),
    GuideName: ch.name,
    URL: `http://${req.hostname}:${cfg.serverPort}/stream/${encodeURIComponent(ch.name)}`
  }));
  res.json(lineup);
});

// Streaming endpoint
app.get('/stream/:channelName', async (req, res) => {
  const channelName = decodeURIComponent(req.params.channelName);
  try {
    const stream = await streamProxy.getTranscodedStream(channelName);
    res.writeHead(200, {'Content-Type': 'video/mp2t'});
    stream.pipe(res);
    stream.on('error', (err) => {
      console.error('Transcode stream error:', err);
      res.end();
    });
  } catch (err) {
    console.error('Error getting transcoded stream:', err);
    res.status(500).send('Stream error');
  }
});

// API endpoints for configuration and control
app.get('/api/config', (req, res) => {
  res.json(config.getAll());
});

app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  config.setAll(newConfig).then(() => {
    res.json({status: 'ok'});
  }).catch(e => {
    console.error(e);
    res.status(500).json({error: e.message});
  });
});

app.get('/api/channels', async (req, res) => {
  const channels = await streamProxy.getChannelList();
  res.json(channels);
});

app.get('/api/segments', (req, res) => {
  res.json(streamProxy.getSegmentStats());
});

app.get('/api/epg', async (req, res) => {
  const channels = await streamProxy.getChannelList();
  const listings = epg.getEPG(channels);
  res.json(listings);
});

// Catch-all to serve the React UI
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Instead of calling app.listen directly with config.get('serverPort'), we now wait for the promise
config.get('serverPort').then(port => {
  app.listen(port, () => {
    console.log(`rivulet server listening on port ${port}`);
  });
}).catch(err => {
  console.error('Error retrieving server port from config:', err);
});
