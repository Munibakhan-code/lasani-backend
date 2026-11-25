import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/ApiResponse';
import { userService } from '../services/user.service';
import { getStringParam, getOptionalParam, getPagination } from '../utils/params';
import { Role } from '../constants/roles';

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = getPagination(req);
    const filter = {
      role: getOptionalParam(req.query.role) as Role | undefined,
      branchId: getOptionalParam(req.query.branchId),
      q: getOptionalParam(req.query.q),
    };
    return ok(res, await userService.list(filter, page, limit));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    return ok(res, await userService.getById(id));
  }),

  create: asyncHandler(async (req: Request, res: Response) =>
    created(res, await userService.create(req.body))
  ),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    return ok(res, await userService.update(id, req.body));
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    return ok(res, await userService.changePassword(id, req.body.password));
  }),

  setStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    return ok(res, await userService.setStatus(id, req.body.isActive));
  }),
};