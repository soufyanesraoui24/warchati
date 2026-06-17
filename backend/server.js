const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/database');
const { initSocket } = require('./config/socket');
const { startFollowUpService } = require('./services/followUpService');
const { warmupModel } = require('./services/localAIService');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
initSocket(server);

// Start follow-up automation
startFollowUpService();

// Warm up Ollama model so first user doesn't wait
warmupModel();

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`[Socket.IO] 🔌 WebSocket ready on port ${PORT}`);
    console.log(`[FollowUp] ⏰ Automation service active`);
});
