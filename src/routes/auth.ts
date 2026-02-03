import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { validateBody } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../models/auth.schema';
import { sendSuccess, sendCreated } from '../utils/response';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.register(req.body);
      sendCreated(res, { user, message: 'Registration successful' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(
        req.body,
        req.headers['user-agent'],
        req.ip
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile(req.user!.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/auth/me
router.patch(
  '/me',
  authenticate,
  validateBody(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      sendSuccess(res, { message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.forgotPassword(req.body.email);
      sendSuccess(res, {
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, { message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
