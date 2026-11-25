import { ApiError } from '../utils/ApiError';
import { ERROR_CODES } from '../constants/errorCodes';
import { hashPassword, verifyPassword } from '../utils/password';
import { userRepository } from '../repositories/user.repository';
import { tokenService } from './token.service';
import { emailService } from './email.service';
import { env } from '../config/env';
import { User } from '../models/user.model';
import crypto from 'crypto';

const resetTokens = new Map<string, { userId: string; exp: number }>();

export const authService = {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid credentials');
    if (!user.isActive) throw ApiError.forbidden('Account is inactive');

    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid credentials');

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = tokenService.issueTokens(user);
    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId ? String(user.branchId) : null,
      },
      ...tokens,
    };
  },

  async me(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async refresh(refreshToken: string) {
    const userId = tokenService.rotate(refreshToken);
    const user = await tokenService.userFromId(userId);
    return tokenService.issueTokens(user);
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmailWithPassword(email);
    // Always succeed to avoid user enumeration.
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { userId: String(user._id), exp: Date.now() + 30 * 60 * 1000 });

    const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await emailService.send({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 30 minutes.</p>`,
    });
  },

  async resetPassword(token: string, newPassword: string) {
    const entry = resetTokens.get(token);
    if (!entry || entry.exp < Date.now()) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }
    const hash = await hashPassword(newPassword);
    await userRepository.update(entry.userId, { passwordHash: hash } as any);
    resetTokens.delete(token);
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const parts = refreshToken.split('.');
      const payloadPart = parts[1];
      if (!payloadPart) return;

      const decoded = JSON.parse(
        Buffer.from(payloadPart, 'base64').toString('utf8')
      ) as { tokenId?: string };

      if (decoded?.tokenId) tokenService.revoke(decoded.tokenId);
    } catch {
      /* ignore malformed tokens on logout */
    }
  },
};