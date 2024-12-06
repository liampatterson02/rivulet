'use strict';

const express = require('express');
const router = express.Router();
const lineupController = require('../controllers/lineupController');

router.get('/lineup.json', lineupController.getLineup);
router.get('/lineup_status.json', lineupController.getLineupStatus);

module.exports = router;
