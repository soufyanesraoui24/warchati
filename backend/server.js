const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/database');
const { initSocket, getIO } = require('./config/socket');
const { startFollowUpService } = require('./services/followUpService');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ═══════════════════════════════════════════════
const REQUIRED_VARS = ['JWT_SECRET'];
const missing = REQUIRED_VARS.filter(v => !process.env[v]);
if (missing.length) {
    console.error(`[ENV] ❌ Missing required variables: ${missing.join(', ')}`);
    process.exit(1);
}

const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
initSocket(server);

// Start follow-up automation
startFollowUpService();

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`[Socket.IO] 🔌 WebSocket ready on port ${PORT}`);
    console.log(`[FollowUp] ⏰ Automation service active`);
});

// ═══════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════
const shutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('[Server] HTTP server closed.');
    });
    try {
        await mongoose.connection.close();
        console.log('[Server] MongoDB connection closed.');
    } catch (err) {
        console.error('[Server] Error closing MongoDB:', err.message);
    }
    const io = getIO();
    if (io) {
        io.close(() => console.log('[Server] Socket.IO closed.'));
    }
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
