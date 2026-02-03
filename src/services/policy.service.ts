import prisma from '../utils/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { CreatePolicyInput, UpdatePolicyInput, PolicyQuery, CoverageInput } from '../models/policy.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'policyNumber', 'effectiveDate', 'expirationDate', 'writtenPremium'];

function buildWhereClause(query: PolicyQuery): Prisma.PolicyWhereInput {
  const where: Prisma.PolicyWhereInput = {};

  if (query.search) {
    where.OR = [
      { policyNumber: { contains: query.search, mode: 'insensitive' } },
      { carrierName: { contains: query.search, mode: 'insensitive' } },
      { agencyName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.lineOfBusiness) {
    where.lineOfBusiness = query.lineOfBusiness;
  }

  if (query.policyStatus) {
    where.policyStatus = query.policyStatus;
  }

  if (query.carrierCode) {
    where.carrierCode = query.carrierCode;
  }

  if (query.effectiveDateFrom || query.effectiveDateTo) {
    where.effectiveDate = {};
    if (query.effectiveDateFrom) {
      where.effectiveDate.gte = new Date(query.effectiveDateFrom);
    }
    if (query.effectiveDateTo) {
      where.effectiveDate.lte = new Date(query.effectiveDateTo);
    }
  }

  if (query.expirationDateFrom || query.expirationDateTo) {
    where.expirationDate = {};
    if (query.expirationDateFrom) {
      where.expirationDate.gte = new Date(query.expirationDateFrom);
    }
    if (query.expirationDateTo) {
      where.expirationDate.lte = new Date(query.expirationDateTo);
    }
  }

  return where;
}

export async function listPolicies(query: PolicyQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS, 'effectiveDate');
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.policy.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        parties: {
          where: { isPrimaryInsured: true },
          include: {
            party: {
              select: { id: true, fullName: true, partyType: true },
            },
          },
          take: 1,
        },
        _count: {
          select: { vehicles: true, properties: true, claims: true },
        },
      },
    }),
    prisma.policy.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getPolicyById(id: string) {
  const policy = await prisma.policy.findUnique({
    where: { id },
    include: {
      parties: {
        include: {
          party: {
            select: {
              id: true,
              fullName: true,
              partyType: true,
              firstName: true,
              lastName: true,
              commercialName: true,
            },
          },
        },
      },
      vehicles: {
        include: {
          drivers: {
            include: {
              party: { select: { id: true, fullName: true } },
            },
          },
          additionalInterests: true,
        },
      },
      properties: {
        include: {
          additionalInterests: true,
        },
      },
      coverages: true,
      claims: {
        select: {
          id: true,
          claimNumber: true,
          claimStatus: true,
          lossDate: true,
          totalIncurred: true,
        },
      },
    },
  });

  if (!policy) {
    throw new NotFoundError('Policy not found');
  }

  return policy;
}

export async function createPolicy(data: CreatePolicyInput, createdBy?: string) {
  // Check for duplicate policy number
  const existing = await prisma.policy.findUnique({
    where: { policyNumber: data.policyNumber },
  });

  if (existing) {
    throw new ConflictError('Policy number already exists');
  }

  const policy = await prisma.policy.create({
    data: {
      policyNumber: data.policyNumber,
      lineOfBusiness: data.lineOfBusiness,
      effectiveDate: new Date(data.effectiveDate),
      expirationDate: new Date(data.expirationDate),
      policyStatus: data.policyStatus,
      writtenPremium: data.writtenPremium,
      annualPremium: data.annualPremium,
      policyLimit: data.policyLimit,
      carrierCode: data.carrierCode,
      carrierName: data.carrierName,
      producerId: data.producerId,
      producerName: data.producerName,
      agencyCode: data.agencyCode,
      agencyName: data.agencyName,
      paymentPlan: data.paymentPlan,
      billingType: data.billingType,
      parties: data.parties ? {
        create: data.parties.map(p => ({
          partyId: p.partyId,
          role: p.role,
          isPrimaryInsured: p.isPrimaryInsured,
          interestDesc: p.interestDesc,
        })),
      } : undefined,
      coverages: data.coverages ? {
        create: data.coverages,
      } : undefined,
    },
    include: {
      parties: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
      coverages: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Policy',
      entityId: policy.id,
      action: 'CREATE',
      userId: createdBy,
      newValues: { policyNumber: policy.policyNumber, lineOfBusiness: policy.lineOfBusiness },
    },
  });

  return policy;
}

export async function updatePolicy(id: string, data: UpdatePolicyInput, updatedBy?: string) {
  const existing = await prisma.policy.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Policy not found');
  }

  const policy = await prisma.policy.update({
    where: { id },
    data: {
      lineOfBusiness: data.lineOfBusiness,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      policyStatus: data.policyStatus,
      writtenPremium: data.writtenPremium,
      annualPremium: data.annualPremium,
      policyLimit: data.policyLimit,
      carrierCode: data.carrierCode,
      carrierName: data.carrierName,
      producerId: data.producerId,
      producerName: data.producerName,
      agencyCode: data.agencyCode,
      agencyName: data.agencyName,
      paymentPlan: data.paymentPlan,
      billingType: data.billingType,
    },
    include: {
      parties: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
      coverages: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Policy',
      entityId: policy.id,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues: { policyStatus: existing.policyStatus },
      newValues: { policyStatus: policy.policyStatus },
    },
  });

  return policy;
}

export async function deletePolicy(id: string, deletedBy?: string) {
  const existing = await prisma.policy.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Policy not found');
  }

  await prisma.policy.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      entityType: 'Policy',
      entityId: id,
      action: 'DELETE',
      userId: deletedBy,
      oldValues: { policyNumber: existing.policyNumber },
    },
  });
}

export async function addPolicyParty(policyId: string, data: { partyId: string; role: string; isPrimaryInsured?: boolean; interestDesc?: string }) {
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) throw new NotFoundError('Policy not found');

  const party = await prisma.party.findUnique({ where: { id: data.partyId } });
  if (!party) throw new NotFoundError('Party not found');

  return prisma.policyParty.create({
    data: {
      policyId,
      partyId: data.partyId,
      role: data.role as any,
      isPrimaryInsured: data.isPrimaryInsured || false,
      interestDesc: data.interestDesc,
    },
    include: {
      party: { select: { id: true, fullName: true } },
    },
  });
}

export async function addCoverage(policyId: string, data: CoverageInput) {
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) throw new NotFoundError('Policy not found');

  return prisma.coverage.create({
    data: {
      policyId,
      ...data,
    },
  });
}

export async function getUpcomingRenewals(daysAhead: number = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.policy.findMany({
    where: {
      policyStatus: 'ACTIVE',
      expirationDate: {
        gte: today,
        lte: futureDate,
      },
    },
    include: {
      parties: {
        where: { isPrimaryInsured: true },
        include: {
          party: { select: { id: true, fullName: true } },
        },
        take: 1,
      },
    },
    orderBy: { expirationDate: 'asc' },
  });
}
