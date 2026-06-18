const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingInterval: 25000,
    pingTimeout: 20000
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] ✅ Client connected: ${socket.id}`);

    socket.on('join_monitor', () => {
      socket.join('monitor_room');
      console.log(`[Socket.IO] 👁️ Employee ${socket.id} joined monitor room`);
    });

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`[Socket.IO] 💬 ${socket.id} joined conversation: ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`[Socket.IO] 🚪 ${socket.id} left conversation: ${conversationId}`);
    });

    // ─── تشغيل/إيقاف AI تلقائي عند دخول/خروج موظف ───
    socket.on('pause_ai', async (conversationId) => {
      try {
        const Conversation = require('../models/Conversation');
        await Conversation.findByIdAndUpdate(conversationId, { aiActive: false });
        console.log(`[Socket.IO] ⏸️ AI paused for conversation ${conversationId} by ${socket.id}`);
        io.to(`conversation_${conversationId}`).emit('ai_toggled', { conversationId, aiActive: false });
      } catch (err) {
        console.error('[Socket.IO] Error stopping AI:', err.message);
      }
    });

    socket.on('resume_ai', async (conversationId) => {
      try {
        const Conversation = require('../models/Conversation');
        await Conversation.findByIdAndUpdate(conversationId, { aiActive: true });
        console.log(`[Socket.IO] ▶️ AI running for conversation ${conversationId} by ${socket.id}`);
        io.to(`conversation_${conversationId}`).emit('ai_toggled', { conversationId, aiActive: true });
      } catch (err) {
        console.error('[Socket.IO] Error starting AI:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] ❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('❌ Socket.IO لم يتم تهيئته بعد. اتصل بـ initSocket أولاً.');
  }
  return io;
};

module.exports = { initSocket, getIO };
