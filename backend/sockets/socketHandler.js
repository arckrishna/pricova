const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.query?.token;

      if (!token) {
        // Allow anonymous connection for viewing live public price broadcasts
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'pricova_jwt_super_secret_key_2026'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        socket.user = user;
      }
      next();
    } catch (err) {
      console.warn(`[Socket Auth Warning]: ${err.message}`);
      // Don't kill connection, fallback to guest
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      const userRoom = `user_${socket.user._id}`;
      socket.join(userRoom);
      console.log(`[Socket Connected]: User ${socket.user.name} (${socket.user._id}) joined ${userRoom}`);

      if (socket.user.role === 'admin') {
        socket.join('admin_room');
      }
    } else {
      console.log(`[Socket Connected]: Guest visitor (${socket.id})`);
    }

    socket.on('disconnect', () => {
      // Disconnection handled cleanly
    });
  });

  return io;
};

// Helper to emit to a specific user's private room
const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, payload);
};

// Helper to broadcast to all clients
const emitBroadcast = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};

// Helper to emit to admins
const emitToAdmins = (event, payload) => {
  if (!io) return;
  io.to('admin_room').emit(event, payload);
};

module.exports = {
  initSocket,
  emitToUser,
  emitBroadcast,
  emitToAdmins,
  getIO: () => io,
};
