import { Router, Request, Response, NextFunction } from 'express';
import * as claimService from '../services/claim.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createClaimSchema,
  updateClaimSchema,
  claimQuerySchema,
  claimPaymentSchema,
} from '../models/claim.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/claims
router.get(
  '/',
  validateQuery(claimQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await claimService.listClaims(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/claims/open
router.get(
  '/open',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const claims = await claimService.getOpenClaims();
      sendSuccess(res, claims);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/claims/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await claimService.getClaimById(req.params.id as string);
      sendSuccess(res, claim);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/claims
router.post(
  '/',
  validateBody(createClaimSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await claimService.createClaim(req.body, req.user?.userId);
      sendCreated(res, claim);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/claims/:id
router.patch(
  '/:id',
  validateBody(updateClaimSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await claimService.updateClaim(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, claim);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/claims/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await claimService.deleteClaim(req.params.id as string, req.user?.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/claims/:id/payments
router.get(
  '/:id/payments',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await claimService.getClaimById(req.params.id as string);
      sendSuccess(res, claim.payments);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/claims/:id/payments
router.post(
  '/:id/payments',
  validateBody(claimPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await claimService.addClaimPayment(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendCreated(res, payment);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
