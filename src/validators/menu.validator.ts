// src/validators/menu.validator.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  branchId: z.string().regex(/^[a-f\d]{24}$/i),
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  image: z.string().url().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ branchId: true });

export const createItemSchema = z.object({
  branchId: z.string().regex(/^[a-f\d]{24}$/i),
  categoryId: z.string().regex(/^[a-f\d]{24}$/i),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  price: z.number().min(0).max(100000),
  image: z.string().url().optional(),
  cloudinaryPublicId: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateItemSchema = createItemSchema.partial().omit({ branchId: true, categoryId: true });