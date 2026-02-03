import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { CreateActivityInput, UpdateActivityInput, ActivityQuery, CompleteActivityInput } from '../models/activity.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'subject'];

function buildWhereClause(query: ActivityQuery): Prisma.ActivityWhereInput {
  const where: Prisma.ActivityWhereInput = {};

  if (query.activityType) {
    where.activityType = query.activityType;
  }

  if (query.activityStatus) {
    where.activityStatus = query.activityStatus;
  }

  if (query.partyId) {
    where.partyId = query.partyId;
  }

  if (query.policyId) {
    where.policyId = query.policyId;
  }

  if (query.claimId) {
    where.claimId = query.claimId;
  }

  if (query.bondId) {
    where.bondId = query.bondId;
  }

  if (query.assignedTo) {
    where.assignedTo = query.assignedTo;
  }

  if (query.dueDateFrom || query.dueDateTo) {
    where.dueDate = {};
    if (query.dueDateFrom) {
      where.dueDate.gte = new Date(query.dueDateFrom);
    }
    if (query.dueDateTo) {
      where.dueDate.lte = new Date(query.dueDateTo);
    }
  }

  return where;
}

export async function listActivities(query: ActivityQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS, 'dueDate');
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        party: { select: { id: true, fullName: true } },
        policy: { select: { id: true, policyNumber: true } },
        claim: { select: { id: true, claimNumber: true } },
        bond: { select: { id: true, bondNumber: true } },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getActivityById(id: string) {
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      party: {
        select: {
          id: true,
          fullName: true,
          partyType: true,
        },
      },
      policy: {
        select: {
          id: true,
          policyNumber: true,
          lineOfBusiness: true,
        },
      },
      claim: {
        select: {
          id: true,
          claimNumber: true,
          claimStatus: true,
        },
      },
      bond: {
        select: {
          id: true,
          bondNumber: true,
          bondType: true,
        },
      },
    },
  });

  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  return activity;
}

export async function createActivity(data: CreateActivityInput, createdBy?: string) {
  const activity = await prisma.activity.create({
    data: {
      activityType: data.activityType,
      activityStatus: data.activityStatus,
      subject: data.subject,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      dueTime: data.dueTime,
      assignedTo: data.assignedTo,
      priority: data.priority,
      partyId: data.partyId,
      policyId: data.policyId,
      claimId: data.claimId,
      bondId: data.bondId,
      createdBy,
    },
    include: {
      party: { select: { id: true, fullName: true } },
      policy: { select: { id: true, policyNumber: true } },
      claim: { select: { id: true, claimNumber: true } },
      bond: { select: { id: true, bondNumber: true } },
    },
  });

  return activity;
}

export async function updateActivity(id: string, data: UpdateActivityInput, _updatedBy?: string) {
  const existing = await prisma.activity.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Activity not found');
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      activityType: data.activityType,
      activityStatus: data.activityStatus,
      subject: data.subject,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      dueTime: data.dueTime,
      assignedTo: data.assignedTo,
      priority: data.priority,
      partyId: data.partyId,
      policyId: data.policyId,
      claimId: data.claimId,
      bondId: data.bondId,
    },
    include: {
      party: { select: { id: true, fullName: true } },
      policy: { select: { id: true, policyNumber: true } },
      claim: { select: { id: true, claimNumber: true } },
      bond: { select: { id: true, bondNumber: true } },
    },
  });

  return activity;
}

export async function deleteActivity(id: string) {
  const existing = await prisma.activity.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Activity not found');
  }

  await prisma.activity.delete({ where: { id } });
}

export async function completeActivity(id: string, data: CompleteActivityInput) {
  const existing = await prisma.activity.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Activity not found');
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      activityStatus: 'COMPLETED',
      completedDate: data.completedDate ? new Date(data.completedDate) : new Date(),
      description: data.notes
        ? `${existing.description || ''}\n\n---\nCompletion Notes: ${data.notes}`.trim()
        : undefined,
    },
    include: {
      party: { select: { id: true, fullName: true } },
      policy: { select: { id: true, policyNumber: true } },
    },
  });

  return activity;
}

export async function getUpcomingActivities(userId?: string, daysAhead: number = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const where: Prisma.ActivityWhereInput = {
    activityStatus: { in: ['PENDING', 'SCHEDULED'] },
    dueDate: {
      gte: today,
      lte: futureDate,
    },
  };

  if (userId) {
    where.assignedTo = userId;
  }

  return prisma.activity.findMany({
    where,
    include: {
      party: { select: { id: true, fullName: true } },
      policy: { select: { id: true, policyNumber: true } },
      claim: { select: { id: true, claimNumber: true } },
    },
    orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
  });
}

export async function getOverdueActivities(userId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where: Prisma.ActivityWhereInput = {
    activityStatus: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] },
    dueDate: { lt: today },
  };

  if (userId) {
    where.assignedTo = userId;
  }

  return prisma.activity.findMany({
    where,
    include: {
      party: { select: { id: true, fullName: true } },
      policy: { select: { id: true, policyNumber: true } },
      claim: { select: { id: true, claimNumber: true } },
    },
    orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
  });
}
