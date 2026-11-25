// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import branchRoutes from './branch.routes';
import userRoutes from './user.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import managementRoutes from './management.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/branches', branchRoutes);
router.use('/', menuRoutes);        // includes /branches/:branchId/menu + /menu/*
router.use('/', orderRoutes);       // /orders, /vator/orders
router.use('/management', managementRoutes);
router.use('/', uploadRoutes);      // /uploads/image

export default router;