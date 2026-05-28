const axios = require('axios');

const WebhookSimulator = async () => {
    console.log('🚀 Starting Webhook Simulator...');
    
    // Simulate Facebook Messenger message
    const payload = {
        object: 'page',
        entry: [
            {
                messaging: [
                    {
                        sender: { id: 'SIMULATOR_USER_123' },
                        message: { text: 'salam, 3andkom tawssil?' }
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post('http://localhost:5000/api/chat/webhook', payload);
        console.log('✅ Webhook sent successfully:', response.data);
    } catch (error) {
        console.error('❌ Error sending webhook:', error.message);
    }
};

WebhookSimulator();
