import { Router } from 'express';
import { menuCategoryController } from '../controllers/menuCategory.controller';
import { menuItemController } from '../controllers/menuItem.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { requireBranchAccess } from '../middlewares/requireBranchAccess';
import { validate } from '../middlewares/validate';
import { ROLES } from '../constants/roles';
import { createCategorySchema, createItemSchema, updateCategorySchema, updateItemSchema } from '../validators/menu.validator';
import { idParam } from '../validators/branch.validator';
import { branchIdParam } from '../validators/branch.validator';

const router = Router();

/* Public-ish reads (still authenticated-friendly): */
router.get(
  '/branches/:branchId/menu',
  validate({ params: branchIdParam }),
  menuItemController.listByBranch
);
router.get(
  '/branches/:branchId/menu/categories',
  validate({ params: branchIdParam }),
  menuCategoryController.listByBranch
);
router.get(
  '/branches/:branchId/menu/items',
  validate({ params: branchIdParam }),
  menuItemController.listByBranch
);

/* Management */
router.post(
  '/menu/categories',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  requireBranchAccess({ branchIdSource: 'body', paramName: 'branchId' }),
  validate({ body: createCategorySchema }),
  menuCategoryController.create
);
router.patch(
  '/menu/categories/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  validate({ params: idParam, body: updateCategorySchema }),
  menuCategoryController.update
);
router.delete(
  '/menu/categories/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  validate({ params: idParam }),
  menuCategoryController.remove
);

router.post(
  '/menu/items',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  requireBranchAccess({ branchIdSource: 'body', paramName: 'branchId' }),
  validate({ body: createItemSchema }),
  menuItemController.create
);
router.get(
  '/menu/items',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.VATOR),
  menuItemController.listByBranch // expects ?branchId
);
router.get(
  '/menu/items/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.VATOR),
  validate({ params: idParam }),
  menuItemController.getById
);
router.patch(
  '/menu/items/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  validate({ params: idParam, body: updateItemSchema }),
  menuItemController.update
);
router.delete(
  '/menu/items/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  validate({ params: idParam }),
  menuItemController.remove
);

export default router;