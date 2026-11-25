export const ORDER_SOURCE = { ONLINE: 'ONLINE', VATOR: 'VATOR' } as const;
export type OrderSource = keyof typeof ORDER_SOURCE;