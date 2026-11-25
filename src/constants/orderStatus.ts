export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;
export const ALL_ORDER_STATUSES: OrderStatus[] = Object.values(ORDER_STATUS);

// Allowed transitions (server side — never trust the client).
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY:     ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};