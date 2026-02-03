import { Router, Request, Response, NextFunction } from 'express';
import * as propertyService from '../services/property.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
  propertyAdditionalInterestSchema,
} from '../models/property.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/properties
router.get(
  '/',
  validateQuery(propertyQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await propertyService.listProperties(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/properties/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await propertyService.getPropertyById(req.params.id as string);
      sendSuccess(res, property);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/properties
router.post(
  '/',
  validateBody(createPropertySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await propertyService.createProperty(req.body, req.user?.userId);
      sendCreated(res, property);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/properties/:id
router.patch(
  '/:id',
  validateBody(updatePropertySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await propertyService.updateProperty(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, property);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/properties/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await propertyService.deleteProperty(req.params.id as string, req.user?.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/properties/:id/mortgagees
router.post(
  '/:id/mortgagees',
  validateBody(propertyAdditionalInterestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mortgagee = await propertyService.addMortgagee(req.params.id as string, req.body);
      sendCreated(res, mortgagee);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/properties/:propertyId/mortgagees/:mortgageeId
router.delete(
  '/:propertyId/mortgagees/:mortgageeId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await propertyService.removeMortgagee(req.params.mortgageeId as string);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
