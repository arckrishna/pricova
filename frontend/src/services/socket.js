import { io } from 'socket.io-client';

let socket = null;

export const initiateSocketConnection = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

  socket = io(socketUrl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket.IO]: Connected with ID:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO]: Disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
