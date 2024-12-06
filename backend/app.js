'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { loadConfig } = require('./services/configService');

const discoverRouter = require('./routes/discover');
const lineupRouter = require('./routes/lineup');
const streamRouter = require('./routes/stream');
const configRouter = require('./routes/config');
const epgRouter = require('./routes/epg');

// Load config
const { serverPort, serverHostname } = loadConfig();

// Basic validation
if (!serverPort || !serverHostname) {
  console.error('ERROR: serverPort or serverHostname missing from configuration. Exiting.');
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

// Serve React UI (after build:ui is run, public/ is populated)
app.use(express.static(path.join(__dirname, 'public')));

// HDHomeRun endpoints
app.use('/', discoverRouter);
app.use('/', lineupRouter);
app.use('/', epgRouter);

// Stream endpoint
app.use('/', streamRouter);

// Config endpoint for UI
app.use('/api/config', configRouter);

// If no route matched, serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(serverPort, serverHostname, () => {
  console.log(`Server running at http://${serverHostname}:${serverPort}`);
});
