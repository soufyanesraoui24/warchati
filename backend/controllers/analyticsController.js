/**
 * analyticsController.js
 * لوحة الإحصائيات - تحليلات الأداء والمحادثات والرسائل
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const responseHelper = require('../helpers/responseHelper');

/**
 * GET /api/analytics/overview
 * إحصائيات اليوم - نظرة عامة سريعة
 */
exports.getOverview = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // إحصائيات اليوم
        const [
            totalConversations,
            todayConversations,
            todayMessages,
            aiMessages,
            handoffConversations,
            totalMessages
        ] = await Promise.all([
            Conversation.countDocuments({ status: { $ne: 'DELETED' } }),
            Conversation.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
            Message.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
            Message.countDocuments({ sender: 'bot', createdAt: { $gte: todayStart, $lte: todayEnd } }),
            Conversation.countDocuments({ status: 'HANDOFF' }),
            Message.countDocuments()
        ]);

        return responseHelper.success(res, {
            today: {
                conversations: todayConversations,
                messages: todayMessages,
                aiHandled: aiMessages,
                handoffs: handoffConversations
            },
            total: {
                conversations: totalConversations,
                messages: totalMessages
            },
            aiPercentage: todayMessages > 0 ? ((aiMessages / todayMessages) * 100).toFixed(1) : 0
        });
    } catch (error) {
        console.error('❌ Error fetching overview:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب الإحصائيات', 500);
    }
};

/**
 * GET /api/analytics/messages-by-day
 * عدد الرسائل لكل يوم - للرسم البياني
 */
exports.getMessagesByDay = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const data = await Message.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    total: { $sum: 1 },
                    bot: {
                        $sum: { $cond: [{ $eq: ['$sender', 'bot'] }, 1, 0] }
                    },
                    agent: {
                        $sum: { $cond: [{ $eq: ['$sender', 'agent'] }, 1, 0] }
                    },
                    user: {
                        $sum: { $cond: [{ $eq: ['$sender', 'user'] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return responseHelper.success(res, data);
    } catch (error) {
        console.error('❌ Error fetching daily message stats:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب إحصائيات الرسائل', 500);
    }
};

/**
 * GET /api/analytics/top-intents
 * أشهر النوايا (المواضيع) في المحادثات
 */
exports.getTopIntents = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const data = await Message.aggregate([
            {
                $match: {
                    intent: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$intent',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        return responseHelper.success(res, data);
    } catch (error) {
        console.error('❌ Error fetching top intents:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب النوايا', 500);
    }
};

/**
 * GET /api/analytics/handoff-rate
 * نسبة المحادثات التي يديرها الذكاء الاصطناعي مقابل التي حوّلت للموظفين
 */
exports.getHandoffRate = async (req, res) => {
    try {
        const [total, handoffs, active] = await Promise.all([
            Conversation.countDocuments({ status: { $ne: 'DELETED' } }),
            Conversation.countDocuments({ status: 'HANDOFF' }),
            Conversation.countDocuments({ status: 'ACTIVE' })
        ]);

        const aiRate = total > 0 ? ((active / total) * 100).toFixed(1) : 0;
        const handoffRate = total > 0 ? ((handoffs / total) * 100).toFixed(1) : 0;

        return responseHelper.success(res, {
            total,
            aiManaged: active,
            handoffs,
            aiRate: parseFloat(aiRate),
            handoffRate: parseFloat(handoffRate)
        });
    } catch (error) {
        console.error('❌ Error fetching handoff rate:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب نسبة التحويل', 500);
    }
};
