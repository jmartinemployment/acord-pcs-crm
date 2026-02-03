import prisma from '../utils/prisma';

export async function getOverviewStats() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const thirtyDaysAhead = new Date();
  thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

  const [
    totalParties,
    totalPolicies,
    activePolicies,
    openClaims,
    totalBonds,
    activeBonds,
    newLeads,
    upcomingRenewals,
    overdueActivities,
    recentActivities,
  ] = await Promise.all([
    prisma.party.count({ where: { isActive: true } }),
    prisma.policy.count(),
    prisma.policy.count({ where: { policyStatus: 'ACTIVE' } }),
    prisma.claim.count({ where: { claimStatus: { in: ['OPEN', 'REOPENED'] } } }),
    prisma.suretyBond.count(),
    prisma.suretyBond.count({ where: { bondStatus: 'ACTIVE' } }),
    prisma.lead.count({ where: { leadStatus: 'NEW' } }),
    prisma.policy.count({
      where: {
        policyStatus: 'ACTIVE',
        expirationDate: { gte: today, lte: thirtyDaysAhead },
      },
    }),
    prisma.activity.count({
      where: {
        activityStatus: { in: ['PENDING', 'SCHEDULED'] },
        dueDate: { lt: today },
      },
    }),
    prisma.activity.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return {
    parties: {
      total: totalParties,
    },
    policies: {
      total: totalPolicies,
      active: activePolicies,
      upcomingRenewals,
    },
    claims: {
      open: openClaims,
    },
    bonds: {
      total: totalBonds,
      active: activeBonds,
    },
    leads: {
      new: newLeads,
    },
    activities: {
      overdue: overdueActivities,
      recentCount: recentActivities,
    },
  };
}

export async function getRenewalsPipeline(daysAhead: number = 90) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const renewals = await prisma.policy.findMany({
    where: {
      policyStatus: 'ACTIVE',
      expirationDate: { gte: today, lte: futureDate },
    },
    select: {
      id: true,
      policyNumber: true,
      lineOfBusiness: true,
      expirationDate: true,
      annualPremium: true,
      parties: {
        where: { isPrimaryInsured: true },
        include: {
          party: { select: { id: true, fullName: true } },
        },
        take: 1,
      },
    },
    orderBy: { expirationDate: 'asc' },
    take: 50,
  });

  // Group by time periods
  const now = today.getTime();
  const groups = {
    thisWeek: [] as typeof renewals,
    thisMonth: [] as typeof renewals,
    nextMonth: [] as typeof renewals,
    later: [] as typeof renewals,
  };

  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  const twoMonths = 60 * 24 * 60 * 60 * 1000;

  renewals.forEach(r => {
    const diff = r.expirationDate.getTime() - now;
    if (diff <= oneWeek) {
      groups.thisWeek.push(r);
    } else if (diff <= oneMonth) {
      groups.thisMonth.push(r);
    } else if (diff <= twoMonths) {
      groups.nextMonth.push(r);
    } else {
      groups.later.push(r);
    }
  });

  return groups;
}

export async function getClaimsSummary() {
  const [statusCounts, byLOB, recentClaims] = await Promise.all([
    prisma.claim.groupBy({
      by: ['claimStatus'],
      _count: { id: true },
      _sum: { totalIncurred: true },
    }),
    prisma.claim.findMany({
      where: { claimStatus: { in: ['OPEN', 'REOPENED'] } },
      select: {
        policy: { select: { lineOfBusiness: true } },
      },
    }),
    prisma.claim.findMany({
      where: { claimStatus: { in: ['OPEN', 'REOPENED'] } },
      select: {
        id: true,
        claimNumber: true,
        lossDate: true,
        claimStatus: true,
        totalIncurred: true,
        policy: {
          select: { policyNumber: true, lineOfBusiness: true },
        },
      },
      orderBy: { lossDate: 'desc' },
      take: 10,
    }),
  ]);

  // Count by LOB
  const lobCounts: Record<string, number> = {};
  byLOB.forEach(c => {
    const lob = c.policy.lineOfBusiness;
    lobCounts[lob] = (lobCounts[lob] || 0) + 1;
  });

  return {
    byStatus: statusCounts.map(s => ({
      status: s.claimStatus,
      count: s._count.id,
      totalIncurred: s._sum.totalIncurred || 0,
    })),
    byLineOfBusiness: Object.entries(lobCounts).map(([lob, count]) => ({
      lineOfBusiness: lob,
      count,
    })),
    recentClaims,
  };
}

export async function getTaskSummary(userId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where: any = {};
  if (userId) {
    where.assignedTo = userId;
  }

  const [overdue, dueToday, upcoming, byType] = await Promise.all([
    prisma.activity.count({
      where: {
        ...where,
        activityStatus: { in: ['PENDING', 'SCHEDULED'] },
        dueDate: { lt: today },
      },
    }),
    prisma.activity.count({
      where: {
        ...where,
        activityStatus: { in: ['PENDING', 'SCHEDULED'] },
        dueDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.activity.findMany({
      where: {
        ...where,
        activityStatus: { in: ['PENDING', 'SCHEDULED'] },
        dueDate: { gte: today },
      },
      select: {
        id: true,
        subject: true,
        activityType: true,
        dueDate: true,
        priority: true,
        party: { select: { id: true, fullName: true } },
        policy: { select: { id: true, policyNumber: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
      take: 10,
    }),
    prisma.activity.groupBy({
      by: ['activityType'],
      where: {
        ...where,
        activityStatus: { in: ['PENDING', 'SCHEDULED'] },
      },
      _count: { id: true },
    }),
  ]);

  return {
    overdue,
    dueToday,
    upcoming,
    byType: byType.map(t => ({
      type: t.activityType,
      count: t._count.id,
    })),
  };
}

export async function getLeadPipelineSummary() {
  const pipeline = await prisma.lead.groupBy({
    by: ['leadStatus'],
    _count: { id: true },
    _sum: { estimatedPremium: true },
  });

  const bySource = await prisma.lead.groupBy({
    by: ['leadSource'],
    where: { leadStatus: { notIn: ['WON', 'LOST'] } },
    _count: { id: true },
  });

  return {
    byStatus: pipeline.map(p => ({
      status: p.leadStatus,
      count: p._count.id,
      estimatedPremium: p._sum.estimatedPremium || 0,
    })),
    bySource: bySource.map(s => ({
      source: s.leadSource,
      count: s._count.id,
    })),
  };
}

export async function getRecentActivity(limit: number = 20) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      entityType: true,
      entityId: true,
      action: true,
      userName: true,
      createdAt: true,
    },
  });
}
