const facebookMessengerService = require('../services/facebookMessengerService');
const whatsappService = require('../services/whatsappService');

exports.getStatus = async (req, res) => {
    const fbToken = process.env.PAGE_ACCESS_TOKEN;
    const waToken = process.env.WHATSAPP_TOKEN;

    try {
        const fbConnected = fbToken && fbToken !== 'your_page_access_token_here';
        const waConnected = waToken && waToken !== 'your_whatsapp_token_here';

        res.json({
            facebook: {
                isConnected: fbConnected,
                webhookUrl: fbConnected ? '/api/webhook/facebook' : null,
                lastMessage: null
            },
            whatsapp: {
                isConnected: waConnected,
                webhookUrl: waConnected ? '/api/webhook/whatsapp' : null,
                lastMessage: null
            }
        });
    } catch (error) {
        console.error('[Channels] Status error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching channel status' });
    }
};

exports.testChannel = async (req, res) => {
    const { channelKey } = req.params;

    try {
        if (channelKey === 'facebook') {
            const result = await facebookMessengerService.sendMessage('test', '🟢 Test connection from Warchati');
            return res.json({ success: result.success, message: result.success ? 'Connected' : result.error });
        }
        if (channelKey === 'whatsapp') {
            const result = await whatsappService.sendMessage('test', '🟢 Test connection from Warchati');
            return res.json({ success: result.success, message: result.success ? 'Connected' : result.error });
        }
        res.status(400).json({ success: false, message: 'Unknown channel' });
    } catch (error) {
        console.error(`[Channels] Test ${channelKey} error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
