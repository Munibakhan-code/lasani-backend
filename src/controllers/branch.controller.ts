import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/ApiResponse';
import { branchService } from '../services/branch.service';
import { getStringParam } from '../utils/params';

export const branchController = {
  listPublic: asyncHandler(async (_req: Request, res: Response) =>
    ok(res, await branchService.listPublic())
  ),

  listAll: asyncHandler(async (_req: Request, res: Response) =>
    ok(res, await branchService.listAll())
  ),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const branchId = getStringParam(req, 'branchId');
    return ok(res, await branchService.getById(branchId));
  }),

  create: asyncHandler(async (req: Request, res: Response) =>
    created(res, await branchService.create(req.body))
  ),

  update: asyncHandler(async (req: Request, res: Response) => {
    const branchId = getStringParam(req, 'branchId');
    return ok(res, await branchService.update(branchId, req.body));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const branchId = getStringParam(req, 'branchId');
    await branchService.remove(branchId);
    return ok(res, { ok: true });
  }),
};