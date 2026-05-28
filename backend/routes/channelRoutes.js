const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

router.get('/status', channelController.getStatus);
router.post('/:channelKey/test', channelController.testChannel);

module.exports = router;
