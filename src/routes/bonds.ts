import { Router, Request, Response, NextFunction } from 'express';
import * as bondService from '../services/bond.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createBondSchema,
  updateBondSchema,
  bondQuerySchema,
  bondPartySchema,
} from '../models/bond.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/bonds
router.get(
  '/',
  validateQuery(bondQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await bondService.listBonds(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/bonds/expiring
router.get(
  '/expiring',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number.parseInt(String(req.query.days) || '30', 10);
      const bonds = await bondService.getExpiringBonds(days);
      sendSuccess(res, bonds);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/bonds/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bond = await bondService.getBondById(req.params.id as string);
      sendSuccess(res, bond);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/bonds
router.post(
  '/',
  validateBody(createBondSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bond = await bondService.createBond(req.body, req.user?.userId);
      sendCreated(res, bond);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/bonds/:id
router.patch(
  '/:id',
  validateBody(updateBondSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bond = await bondService.updateBond(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, bond);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/bonds/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await bondService.deleteBond(req.params.id as string, req.user?.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/bonds/:id/parties
router.post(
  '/:id/parties',
  validateBody(bondPartySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bondParty = await bondService.addBondParty(req.params.id as string, req.body);
      sendCreated(res, bondParty);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
