/**
 * messageController.js
 * إدارة الرسائل - إرسال واستقبال وعرض الرسائل
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const facebookMessengerService = require('../services/facebookMessengerService');
const responseHelper = require('../utils/responseHelper');

let io;
try {
    io = require('../config/socket').getIO();
} catch {
    io = null;
}

/**
 * GET /api/conversations/:id/messages
 * جلب رسائل محادثة مع ترقيم الصفحات
 */
exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        const [messages, total] = await Promise.all([
            Message.find({ conversationId: id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Message.countDocuments({ conversationId: id })
        ]);

        // ترتيب تصاعدي للعرض
        messages.reverse();

        for (const msg of messages) {
            msg.id = msg._id;
        }

        return responseHelper.paginated(res, messages, total, page, limit);
    } catch (error) {
        console.error('❌ Error fetching messages:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب الرسائل', 500);
    }
};

/**
 * POST /api/conversations/:id/messages
 * إرسال رسالة من موظف
 */
exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return responseHelper.error(res, 'نص الرسالة مطلوب', 400);
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        // إنشاء الرسالة
        const message = await Message.create({
            conversationId: id,
            sender: 'agent',
            text: text.trim()
        });

        // تحديث حالة المحادثة إلى human_required
        await Conversation.findByIdAndUpdate(id, { status: 'HANDOFF' });

        // بث عبر Socket.IO
        if (io) {
            io.to(`conversation_${id}`).emit('new_message', message);
            io.to('monitor_room').emit('new_message', message);
        }

        // إرسال إلى فيسبوك إذا كانت المنصة فيسبوك
        if (conversation.platform === 'facebook') {
            await facebookMessengerService.sendMessage(conversation.senderId, text.trim());
        }

        const messageObj = message.toObject();
        messageObj.id = messageObj._id;

        return responseHelper.success(res, messageObj, 'تم إرسال الرسالة بنجاح', 201);
    } catch (error) {
        console.error('❌ Error sending message:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء إرسال الرسالة', 500);
    }
};

/**
 * POST /api/conversations/:id/suggested-reply
 * الموافقة على رد مقترح من الذكاء الاصطناعي وإرساله
 */
exports.sendSuggestedReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return responseHelper.error(res, 'نص الرد المقترح مطلوب', 400);
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        // إنشاء الرسالة كرد معلم بقالب
        const message = await Message.create({
            conversationId: id,
            sender: 'agent',
            text: text.trim(),
            isTemplate: true
        });

        // بث عبر Socket.IO
        if (io) {
            io.to(`conversation_${id}`).emit('new_message', message);
            io.to('monitor_room').emit('new_message', message);
        }

        // إرسال إلى فيسبوك إذا كانت المنصة فيسبوك
        if (conversation.platform === 'facebook') {
            await facebookMessengerService.sendMessage(conversation.senderId, text.trim());
        }

        const messageObj = message.toObject();
        messageObj.id = messageObj._id;

        return responseHelper.success(res, messageObj, 'تم إرسال الرد المقترح بنجاح', 201);
    } catch (error) {
        console.error('❌ Error sending suggested reply:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء إرسال الرد المقترح', 500);
    }
};
