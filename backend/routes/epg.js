'use strict';

const express = require('express');
const router = express.Router();
const epgController = require('../controllers/epgController');

router.get('/epg.json', epgController.getEPG);

module.exports = router;
