// src/routes/management.routes.ts
import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../constants/roles';
import { listOrdersQuery, updateStatusSchema } from '../validators/order.validator';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.VATOR));

router.get('/orders', validate({ query: listOrdersQuery }), orderController.listForStaff);
router.get('/orders/:orderId', orderController.getForStaff);
router.patch(
  '/orders/:orderId/status',
  validate({ body: updateStatusSchema }),
  orderController.updateStatus
);

export default router;