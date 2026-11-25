import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/ApiResponse';
import { menuItemService } from '../services/menuItem.service';
import { getStringParam } from '../utils/params';
import { ROLES } from '../constants/roles';

export const menuItemController = {
  listByBranch: asyncHandler(async (req: Request, res: Response) => {
    const branchId = getStringParam(req, 'branchId');
    const includeInactive = req.user?.role !== ROLES.CLIENT;
    return ok(res, await menuItemService.listByBranch(branchId, includeInactive));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    return ok(res, await menuItemService.getById(id));
  }),

  create: asyncHandler(async (req: Request, res: Response) =>
    created(res, await menuItemService.create(req.body))
  ),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    return ok(res, await menuItemService.update(id, req.body));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    await menuItemService.remove(id);
    return ok(res, { ok: true });
  }),
};