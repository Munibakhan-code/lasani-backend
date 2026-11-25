// src/validators/order.validator.ts
import { z } from 'zod';
import { ALL_ORDER_STATUSES } from '../constants/orderStatus';
import { ORDER_SOURCE } from '../constants/orderSource';

export const createOrderSchema = z.object({
  branchId: z.string().regex(/^[a-f\d]{24}$/i),
  items: z
    .array(
      z.object({
        menuItemId: z.string().regex(/^[a-f\d]{24}$/i),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1),
  notes: z.string().max(500).optional(),
  orderSource: z.enum([ORDER_SOURCE.ONLINE, ORDER_SOURCE.VATOR]).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(ALL_ORDER_STATUSES as [string, ...string[]]),
});

export const listOrdersQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(ALL_ORDER_STATUSES as [string, ...string[]]).optional(),
  branchId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
});