// src/repositories/user.repository.ts
import { User, IUser } from '../models/user.model';

export const userRepository = {
  findByEmailWithPassword(email: string) {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  },
  findById: (id: string) => User.findById(id).exec(),
  findByIdWithPassword: (id: string) => User.findById(id).select('+passwordHash').exec(),
  create: (data: Partial<IUser>) => User.create(data),
  update: (id: string, patch: Partial<IUser>) =>
    User.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).exec(),
  list: (filter: Record<string, unknown>, skip: number, limit: number) =>
    Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      User.countDocuments(filter),
    ]),
};