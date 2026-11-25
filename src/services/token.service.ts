// src/services/token.service.ts
import { Types } from 'mongoose';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { ERROR_CODES } from '../constants/errorCodes';
import { User } from '../models/user.model';

/**
 * Refresh-token rotation store.
 * Redis-ready: in Phase 2 replace Map with Redis (SETEX). Kept in-memory for now.
 */
const refreshStore = new Map<string, { userId: string; exp: number }>();

export const tokenService = {
  issueTokens(user: { _id: Types.ObjectId | string; role: any; branchId: any }) {
    const userId = String(user._id);
    const tokenId = new Types.ObjectId().toHexString();

    const accessToken = signAccessToken({
      sub: userId,
      role: user.role,
      branchId: user.branchId ? String(user.branchId) : null,
    });
    const refreshToken = signRefreshToken({ sub: userId, tokenId });

    refreshStore.set(tokenId, { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    return { accessToken, refreshToken };
  },

  rotate(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, ERROR_CODES.INVALID_TOKEN, 'Invalid refresh token');
    }
    const entry = refreshStore.get(payload.tokenId);
    if (!entry || entry.userId !== payload.sub || entry.exp < Date.now()) {
      throw new ApiError(401, ERROR_CODES.INVALID_TOKEN, 'Refresh token revoked or expired');
    }
    refreshStore.delete(payload.tokenId);
    return payload.sub;
  },

  revoke(tokenId: string) {
    refreshStore.delete(tokenId);
  },

  async userFromId(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user || !user.isActive) throw ApiError.unauthorized('Account not active');
    return user;
  },
};