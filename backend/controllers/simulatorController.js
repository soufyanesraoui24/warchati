/**
 * simulatorController.js
 * محاكي الزبون - لاختبار النظام من قبل المطورين والموظفين
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiPipelineService = require('../services/aiPipelineService');
const responseHelper = require('../utils/responseHelper');

let io;
try {
    io = require('../config/socket').getIO();
} catch {
    io = null;
}

/**
 * POST /api/simulator/message
 * محاكاة رسالة زبون - تنشئ محادثة ورسالة وتشغل خط الأنابيب الذكي
 */
exports.simulateMessage = async (req, res) => {
    try {
        const { customerName, platform, text } = req.body;

        if (!text || !text.trim()) {
            return responseHelper.error(res, 'نص الرسالة مطلوب', 400);
        }

        const custName = customerName || 'مختبر تجريبي';
        const plat = platform || 'facebook';
        const senderId = `SIMULATOR_${Date.now()}`;

        // البحث عن محادثة موجودة بنفس الاسم أو إنشاء جديدة
        let conversation = await Conversation.findOne({
            name: custName,
            platform: plat,
            status: { $ne: 'DELETED' }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                senderId,
                platform: plat,
                name: custName,
                status: 'ACTIVE'
            });
        }

        // حفظ رسالة الزبون
        const userMessage = await Message.create({
            conversationId: conversation._id,
            sender: 'user',
            text: text.trim()
        });

        // بث عبر Socket.IO
        if (io) {
            io.to('monitor_room').emit('new_user_message', userMessage);
            io.to(`conversation_${conversation._id}`).emit('new_message', userMessage);
        }

        // تحديث عدد الرسائل غير المقروءة
        conversation.unread += 1;
        await conversation.save();

        // التأكد من أن AI شغال للمحاكاة
        conversation.aiActive = true;
        await conversation.save();

        // تشغيل خط الأنابيب الذكي
        const aiResult = await aiPipelineService.processMessage(text.trim(), conversation._id);

        // حفظ رد البوت (إذا pipeline رجع skipped نستخدم رد افتراضي)
        const botText = aiResult?.text || 'نقدر نعاونك بواش تحب 😊';

        const botMessage = await Message.create({
            conversationId: conversation._id,
            sender: 'bot',
            text: botText,
            intent: aiResult?.intent,
            sentiment: aiResult?.sentiment,
            images: aiResult?.images || []
        });

        // بث رد البوت
        if (io) {
            io.to('monitor_room').emit('new_ai_response', {
                conversationId: conversation._id,
                customerMessage: text.trim(),
                aiResponse: botText,
                intent: aiResult.intent,
                sentiment: aiResult.sentiment,
                images: aiResult?.images || [],
                timestamp: new Date().toISOString()
            });
        }

        return responseHelper.success(res, {
            conversation: {
                id: conversation._id,
                name: conversation.name,
                platform: conversation.platform,
                status: conversation.status
            },
            userMessage: {
                id: userMessage._id,
                text: userMessage.text
            },
            botReply: {
                id: botMessage._id,
                text: botText,
                intent: aiResult.intent,
                sentiment: aiResult.sentiment
            }
        }, 'تمت محاكاة الرسالة بنجاح', 201);
    } catch (error) {
        console.error('❌ Error simulating message:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء محاكاة الرسالة', 500);
    }
};
