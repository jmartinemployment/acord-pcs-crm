import { Router, Request, Response, NextFunction } from 'express';
import * as policyService from '../services/policy.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createPolicySchema,
  updatePolicySchema,
  policyQuerySchema,
  policyPartySchema,
  coverageSchema,
} from '../models/policy.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/policies
router.get(
  '/',
  validateQuery(policyQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await policyService.listPolicies(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/policies/renewals
router.get(
  '/renewals',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number.parseInt(String(req.query.days) || '30', 10);
      const renewals = await policyService.getUpcomingRenewals(days);
      sendSuccess(res, renewals);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/policies/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const policy = await policyService.getPolicyById(req.params.id as string);
      sendSuccess(res, policy);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/policies
router.post(
  '/',
  validateBody(createPolicySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const policy = await policyService.createPolicy(req.body, req.user?.userId);
      sendCreated(res, policy);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/policies/:id
router.patch(
  '/:id',
  validateBody(updatePolicySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const policy = await policyService.updatePolicy(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, policy);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/policies/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await policyService.deletePolicy(req.params.id as string, req.user?.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/policies/:id/parties
router.post(
  '/:id/parties',
  validateBody(policyPartySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const policyParty = await policyService.addPolicyParty(req.params.id as string, req.body);
      sendCreated(res, policyParty);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/policies/:id/coverages
router.post(
  '/:id/coverages',
  validateBody(coverageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coverage = await policyService.addCoverage(req.params.id as string, req.body);
      sendCreated(res, coverage);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
