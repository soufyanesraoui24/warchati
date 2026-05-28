const express = require('express');
const router = express.Router();
const {
    getOverview,
    getMessagesByDay,
    getTopIntents,
    getHandoffRate
} = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);
router.use(role('admin'));

router.get('/overview', getOverview);
router.get('/messages-by-day', getMessagesByDay);
router.get('/top-intents', getTopIntents);
router.get('/handoff-rate', getHandoffRate);

module.exports = router;
