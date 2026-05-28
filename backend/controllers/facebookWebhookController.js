/**
 * facebookWebhookController.js
 * معالجة Webhook الخاصة بـ Facebook Messenger
 * استقبال الرسائل والتحقق من الاشتراك
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiPipelineService = require('../services/aiPipelineService');
const facebookMessengerService = require('../services/facebookMessengerService');
const responseHelper = require('../utils/responseHelper');

let io;
try {
    io = require('../config/socket').getIO();
} catch {
    io = null;
}

/**
 * GET /api/webhook/facebook
 * التحقق من Webhook فيسبوك (Verification Challenge)
 */
exports.verifyWebhook = (req, res) => {
    try {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            console.log('✅ Facebook Webhook verified successfully');
            return res.status(200).send(challenge);
        }

        return res.sendStatus(403);
    } catch (error) {
        console.error('❌ Error verifying Facebook Webhook:', error.message);
        return res.sendStatus(500);
    }
};

/**
 * POST /api/webhook/facebook
 * استقبال الرسائل الواردة من Facebook Messenger
 */
exports.handleWebhook = async (req, res) => {
    try {
        const body = req.body;

        // الرد الفوري ب 200 لفيسبوك
        res.status(200).send('EVENT_RECEIVED');

        if (body.object !== 'page') {
            return;
        }

        const entry = body.entry[0];
        const messagingEvent = entry.messaging ? entry.messaging[0] : null;

        if (!messagingEvent || !messagingEvent.message || !messagingEvent.message.text) {
            return;
        }

        const senderId = messagingEvent.sender.id;
        const messageText = messagingEvent.message.text;

        console.log(`📩 Facebook message received from ${senderId}: ${messageText}`);

        // البحث عن محادثة موجودة أو إنشاء جديدة
        let conversation = await Conversation.findOne({ senderId, platform: 'facebook' });

        if (!conversation) {
            conversation = await Conversation.create({
                senderId,
                platform: 'facebook',
                name: `Customer ${senderId}`
            });
        }

        // حفظ رسالة الزبون
        const savedMessage = await Message.create({
            conversationId: conversation._id,
            sender: 'user',
            text: messageText
        });

        // بث عبر Socket.IO
        if (io) {
            io.to('monitor_room').emit('new_user_message', savedMessage);
            io.to(`conversation_${conversation._id}`).emit('new_message', savedMessage);
        }

        // تحديث عدد الرسائل غير المقروءة
        conversation.unread += 1;
        await conversation.save();

        // إذا كانت المحادثة نشيطة، شغّل خط الأنابيب الذكي
        if (conversation.status === 'ACTIVE') {
            const aiResult = await aiPipelineService.processMessage(messageText, conversation._id);

            // حفظ رد البوت
            const botMessage = await Message.create({
                conversationId: conversation._id,
                sender: 'bot',
                text: aiResult.text,
                intent: aiResult.intent,
                sentiment: aiResult.sentiment,
                images: aiResult.images || []
            });

            // بث رد البوت
            if (io) {
                io.to('monitor_room').emit('new_ai_response', {
                    conversationId: conversation._id,
                    customerMessage: messageText,
                    aiResponse: aiResult.text,
                    intent: aiResult.intent,
                    sentiment: aiResult.sentiment,
                    images: aiResult.images || [],
                    timestamp: new Date().toISOString()
                });
            }

            // إرسال الرد إلى فيسبوك
            await facebookMessengerService.sendMessage(senderId, aiResult.text);
        }
    } catch (error) {
        console.error('❌ Error processing Facebook Webhook:', error.message);
    }
};
