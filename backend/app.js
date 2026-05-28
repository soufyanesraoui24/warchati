const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const errorMiddleware = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const productRoutes = require('./routes/productRoutes');
const templateRoutes = require('./routes/templateRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');
const facebookWebhookRoutes = require('./routes/facebookWebhookRoutes');
const whatsappWebhookRoutes = require('./routes/whatsappWebhookRoutes');
const channelRoutes = require('./routes/channelRoutes');

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: 'طلبات كثيرة جداً، حاول لاحقاً' }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'محاولات دخول كثيرة، حاول بعد 15 دقيقة' }
});
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Warchati API is running', status: 'OK', ai: 'Local (Ollama)' });
});
app.get('/health', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbState = mongoose.connection.readyState;
        const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: dbStatus[dbState] || 'unknown',
            ai: 'Ollama (Mistral)',
            uptime: process.uptime()
        });
    } catch (err) {
        res.status(503).json({ status: 'ERROR', message: err.message });
    }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/conversations', messageRoutes); // nested under conversations
app.use('/api/products', productRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/webhook/facebook', facebookWebhookRoutes);
app.use('/api/webhook/whatsapp', whatsappWebhookRoutes);
app.use('/api/channels', channelRoutes);

// Error handler
app.use(errorMiddleware);

module.exports = app;
