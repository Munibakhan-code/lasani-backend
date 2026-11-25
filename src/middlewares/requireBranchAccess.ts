import { RequestHandler } from 'express';
import { ROLES } from '../constants/roles';
import { ApiError } from '../utils/ApiError';
import { ERROR_CODES } from '../constants/errorCodes';

/**
 * Ensures the authenticated user can access the requested branch.
 * - ADMIN: any branch
 * - MANAGER/VATOR: only their own branch
 * - CLIENT: any active branch (read-only public access is separate)
 *
 * Reads branchId from params/body/query but ONLY uses it for the resource lookup,
 * never for authorization. Authorization is based on req.user.branchId.
 */
export const requireBranchAccess =
  (opts: { branchIdSource?: 'params' | 'body' | 'query'; paramName?: string } = {}): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());

    const source = opts.branchIdSource ?? 'params';
    const paramName = opts.paramName ?? 'branchId';
    const requested = (req[source] as any)?.[paramName] ?? req.body?.branchId ?? req.query?.branchId;

    if (!requested) return next(ApiError.badRequest('branchId is required'));

    const { role, branchId } = req.user;

    if (role === ROLES.ADMIN) return next();

    if (role === ROLES.MANAGER || role === ROLES.VATOR) {
      if (!branchId || String(branchId) !== String(requested)) {
        return next(ApiError.forbidden('Branch access denied', ERROR_CODES.BRANCH_ACCESS_DENIED));
      }
      return next();
    }

    // CLIENT: allowed only for their own online orders (checked at service level).
    return next();
  };