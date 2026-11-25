// src/validators/branch.validator.ts
import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(5).max(300),
  phone: z.string().min(5).max(20).optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  address: z.string().min(5).max(300).optional(),
  phone: z.string().min(5).max(20).optional(),
  isActive: z.boolean().optional(),
});

export const branchIdParam = z.object({ branchId: z.string().regex(/^[a-f\d]{24}$/i) });
export const idParam = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) });