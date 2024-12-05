const { verifyToken } = require('../middleware/auth.middleware');

const connectedUsers = new Map();
const activeRooms = new Map();

exports.setupWebSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = await verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);

    // Handle private messages
    socket.on('private-message', async (data) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('private-message', {
          senderId: socket.userId,
          message: data.message,
          timestamp: new Date()
        });
      }
    });

    // Handle video call signaling
    socket.on('call-user', (data) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('incoming-call', {
          signal: data.signalData,
          from: socket.userId
        });
      }
    });

    socket.on('answer-call', (data) => {
      const callerSocketId = connectedUsers.get(data.to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', data.signal);
      }
    });

    socket.on('end-call', (data) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call-ended');
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};