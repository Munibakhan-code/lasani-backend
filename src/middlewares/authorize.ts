import { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Generic guard: ensures a user is authenticated and passes predicate.
 * Never trust req.body.role / req.body.branchId — only req.user.
 */
export const authorize =
  (predicate: (req: Express.Request) => boolean, message = 'Forbidden'): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!predicate(req)) return next(ApiError.forbidden(message));
    next();
  };