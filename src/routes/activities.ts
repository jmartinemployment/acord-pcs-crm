import { Router, Request, Response, NextFunction } from 'express';
import * as activityService from '../services/activity.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
  completeActivitySchema,
} from '../models/activity.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/activities
router.get(
  '/',
  validateQuery(activityQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await activityService.listActivities(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/upcoming
router.get(
  '/upcoming',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number.parseInt(String(req.query.days) || '7', 10);
      const activities = await activityService.getUpcomingActivities(
        req.user?.userId,
        days
      );
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/overdue
router.get(
  '/overdue',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activities = await activityService.getOverdueActivities(req.user?.userId);
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await activityService.getActivityById(req.params.id as string);
      sendSuccess(res, activity);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/activities
router.post(
  '/',
  validateBody(createActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await activityService.createActivity(
        req.body,
        req.user?.userId
      );
      sendCreated(res, activity);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/activities/:id
router.patch(
  '/:id',
  validateBody(updateActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await activityService.updateActivity(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, activity);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/activities/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await activityService.deleteActivity(req.params.id as string);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/activities/:id/complete
router.post(
  '/:id/complete',
  validateBody(completeActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await activityService.completeActivity(req.params.id as string, req.body);
      sendSuccess(res, activity);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
