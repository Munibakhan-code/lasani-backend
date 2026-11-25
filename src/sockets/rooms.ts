// src/sockets/rooms.ts
export const rooms = {
  user: (id: string) => `user:${id}`,
  branch: (id: string) => `branch:${id}`,
  admin: 'role:admin',
};