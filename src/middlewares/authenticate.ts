import { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/user.model';
import { ERROR_CODES } from '../constants/errorCodes';

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Missing access token');

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new ApiError(401, ERROR_CODES.INVALID_TOKEN, 'Invalid or expired access token');
    }

    // Re-fetch user to reflect role/branch/active changes immediately.
    const user = await User.findById(payload.sub).lean();
    if (!user || !user.isActive) throw ApiError.unauthorized('Account not active');

    req.user = {
      id: String(user._id),
      role: user.role,
      branchId: user.branchId ? String(user.branchId) : null,
      email: user.email,
    };
    next();
  } catch (err) {
    next(err);
  }
};