// src/sockets/order.socket.ts
import { SOCKET_EVENTS } from './events';
import { AuthenticatedSocket, socketAuthenticate } from './auth.socket';
import { getIO } from '../services/socket.service';
import { ROLES } from '../constants/roles';

export function registerOrderSocketHandlers(socket: AuthenticatedSocket) {
  socket.on(SOCKET_EVENTS.AUTHENTICATE, async (token: string) => {
    try {
      await socketAuthenticate(socket, token);
      socket.emit('authenticated', { ok: true });
    } catch {
      socket.emit('authenticated', { ok: false, error: 'INVALID_TOKEN' });
    }
  });

  // Optional explicit joins (still server-validated).
  socket.on(SOCKET_EVENTS.JOIN_BRANCH, (branchId: string) => {
    const u = socket.user;
    if (!u) return;
    if (u.role === ROLES.ADMIN) socket.join(`branch:${branchId}`);
    else if ((u.role === ROLES.MANAGER || u.role === ROLES.VATOR) && u.branchId === branchId) {
      socket.join(`branch:${branchId}`);
    }
  });

  socket.on(SOCKET_EVENTS.JOIN_USER, (userId: string) => {
    if (socket.user && socket.user.id === userId) socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    // cleanup if needed
  });
}

export function registerSocketServer(io: ReturnType<typeof getIO>) {
  io.on('connection', (socket: AuthenticatedSocket) => {
    registerOrderSocketHandlers(socket);
  });
}