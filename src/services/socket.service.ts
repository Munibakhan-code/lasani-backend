// src/services/socket.service.ts
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function setIO(server: IOServer) { io = server; }
export function getIO(): IOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export const socketService = {
  emitToBranch(branchId: string, event: string, payload: unknown) {
    io?.to(`branch:${branchId}`).emit(event, payload);
  },
  emitToUser(userId: string, event: string, payload: unknown) {
    io?.to(`user:${userId}`).emit(event, payload);
  },
  emitToAdmins(event: string, payload: unknown) {
    io?.to('role:admin').emit(event, payload);
  },
};