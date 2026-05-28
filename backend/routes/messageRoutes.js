const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, sendSuggestedReply } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { messageSchema } = require('../utils/validators');

router.use(auth);

router.get('/:id/messages', getMessages);
router.post('/:id/messages', validate(messageSchema), sendMessage);
router.post('/:id/send-suggested', sendSuggestedReply);

module.exports = router;
