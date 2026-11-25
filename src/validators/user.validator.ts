// src/validators/user.validator.ts
import { z } from 'zod';
import { ASSIGNABLE_BY_ADMIN } from '../constants/roles';

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(5).max(20).optional(),
  password: z.string().min(8).max(128),
  role: z.enum(ASSIGNABLE_BY_ADMIN as [string, ...string[]]),
  branchId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(5).max(20).optional(),
  branchId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export const setStatusSchema = z.object({
  isActive: z.boolean(),
});