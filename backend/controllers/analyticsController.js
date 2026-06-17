const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Product = require('../models/Product');
const responseHelper = require('../helpers/responseHelper');

function getDateRange(days) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return start;
}

function getDayRange(offset = 0) {
    const start = new Date();
    start.setDate(start.getDate() + offset);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

exports.getOverview = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 1;
        const rangeStart = getDateRange(days);

        const today = getDayRange(0);
        const yesterday = getDayRange(-1);

        const [
            totalConversations,
            periodConversations,
            periodMessages,
            aiMessages,
            handoffConversations,
            totalMessages,
            totalProducts,
            activeCustomers,
            pendingHandoffs,
            todayConversations,
            yesterdayConversations,
            todayMessages,
            yesterdayMessages
        ] = await Promise.all([
            Conversation.countDocuments({ status: { $ne: 'DELETED' } }),
            Conversation.countDocuments({ createdAt: { $gte: rangeStart } }),
            Message.countDocuments({ createdAt: { $gte: rangeStart } }),
            Message.countDocuments({ sender: 'bot', createdAt: { $gte: rangeStart } }),
            Conversation.countDocuments({ status: 'HANDOFF' }),
            Message.countDocuments(),
            Product.countDocuments(),
            Conversation.distinct('senderId', { status: { $ne: 'DELETED' } }),
            Conversation.countDocuments({ status: 'HANDOFF', assignedAgent: { $exists: false } }),
            Conversation.countDocuments({ createdAt: { $gte: today.start, $lte: today.end } }),
            Conversation.countDocuments({ createdAt: { $gte: yesterday.start, $lte: yesterday.end } }),
            Message.countDocuments({ createdAt: { $gte: today.start, $lte: today.end } }),
            Message.countDocuments({ createdAt: { $gte: yesterday.start, $lte: yesterday.end } }),
        ]);

        const convChange = yesterdayConversations > 0
            ? (((todayConversations - yesterdayConversations) / yesterdayConversations) * 100).toFixed(1)
            : todayConversations > 0 ? 100 : 0;

        const msgChange = yesterdayMessages > 0
            ? (((todayMessages - yesterdayMessages) / yesterdayMessages) * 100).toFixed(1)
            : todayMessages > 0 ? 100 : 0;

        return responseHelper.success(res, {
            period: { conversations: periodConversations, messages: periodMessages, days },
            today: {
                conversations: todayConversations,
                messages: todayMessages,
                aiHandled: aiMessages,
                handoffs: handoffConversations,
                convChange: parseFloat(convChange),
                msgChange: parseFloat(msgChange)
            },
            total: {
                conversations: totalConversations,
                messages: totalMessages,
                products: totalProducts,
                activeCustomers: activeCustomers.length,
                pendingHandoffs
            },
            aiPercentage: periodMessages > 0 ? ((aiMessages / periodMessages) * 100).toFixed(1) : 0
        });
    } catch (error) {
        console.error('❌ Error fetching overview:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب الإحصائيات', 500);
    }
};

exports.getMessagesByDay = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = getDateRange(days);

        const data = await Message.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: 1 },
                    bot: { $sum: { $cond: [{ $eq: ['$sender', 'bot'] }, 1, 0] } },
                    agent: { $sum: { $cond: [{ $eq: ['$sender', 'agent'] }, 1, 0] } },
                    user: { $sum: { $cond: [{ $eq: ['$sender', 'user'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return responseHelper.success(res, data.map(d => ({
            date: d._id, total: d.total, bot: d.bot, agent: d.agent, user: d.user
        })));
    } catch (error) {
        console.error('❌ Error fetching daily message stats:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب إحصائيات الرسائل', 500);
    }
};

exports.getTopIntents = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const days = parseInt(req.query.days) || 30;
        const startDate = getDateRange(days);

        const data = await Message.aggregate([
            { $match: { intent: { $exists: true, $ne: null }, createdAt: { $gte: startDate } } },
            { $group: { _id: '$intent', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        return responseHelper.success(res, data.map(d => ({ intent: d._id, count: d.count })));
    } catch (error) {
        console.error('❌ Error fetching top intents:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب النوايا', 500);
    }
};

exports.getHandoffRate = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = getDateRange(days);

        const [total, handoffs, active, totalBot, totalHuman] = await Promise.all([
            Conversation.countDocuments({ status: { $ne: 'DELETED' }, createdAt: { $gte: startDate } }),
            Conversation.countDocuments({ status: 'HANDOFF', createdAt: { $gte: startDate } }),
            Conversation.countDocuments({ status: 'ACTIVE', createdAt: { $gte: startDate } }),
            Message.countDocuments({ sender: 'bot', createdAt: { $gte: startDate } }),
            Message.countDocuments({ sender: 'agent', createdAt: { $gte: startDate } })
        ]);

        const totalResolved = totalBot + totalHuman;
        const aiPercentage = totalResolved > 0 ? ((totalBot / totalResolved) * 100).toFixed(1) : 0;
        const humanPercentage = totalResolved > 0 ? ((totalHuman / totalResolved) * 100).toFixed(1) : 0;

        return responseHelper.success(res, {
            total,
            aiManaged: active,
            handoffs,
            aiPercentage: parseFloat(aiPercentage),
            humanPercentage: parseFloat(humanPercentage)
        });
    } catch (error) {
        console.error('❌ Error fetching handoff rate:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب نسبة التحويل', 500);
    }
};

exports.getSentimentTrend = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = getDateRange(days);

        const data = await Message.aggregate([
            { $match: { sentiment: { $exists: true, $ne: null }, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        sentiment: '$sentiment'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        const map = {};
        data.forEach(d => {
            if (!map[d._id.date]) map[d._id.date] = { date: d._id.date, positive: 0, negative: 0, neutral: 0 };
            map[d._id.date][d._id.sentiment] = (map[d._id.date][d._id.sentiment] || 0) + d.count;
        });

        return responseHelper.success(res, Object.values(map));
    } catch (error) {
        console.error('❌ Error fetching sentiment trend:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب اتجاهات المشاعر', 500);
    }
};

exports.getHourlyDistribution = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = getDateRange(days);

        const data = await Message.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const hours = Array.from({ length: 24 }, (_, i) => {
            const found = data.find(d => d._id === i);
            return { hour: i, count: found ? found.count : 0, label: `${i}:00` };
        });

        return responseHelper.success(res, hours);
    } catch (error) {
        console.error('❌ Error fetching hourly distribution:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب التوزيع الساعي', 500);
    }
};

exports.getChannelBreakdown = async (req, res) => {
    try {
        const data = await Conversation.aggregate([
            { $match: { status: { $ne: 'DELETED' } } },
            { $group: { _id: '$platform', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return responseHelper.success(res, data.map(d => ({ channel: d._id, count: d.count })));
    } catch (error) {
        console.error('❌ Error fetching channel breakdown:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب توزيع القنوات', 500);
    }
};
