// src/repositories/order.repository.ts
import { Order, IOrder } from '../models/order.model';

export const orderRepository = {
  create: (data: Partial<IOrder>) => Order.create(data),
  findById: (id: string) => Order.findById(id).lean().exec(),
  list: (filter: Record<string, unknown>, skip: number, limit: number) =>
    Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Order.countDocuments(filter),
    ]),
};