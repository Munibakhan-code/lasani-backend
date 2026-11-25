import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/ApiResponse';
import { orderService } from '../services/order.service';
import { ORDER_SOURCE } from '../constants/orderSource';
import { getStringParam, getOptionalParam, getPagination } from '../utils/params';
import { OrderStatus } from '../constants/orderStatus';

export const orderController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.create(
      { ...req.body, orderSource: req.body.orderSource ?? ORDER_SOURCE.ONLINE },
      req.user!
    );
    return created(res, order);
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = getPagination(req);
    return ok(res, await orderService.listForClient(req.user!.id, page, limit));
  }),

  getMine: asyncHandler(async (req: Request, res: Response) => {
    const orderId = getStringParam(req, 'orderId');
    return ok(res, await orderService.getForClient(orderId, req.user!.id));
  }),

  listForStaff: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = getPagination(req);
    const status = getOptionalParam(req.query.status) as OrderStatus | undefined;
    const branchId = getOptionalParam(req.query.branchId);
    return ok(
      res,
      await orderService.listForStaff(req.user!, { status, branchId }, page, limit)
    );
  }),

  getForStaff: asyncHandler(async (req: Request, res: Response) => {
    const orderId = getStringParam(req, 'orderId');
    return ok(res, await orderService.getForStaff(orderId, req.user!));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const orderId = getStringParam(req, 'orderId');
    return ok(res, await orderService.updateStatus(orderId, req.body.status, req.user!));
  }),
};