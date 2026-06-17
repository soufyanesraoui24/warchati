const express = require('express');
const router = express.Router();
const {
    getOverview,
    getMessagesByDay,
    getTopIntents,
    getHandoffRate,
    getSentimentTrend,
    getHourlyDistribution,
    getChannelBreakdown
} = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);
router.use(role('admin'));

router.get('/overview', getOverview);
router.get('/messages-by-day', getMessagesByDay);
router.get('/top-intents', getTopIntents);
router.get('/handoff-rate', getHandoffRate);
router.get('/sentiment-trend', getSentimentTrend);
router.get('/hourly-distribution', getHourlyDistribution);
router.get('/channel-breakdown', getChannelBreakdown);

module.exports = router;
