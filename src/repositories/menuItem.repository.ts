// src/repositories/menuItem.repository.ts
import { MenuItem, IMenuItem } from '../models/menuItem.model';

export const menuItemRepository = {
  listByBranch: (branchId: string, extra: Record<string, unknown> = {}) =>
    MenuItem.find({ branchId, ...extra }).sort({ name: 1 }).lean().exec(),
  findById: (id: string) => MenuItem.findById(id).lean().exec(),
  findByIds: (ids: string[]) => MenuItem.find({ _id: { $in: ids } }).lean().exec(),
  create: (data: Partial<IMenuItem>) => MenuItem.create(data),
  update: (id: string, patch: Partial<IMenuItem>) =>
    MenuItem.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean().exec(),
  delete: (id: string) => MenuItem.findByIdAndDelete(id).lean().exec(),
};