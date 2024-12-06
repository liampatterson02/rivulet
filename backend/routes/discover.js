'use strict';

const express = require('express');
const router = express.Router();
const discoverController = require('../controllers/discoverController');

router.get('/discover.json', discoverController.getDiscover);

module.exports = router;
