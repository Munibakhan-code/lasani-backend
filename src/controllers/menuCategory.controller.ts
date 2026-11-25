import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/ApiResponse';
import { menuCategoryService } from '../services/menuCategory.service';
import { getStringParam } from '../utils/params';

export const menuCategoryController = {
  listByBranch: asyncHandler(async (req: Request, res: Response) => {
    const branchId = getStringParam(req, 'branchId');
    return ok(res, await menuCategoryService.listByBranch(branchId));
  }),

  create: asyncHandler(async (req: Request, res: Response) =>
    created(res, await menuCategoryService.create(req.body))
  ),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    return ok(res, await menuCategoryService.update(id, req.body));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req, 'id');
    await menuCategoryService.remove(id);
    return ok(res, { ok: true });
  }),
};