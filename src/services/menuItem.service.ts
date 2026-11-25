// src/services/menuItem.service.ts
import { menuItemRepository } from '../repositories/menuItem.repository';
import { menuCategoryRepository } from '../repositories/menuCategory.repository';
import { ApiError } from '../utils/ApiError';
import { cloudinaryService } from './cloudinary.service';

export const menuItemService = {
  listByBranch: (branchId: string, includeInactive = false) =>
    menuItemRepository.listByBranch(branchId, includeInactive ? {} : { isActive: true }),

  getById: async (id: string) => {
    const item = await menuItemRepository.findById(id);
    if (!item) throw ApiError.notFound('Menu item not found');
    return item;
  },

  async create(input: any) {
    const category = await menuCategoryRepository.findById(input.categoryId);
    if (!category) throw ApiError.badRequest('Category does not exist');
    if (String(category.branchId) !== String(input.branchId)) {
      throw ApiError.badRequest('Category does not belong to this branch');
    }
    return menuItemRepository.create(input);
  },

  async update(id: string, patch: any) {
    const item = await menuItemRepository.findById(id);
    if (!item) throw ApiError.notFound('Menu item not found');
    const updated = await menuItemRepository.update(id, patch);
    return updated;
  },

  async remove(id: string) {
    const item = await menuItemRepository.findById(id);
    if (!item) throw ApiError.notFound('Menu item not found');
    if (item.cloudinaryPublicId) {
      await cloudinaryService.deleteImage(item.cloudinaryPublicId).catch(() => undefined);
    }
    await menuItemRepository.delete(id);
  },
};