import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';
import { sendSuccess } from '../utils/response';
import { Prisma } from '@prisma/client';

const router = Router();

// GET /api/audit-logs
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skip, take, page, pageSize } = getPaginationParams(req.query);

      const where: Prisma.AuditLogWhereInput = {};

      if (req.query.entityType) {
        where.entityType = String(req.query.entityType);
      }

      if (req.query.entityId) {
        where.entityId = String(req.query.entityId);
      }

      if (req.query.action) {
        where.action = String(req.query.action);
      }

      if (req.query.userId) {
        where.userId = String(req.query.userId);
      }

      const [items, totalCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count({ where }),
      ]);

      sendSuccess(res, createPaginatedResponse(items, totalCount, page, pageSize));
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/audit-logs/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await prisma.auditLog.findUnique({
        where: { id: req.params.id as string },
      });

      if (!log) {
        res.status(404).json({ success: false, error: 'Audit log not found' });
        return;
      }

      sendSuccess(res, log);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/audit-logs/entity/:type/:id
router.get(
  '/entity/:type/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          entityType: req.params.type as string,
          entityId: req.params.id as string,
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
