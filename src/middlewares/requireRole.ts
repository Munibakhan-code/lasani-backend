// src/middlewares/requireRole.ts
import { RequestHandler } from 'express';
import { Role } from '../constants/roles';
import { ApiError } from '../utils/ApiError';

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: ${roles.join(', ')}`));
    }
    next();
  };