// src/routes/order.routes.ts
import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../constants/roles';
import { createOrderSchema, listOrdersQuery } from '../validators/order.validator';

const router = Router();

router.post(
  '/orders',
  authenticate,
  requireRole(ROLES.CLIENT, ROLES.VATOR, ROLES.MANAGER, ROLES.ADMIN),
  validate({ body: createOrderSchema }),
  orderController.create
);

router.get(
  '/orders',
  authenticate,
  requireRole(ROLES.CLIENT),
  validate({ query: listOrdersQuery }),
  orderController.listMine
);

router.get(
  '/orders/:orderId',
  authenticate,
  requireRole(ROLES.CLIENT),
  orderController.getMine
);

// Vator-specific order creation is same handler with VATOR source.
router.post(
  '/vator/orders',
  authenticate,
  requireRole(ROLES.VATOR, ROLES.MANAGER, ROLES.ADMIN),
  validate({ body: createOrderSchema }),
  orderController.create
);

export default router;