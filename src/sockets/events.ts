// src/sockets/events.ts
export const SOCKET_EVENTS = {
  // client -> server
  AUTHENTICATE: 'authenticate',
  JOIN_BRANCH: 'join_branch',
  JOIN_USER: 'join_user',

  // server -> client
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  NOTIFICATION_NEW: 'notification:new',
} as const;