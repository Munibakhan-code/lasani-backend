// src/routes/upload.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { ROLES } from '../constants/roles';
import { uploadSingleImage } from '../middlewares/upload';
import { uploadController } from '../controllers/upload.controller';

const router = Router();

router.post(
  '/uploads/image',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  uploadSingleImage,
  uploadController.uploadImage
);

router.delete(
  '/uploads/image',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  uploadController.deleteImage
);

export default router;