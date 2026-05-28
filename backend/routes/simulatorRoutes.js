const express = require('express');
const router = express.Router();
const { simulateMessage } = require('../controllers/simulatorController');
const auth = require('../middleware/authMiddleware');

router.post('/message', auth, simulateMessage);

module.exports = router;
