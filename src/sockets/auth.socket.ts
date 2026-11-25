// src/sockets/auth.socket.ts
import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/user.model';
import { rooms } from './rooms';
import type { SocketAuthUser } from '../types/socket';

export interface AuthenticatedSocket extends Socket {
  user?: SocketAuthUser;
}

export async function socketAuthenticate(socket: AuthenticatedSocket, token: string): Promise<void> {
  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).lean();
  if (!user || !user.isActive) throw new Error('Unauthorized');

  socket.user = {
    id: String(user._id),
    role: user.role,
    branchId: user.branchId ? String(user.branchId) : null,
  };

  // Join rooms based on role — server side, never trust client-supplied rooms.
  socket.join(rooms.user(socket.user.id));

  if (socket.user.role === 'ADMIN') {
    socket.join(rooms.admin);
  }
  if ((socket.user.role === 'MANAGER' || socket.user.role === 'VATOR') && socket.user.branchId) {
    socket.join(rooms.branch(socket.user.branchId));
  }
}