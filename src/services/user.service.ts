// src/services/user.service.ts
import { User } from '../models/user.model';
import { userRepository } from '../repositories/user.repository';
import { branchRepository } from '../repositories/branch.repository';
import { ApiError } from '../utils/ApiError';
import { hashPassword } from '../utils/password';
import { ASSIGNABLE_BY_ADMIN, Role, ROLES } from '../constants/roles';

export const userService = {
  async list(filter: { role?: Role; branchId?: string; q?: string }, page = 1, limit = 20) {
    const query: Record<string, unknown> = {};
    if (filter.role) query.role = filter.role;
    if (filter.branchId) query.branchId = filter.branchId;
    if (filter.q) query.$or = [
      { name: new RegExp(filter.q, 'i') },
      { email: new RegExp(filter.q, 'i') },
    ];
    const skip = (page - 1) * limit;
    const [items, total] = await userRepository.list(query, skip, limit);
    return { items, total, page, limit };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async create(input: { name: string; email: string; phone?: string; password: string; role: Role; branchId?: string | null }) {
    if (!ASSIGNABLE_BY_ADMIN.includes(input.role)) {
      throw ApiError.badRequest(`Role ${input.role} cannot be created here`);
    }

    const branchId = input.role === ROLES.ADMIN ? null : input.branchId ?? null;
    if (input.role !== ROLES.ADMIN) {
      if (!branchId) throw ApiError.badRequest('branchId is required for MANAGER/VATOR');
      const branch = await branchRepository.findById(branchId);
      if (!branch) throw ApiError.badRequest('Branch does not exist');
      if (!branch.isActive) throw ApiError.badRequest('Branch is not active');
    }

    const exists = await User.findOne({ email: input.email.toLowerCase() }).lean();
    if (exists) throw ApiError.conflict('Email already in use');

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash,
      role: input.role,
      branchId: branchId as any,
      isActive: true,
    });

    // Link manager/vator to branch.
    if (input.role === ROLES.MANAGER && branchId) {
      await branchRepository.update(branchId, { managerId: user._id as any });
    }
    if (input.role === ROLES.VATOR && branchId) {
      const branch = await branchRepository.findById(branchId);
      const vatorIds = [...(branch?.vatorIds ?? []), user._id];
      await branchRepository.update(branchId, { vatorIds: vatorIds as any });
    }

    return user;
  },

  async update(id: string, patch: { name?: string; phone?: string; isActive?: boolean; branchId?: string }) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');

    // A MANAGER/VATOR can never move themselves to another branch via this API.
    if ((user.role === ROLES.MANAGER || user.role === ROLES.VATOR) && patch.branchId) {
      const branch = await branchRepository.findById(patch.branchId);
      if (!branch) throw ApiError.badRequest('Branch does not exist');
    }

    return userRepository.update(id, patch as any);
  },

  async changePassword(id: string, newPassword: string) {
    const hash = await hashPassword(newPassword);
    const updated = await userRepository.update(id, { passwordHash: hash } as any);
    if (!updated) throw ApiError.notFound('User not found');
    return { ok: true };
  },

  async setStatus(id: string, isActive: boolean) {
    const updated = await userRepository.update(id, { isActive } as any);
    if (!updated) throw ApiError.notFound('User not found');
    return updated;
  },
};