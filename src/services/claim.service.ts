import prisma from '../utils/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { CreateClaimInput, UpdateClaimInput, ClaimQuery, ClaimPaymentInput } from '../models/claim.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'claimNumber', 'lossDate', 'reportedDate', 'totalIncurred'];

function buildWhereClause(query: ClaimQuery): Prisma.ClaimWhereInput {
  const where: Prisma.ClaimWhereInput = {};

  if (query.search) {
    where.OR = [
      { claimNumber: { contains: query.search, mode: 'insensitive' } },
      { lossDescription: { contains: query.search, mode: 'insensitive' } },
      { adjusterName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.claimStatus) {
    where.claimStatus = query.claimStatus;
  }

  if (query.policyId) {
    where.policyId = query.policyId;
  }

  if (query.lossDateFrom || query.lossDateTo) {
    where.lossDate = {};
    if (query.lossDateFrom) {
      where.lossDate.gte = new Date(query.lossDateFrom);
    }
    if (query.lossDateTo) {
      where.lossDate.lte = new Date(query.lossDateTo);
    }
  }

  return where;
}

export async function listClaims(query: ClaimQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS, 'lossDate');
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.claim.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        policy: {
          select: {
            id: true,
            policyNumber: true,
            lineOfBusiness: true,
          },
        },
        parties: {
          include: {
            party: { select: { id: true, fullName: true } },
          },
        },
        _count: {
          select: { payments: true },
        },
      },
    }),
    prisma.claim.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getClaimById(id: string) {
  const claim = await prisma.claim.findUnique({
    where: { id },
    include: {
      policy: {
        select: {
          id: true,
          policyNumber: true,
          lineOfBusiness: true,
          policyStatus: true,
          carrierName: true,
        },
      },
      parties: {
        include: {
          party: {
            select: {
              id: true,
              fullName: true,
              partyType: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
      attachments: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!claim) {
    throw new NotFoundError('Claim not found');
  }

  return claim;
}

export async function createClaim(data: CreateClaimInput, createdBy?: string) {
  // Verify policy exists
  const policy = await prisma.policy.findUnique({ where: { id: data.policyId } });
  if (!policy) {
    throw new NotFoundError('Policy not found');
  }

  // Check for duplicate claim number
  const existing = await prisma.claim.findUnique({
    where: { claimNumber: data.claimNumber },
  });

  if (existing) {
    throw new ConflictError('Claim number already exists');
  }

  const claim = await prisma.claim.create({
    data: {
      claimNumber: data.claimNumber,
      policyId: data.policyId,
      lossDate: new Date(data.lossDate),
      lossTime: data.lossTime,
      lossCauseCode: data.lossCauseCode,
      lossDescription: data.lossDescription,
      lossAddress: data.lossAddress,
      lossCity: data.lossCity,
      lossState: data.lossState,
      lossZip: data.lossZip,
      claimStatus: data.claimStatus,
      totalIncurred: data.totalIncurred,
      totalPaid: data.totalPaid,
      totalReserve: data.totalReserve,
      adjusterName: data.adjusterName,
      adjusterPhone: data.adjusterPhone,
      adjusterEmail: data.adjusterEmail || null,
      parties: data.parties ? {
        create: data.parties.map(p => ({
          partyId: p.partyId,
          role: p.role,
        })),
      } : undefined,
    },
    include: {
      policy: { select: { id: true, policyNumber: true } },
      parties: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Claim',
      entityId: claim.id,
      action: 'CREATE',
      userId: createdBy,
      newValues: { claimNumber: claim.claimNumber, policyId: claim.policyId },
    },
  });

  return claim;
}

export async function updateClaim(id: string, data: UpdateClaimInput, updatedBy?: string) {
  const existing = await prisma.claim.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Claim not found');
  }

  const updateData: Prisma.ClaimUpdateInput = {
    lossDate: data.lossDate ? new Date(data.lossDate) : undefined,
    lossTime: data.lossTime,
    lossCauseCode: data.lossCauseCode,
    lossDescription: data.lossDescription,
    lossAddress: data.lossAddress,
    lossCity: data.lossCity,
    lossState: data.lossState,
    lossZip: data.lossZip,
    claimStatus: data.claimStatus,
    totalIncurred: data.totalIncurred,
    totalPaid: data.totalPaid,
    totalReserve: data.totalReserve,
    adjusterName: data.adjusterName,
    adjusterPhone: data.adjusterPhone,
    adjusterEmail: data.adjusterEmail || null,
  };

  // Set closed date when status changes to CLOSED
  if (data.claimStatus === 'CLOSED' && existing.claimStatus !== 'CLOSED') {
    updateData.closedDate = new Date();
  }

  const claim = await prisma.claim.update({
    where: { id },
    data: updateData,
    include: {
      policy: { select: { id: true, policyNumber: true } },
      parties: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Claim',
      entityId: claim.id,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues: { claimStatus: existing.claimStatus },
      newValues: { claimStatus: claim.claimStatus },
    },
  });

  return claim;
}

export async function deleteClaim(id: string, deletedBy?: string) {
  const existing = await prisma.claim.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Claim not found');
  }

  await prisma.claim.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      entityType: 'Claim',
      entityId: id,
      action: 'DELETE',
      userId: deletedBy,
      oldValues: { claimNumber: existing.claimNumber },
    },
  });
}

export async function addClaimPayment(claimId: string, data: ClaimPaymentInput, _createdBy?: string) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId } });
  if (!claim) throw new NotFoundError('Claim not found');

  const payment = await prisma.claimPayment.create({
    data: {
      claimId,
      paymentDate: new Date(data.paymentDate),
      paymentAmount: data.paymentAmount,
      paymentType: data.paymentType,
      payeeName: data.payeeName,
      payeeType: data.payeeType,
      checkNumber: data.checkNumber,
      memo: data.memo,
    },
  });

  // Update claim totals
  const totalPaid = await prisma.claimPayment.aggregate({
    where: { claimId },
    _sum: { paymentAmount: true },
  });

  await prisma.claim.update({
    where: { id: claimId },
    data: { totalPaid: totalPaid._sum.paymentAmount || 0 },
  });

  return payment;
}

export async function getOpenClaims() {
  return prisma.claim.findMany({
    where: {
      claimStatus: { in: ['OPEN', 'REOPENED'] },
    },
    include: {
      policy: {
        select: {
          id: true,
          policyNumber: true,
          lineOfBusiness: true,
        },
      },
      parties: {
        where: { role: 'CLAIMANT' },
        include: {
          party: { select: { id: true, fullName: true } },
        },
        take: 1,
      },
    },
    orderBy: { lossDate: 'desc' },
  });
}
