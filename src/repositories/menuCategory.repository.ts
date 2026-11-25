// src/repositories/menuCategory.repository.ts
import { MenuCategory, IMenuCategory } from '../models/menuCategory.model';

export const menuCategoryRepository = {
  listByBranch: (branchId: string) =>
    MenuCategory.find({ branchId }).sort({ sortOrder: 1, name: 1 }).lean().exec(),
  findById: (id: string) => MenuCategory.findById(id).lean().exec(),
  create: (data: Partial<IMenuCategory>) => MenuCategory.create(data),
  update: (id: string, patch: Partial<IMenuCategory>) =>
    MenuCategory.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean().exec(),
  delete: (id: string) => MenuCategory.findByIdAndDelete(id).lean().exec(),
};