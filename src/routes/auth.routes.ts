// src/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { authLimiter } from '../middlewares/rateLimiter';
import { forgotPasswordSchema, loginSchema, refreshSchema, resetPasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/refresh', validate({ body: refreshSchema }), authController.refresh);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;