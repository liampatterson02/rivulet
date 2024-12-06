'use strict';

const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/', configController.getConfig);
router.post('/', configController.saveConfig);

module.exports = router;
