const express = require('express');
const router = express.Router();
const { analyzeMessage, generateReply, getBotStatus } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.post('/analyze', analyzeMessage);
router.post('/generate-reply', generateReply);
router.get('/status', getBotStatus);

module.exports = router;
