const express = require('express');
const router = express.Router();
const {
    getConversations,
    getConversationById,
    updateConversationStatus,
    assignConversation,
    toggleBot,
    toggleAi,
    deleteConversation
} = require('../controllers/conversationController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.put('/:id/status', updateConversationStatus);
router.put('/:id/assign', assignConversation);
router.put('/:id/bot', toggleBot);
router.put('/:id/toggle-ai', toggleAi);
router.delete('/:id', deleteConversation);

module.exports = router;
