/**
 * whatsappWebhookController.js
 * معالجة Webhook الخاصة بـ WhatsApp Business API
 * استقبال الرسائل والتحقق من الاشتراك
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
 * GET /api/webhook/whatsapp
 * التحقق من Webhook واتساب (Verification Challenge)
 */
exports.verifyWebhook = (req, res) => {
    try {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            console.log('✅ WhatsApp Webhook verified successfully');
            return res.status(200).send(challenge);
        }

        return res.sendStatus(403);
    } catch (error) {
        console.error('❌ Error verifying WhatsApp Webhook:', error.message);
        return res.sendStatus(500);
    }
};

/**
 * POST /api/webhook/whatsapp
 * استقبال الرسائل الواردة من WhatsApp Business API
 * 
 * تنسيق WhatsApp payload:
 * {
 *   object: 'whatsapp_business_account',
 *   entry: [{
 *     changes: [{
 *       value: {
 *         messages: [{
 *           from: '123456789',
 *           text: { body: 'السلام عليكم' }
 *         }]
 *       }
 *     }]
 *   }]
 * }
 */
exports.handleWebhook = async (req, res) => {
    try {
        const body = req.body;

        // الرد الفوري ب 200 لواتساب
        res.status(200).send('EVENT_RECEIVED');

        if (body.object !== 'whatsapp_business_account') {
            return;
        }

        const entry = body.entry[0];
        const changes = entry.changes ? entry.changes[0] : null;
        const value = changes ? changes.value : null;
        const messages = value ? value.messages : null;

        if (!messages || messages.length === 0) {
            return;
        }

        // واتساب قد يرسل عدة رسائل في نفس الطلب
        for (const msg of messages) {
            // تجاهل الرسائل غير النصية (صور، فيديو، إلخ)
            if (msg.type !== 'text' || !msg.text || !msg.text.body) {
                continue;
            }

            const senderId = msg.from;
            const messageText = msg.text.body;
            const profileName = value.contacts && value.contacts[0] ? value.contacts[0].profile.name : `Customer ${senderId}`;

            console.log(`📩 WhatsApp message received from ${senderId}: ${messageText}`);

            // البحث عن محادثة موجودة أو إنشاء جديدة
            let conversation = await Conversation.findOne({ senderId, platform: 'whatsapp' });

            if (!conversation) {
                conversation = await Conversation.create({
                    senderId,
                    platform: 'whatsapp',
                    name: profileName
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

                // TODO: إرسال الرد إلى WhatsApp عبر API (يتطلب إعداد WhatsApp Business API)
                console.log(`📤 WhatsApp reply to ${senderId}: ${aiResult.text.substring(0, 50)}...`);
            }
        }
    } catch (error) {
        console.error('❌ Error processing WhatsApp Webhook:', error.message);
    }
};
