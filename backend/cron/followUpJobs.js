const cron = require('node-cron');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const startFollowUpJobs = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('Running Background Cron Job: AI Follow-ups...');
        
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            const idleConversations = await Conversation.find({
                status: 'ACTIVE',
                updatedAt: { $lte: twentyFourHoursAgo },
            });

            for (const conv of idleConversations) {
                const lastMessage = await Message.findOne({ conversationId: conv._id }).sort({ createdAt: -1 });
                
                if (lastMessage && lastMessage.sender === 'bot') {
                    const followUpText = "سلام 👋 مزالك مهتم بالطلب؟ إذا خصك أي مساعدة رانا متواجدين!";
                    
                    await Message.create({
                        conversationId: conv._id,
                        sender: 'bot',
                        text: followUpText,
                        intent: 'follow_up'
                    });

                    console.log(`[Follow-Up] Triggered for ${conv.senderId}: ${followUpText}`);
                    
                    conv.updatedAt = new Date();
                    await conv.save();
                }
            }
        } catch (error) {
            console.error('Error in Follow-up Cron Job:', error);
        }
    });
};

module.exports = { startFollowUpJobs };
