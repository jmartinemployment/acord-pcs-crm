import { Router, Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

const router = Router();

// GET /api/dashboard/overview
router.get(
  '/overview',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [stats, renewals, claims, tasks, leads, activity] = await Promise.all([
        dashboardService.getOverviewStats(),
        dashboardService.getRenewalsPipeline(90),
        dashboardService.getClaimsSummary(),
        dashboardService.getTaskSummary(req.user?.userId),
        dashboardService.getLeadPipelineSummary(),
        dashboardService.getRecentActivity(10),
      ]);

      sendSuccess(res, {
        stats,
        renewals,
        claims,
        tasks,
        leads,
        recentActivity: activity,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/stats
router.get(
  '/stats',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await dashboardService.getOverviewStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/renewals
router.get(
  '/renewals',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number.parseInt(String(req.query.days) || '90', 10);
      const renewals = await dashboardService.getRenewalsPipeline(days);
      sendSuccess(res, renewals);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/claims
router.get(
  '/claims',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const claims = await dashboardService.getClaimsSummary();
      sendSuccess(res, claims);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/tasks
router.get(
  '/tasks',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await dashboardService.getTaskSummary(req.user?.userId);
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/pipeline
router.get(
  '/pipeline',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pipeline = await dashboardService.getLeadPipelineSummary();
      sendSuccess(res, pipeline);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/activity
router.get(
  '/activity',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number.parseInt(String(req.query.limit) || '20', 10);
      const activity = await dashboardService.getRecentActivity(limit);
      sendSuccess(res, activity);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
