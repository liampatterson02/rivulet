'use strict';

const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');

router.get('/stream/:channelId', streamController.getStream);

module.exports = router;
