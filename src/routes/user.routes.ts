// src/routes/user.routes.ts
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../constants/roles';
import { changePasswordSchema, createUserSchema, setStatusSchema, updateUserSchema } from '../validators/user.validator';
import { idParam } from '../validators/branch.validator';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN));

router.get('/', userController.list);
router.get('/:id', validate({ params: idParam }), userController.getById);
router.post('/', validate({ body: createUserSchema }), userController.create);
router.patch('/:id', validate({ params: idParam, body: updateUserSchema }), userController.update);
router.patch('/:id/password', validate({ params: idParam, body: changePasswordSchema }), userController.changePassword);
router.patch('/:id/status', validate({ params: idParam, body: setStatusSchema }), userController.setStatus);

export default router;