// src/sockets/index.ts
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { env } from '../config/env';
import { corsMiddleware } from '../config/cors';
import { setIO } from '../services/socket.service';
import { registerSocketServer } from './order.socket';

export function initializeSockets(httpServer: HttpServer): IOServer {
  const io = new IOServer(httpServer, {
    cors: {
      origin: env.corsWhitelist,
      credentials: true,
    },
    path: '/socket.io',
  });

  setIO(io);
  registerSocketServer(io);
  return io;
}