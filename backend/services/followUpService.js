const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const BotSettings = require('../models/BotSettings');
let getIO = null;
try {
    getIO = require('../config/socket').getIO;
} catch (e) {
    console.warn('[FollowUp] Socket.IO not available yet');
}

async function processFollowUps() {
    try {
        const settings = await BotSettings.findOne();
        if (!settings || !settings.followUpEnabled) return;

        const delayMs = settings.followUpDelay * 60 * 1000;
        const cutoff = new Date(Date.now() - delayMs);

        const candidates = await Conversation.find({
            status: { $in: ['ACTIVE', 'PENDING'] },
            aiActive: true,
            updatedAt: { $lte: cutoff }
        });

        for (const conv of candidates) {
            const lastMsg = await Message.findOne({ conversationId: conv._id })
                .sort({ createdAt: -1 });

            if (!lastMsg || lastMsg.sender !== 'user') continue;

            const alreadyFollowedUp = await Message.findOne({
                conversationId: conv._id,
                sender: 'bot',
                intent: 'follow_up'
            });

            if (alreadyFollowedUp) continue;

            const followUpMessage = await Message.create({
                conversationId: conv._id,
                sender: 'bot',
                text: settings.followUpMessage,
                intent: 'follow_up',
                platform: conv.platform || 'simulator'
            });

            conv.updatedAt = new Date();
            await conv.save();

            const io = getIO();
            if (io) {
                io.to(conv._id.toString()).emit('new_message', followUpMessage);
                io.emit('conversation_updated', {
                    conversationId: conv._id,
                    lastMessage: followUpMessage.text,
                    lastMessageAt: followUpMessage.createdAt
                });
            }
        }
    } catch (error) {
        console.error('Follow-up service error:', error.message);
    }
}

let intervalId = null;

function startFollowUpService() {
    const INTERVAL = 5 * 60 * 1000;
    console.log('[FollowUp] Service started, checking every 5 minutes');
    processFollowUps();
    intervalId = setInterval(processFollowUps, INTERVAL);
}

function stopFollowUpService() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('[FollowUp] Service stopped');
    }
}

module.exports = { startFollowUpService, stopFollowUpService };
