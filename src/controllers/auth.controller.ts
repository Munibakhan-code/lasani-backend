// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/ApiResponse';
import { authService } from '../services/auth.service';
import { env } from '../config/env';

const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    domain: env.isProd ? env.COOKIE_DOMAIN : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.refreshToken);
    return ok(res, { user: result.user, accessToken: result.accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return ok(res, { ok: true });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await authService.me(req.user!.id));
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token', code: 'UNAUTHORIZED' });
    const tokens = await authService.refresh(token);
    setRefreshCookie(res, tokens.refreshToken);
    return ok(res, { accessToken: tokens.accessToken });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    return ok(res, { ok: true });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    return ok(res, { ok: true });
  }),
};