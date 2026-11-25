// src/services/branch.service.ts
import { branchRepository } from '../repositories/branch.repository';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { ROLES } from '../constants/roles';

export const branchService = {
  async listPublic() {
    return branchRepository.list({ isActive: true });
  },
  async listAll() {
    return branchRepository.list({});
  },
  async getById(id: string) {
    const branch = await branchRepository.findById(id);
    if (!branch) throw ApiError.notFound('Branch not found');
    return branch;
  },
  async create(data: { name: string; address: string; phone?: string }) {
    return branchRepository.create({ ...data, isActive: true, vatorIds: [] });
  },
  async update(id: string, patch: Partial<{ name: string; address: string; phone: string; isActive: boolean }>) {
    const updated = await branchRepository.update(id, patch as any);
    if (!updated) throw ApiError.notFound('Branch not found');
    return updated;
  },
  async remove(id: string) {
    const branch = await branchRepository.findById(id);
    if (!branch) throw ApiError.notFound('Branch not found');

    // Prevent deleting a branch that still has an active manager or vators assigned.
    if (branch.managerId) throw ApiError.conflict('Branch has a manager assigned');
    if (branch.vatorIds?.length) throw ApiError.conflict('Branch has vators assigned');

    await branchRepository.delete(id);
  },
};