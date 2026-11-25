// src/services/menuCategory.service.ts
import { menuCategoryRepository } from '../repositories/menuCategory.repository';
import { branchRepository } from '../repositories/branch.repository';
import { ApiError } from '../utils/ApiError';

export const menuCategoryService = {
  listByBranch: (branchId: string) => menuCategoryRepository.listByBranch(branchId),

  async create(input: { branchId: string; name: string; description?: string; image?: string; sortOrder?: number }) {
    const branch = await branchRepository.findById(input.branchId);
    if (!branch) throw ApiError.badRequest('Branch does not exist');
    return menuCategoryRepository.create(input as any);
  },

  async update(id: string, patch: any) {
    const updated = await menuCategoryRepository.update(id, patch);
    if (!updated) throw ApiError.notFound('Category not found');
    return updated;
  },

  async remove(id: string) {
    const cat = await menuCategoryRepository.findById(id);
    if (!cat) throw ApiError.notFound('Category not found');
    await menuCategoryRepository.delete(id);
  },
};