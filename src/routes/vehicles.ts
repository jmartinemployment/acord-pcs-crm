import { Router, Request, Response, NextFunction } from 'express';
import * as vehicleService from '../services/vehicle.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
  vehicleDriverSchema,
} from '../models/vehicle.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/vehicles
router.get(
  '/',
  validateQuery(vehicleQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await vehicleService.listVehicles(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/vehicles/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id as string);
      sendSuccess(res, vehicle);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/vehicles
router.post(
  '/',
  validateBody(createVehicleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await vehicleService.createVehicle(req.body, req.user?.userId);
      sendCreated(res, vehicle);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/vehicles/:id
router.patch(
  '/:id',
  validateBody(updateVehicleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await vehicleService.updateVehicle(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, vehicle);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/vehicles/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await vehicleService.deleteVehicle(req.params.id as string, req.user?.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/vehicles/:id/drivers
router.post(
  '/:id/drivers',
  validateBody(vehicleDriverSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driver = await vehicleService.addDriver(req.params.id as string, req.body);
      sendCreated(res, driver);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/vehicles/:vehicleId/drivers/:partyId
router.delete(
  '/:vehicleId/drivers/:partyId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await vehicleService.removeDriver(req.params.vehicleId as string, req.params.partyId as string);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
