// src/routes/branch.routes.ts
import { Router } from 'express';
import { branchController } from '../controllers/branch.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../constants/roles';
import { branchIdParam, createBranchSchema, updateBranchSchema } from '../validators/branch.validator';
import { requireBranchAccess } from '../middlewares/requireBranchAccess';

const router = Router();

// Public: active branches only.
router.get('/', branchController.listPublic);

// Authenticated: full list for ADMIN, own branch for MANAGER/VATOR.
router.get(
  '/manage',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.VATOR),
  branchController.listAll
);

router.get(
  '/:branchId',
  authenticate,
  requireBranchAccess({ branchIdSource: 'params', paramName: 'branchId' }),
  validate({ params: branchIdParam }),
  branchController.getById
);

router.post('/', authenticate, requireRole(ROLES.ADMIN), validate({ body: createBranchSchema }), branchController.create);

router.patch(
  '/:branchId',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  requireBranchAccess({ branchIdSource: 'params', paramName: 'branchId' }),
  validate({ params: branchIdParam, body: updateBranchSchema }),
  branchController.update
);

router.delete(
  '/:branchId',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate({ params: branchIdParam }),
  branchController.remove
);

export default router;