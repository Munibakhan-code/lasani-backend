// src/repositories/branch.repository.ts
import { Branch, IBranch } from '../models/branch.model';

export const branchRepository = {
  list: (filter: Record<string, unknown>) => Branch.find(filter).sort({ createdAt: -1 }).lean().exec(),
  findById: (id: string) => Branch.findById(id).lean().exec(),
  create: (data: Partial<IBranch>) => Branch.create(data),
  update: (id: string, patch: Partial<IBranch>) =>
    Branch.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean().exec(),
  delete: (id: string) => Branch.findByIdAndDelete(id).lean().exec(),
};