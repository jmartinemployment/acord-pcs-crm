import { Router, Request, Response, NextFunction } from 'express';
import * as leadService from '../services/lead.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  convertLeadSchema,
} from '../models/lead.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/leads
router.get(
  '/',
  validateQuery(leadQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.listLeads(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/leads/pipeline
router.get(
  '/pipeline',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pipeline = await leadService.getLeadPipeline();
      sendSuccess(res, pipeline);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/leads/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.getLeadById(req.params.id as string);
      sendSuccess(res, lead);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/leads
router.post(
  '/',
  validateBody(createLeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.createLead(req.body, req.user?.userId);
      sendCreated(res, lead);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/leads/:id
router.patch(
  '/:id',
  validateBody(updateLeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateLead(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, lead);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/leads/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await leadService.deleteLead(req.params.id as string, req.user?.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/leads/:id/convert
router.post(
  '/:id/convert',
  validateBody(convertLeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.convertLead(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
