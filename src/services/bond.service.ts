import prisma from '../utils/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { CreateBondInput, UpdateBondInput, BondQuery, BondPartyInput } from '../models/bond.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'bondNumber', 'effectiveDate', 'expirationDate', 'penaltyAmount'];

function buildWhereClause(query: BondQuery): Prisma.SuretyBondWhereInput {
  const where: Prisma.SuretyBondWhereInput = {};

  if (query.search) {
    where.OR = [
      { bondNumber: { contains: query.search, mode: 'insensitive' } },
      { projectName: { contains: query.search, mode: 'insensitive' } },
      { suretyCarrier: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.bondType) {
    where.bondType = query.bondType;
  }

  if (query.bondStatus) {
    where.bondStatus = query.bondStatus;
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

export async function listBonds(query: BondQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS, 'effectiveDate');
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.suretyBond.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        parties: {
          include: {
            party: { select: { id: true, fullName: true, partyType: true } },
          },
        },
      },
    }),
    prisma.suretyBond.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getBondById(id: string) {
  const bond = await prisma.suretyBond.findUnique({
    where: { id },
    include: {
      parties: {
        include: {
          party: {
            select: {
              id: true,
              fullName: true,
              partyType: true,
              commercialName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      attachments: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!bond) {
    throw new NotFoundError('Bond not found');
  }

  return bond;
}

export async function createBond(data: CreateBondInput, createdBy?: string) {
  const existing = await prisma.suretyBond.findUnique({
    where: { bondNumber: data.bondNumber },
  });

  if (existing) {
    throw new ConflictError('Bond number already exists');
  }

  const bond = await prisma.suretyBond.create({
    data: {
      bondNumber: data.bondNumber,
      bondType: data.bondType,
      bondSubType: data.bondSubType,
      penaltyAmount: data.penaltyAmount,
      bondAmount: data.bondAmount,
      premiumAmount: data.premiumAmount,
      effectiveDate: new Date(data.effectiveDate),
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      bondStatus: data.bondStatus,
      suretyCarrier: data.suretyCarrier,
      suretyCarrierCode: data.suretyCarrierCode,
      contractDescription: data.contractDescription,
      contractAmount: data.contractAmount,
      projectName: data.projectName,
      projectAddress: data.projectAddress,
      projectCity: data.projectCity,
      projectState: data.projectState,
      parties: data.parties ? {
        create: data.parties.map(p => ({
          partyId: p.partyId,
          role: p.role as any,
        })),
      } : undefined,
    },
    include: {
      parties: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'SuretyBond',
      entityId: bond.id,
      action: 'CREATE',
      userId: createdBy,
      newValues: { bondNumber: bond.bondNumber, bondType: bond.bondType },
    },
  });

  return bond;
}

export async function updateBond(id: string, data: UpdateBondInput, updatedBy?: string) {
  const existing = await prisma.suretyBond.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Bond not found');
  }

  const bond = await prisma.suretyBond.update({
    where: { id },
    data: {
      bondType: data.bondType,
      bondSubType: data.bondSubType,
      penaltyAmount: data.penaltyAmount,
      bondAmount: data.bondAmount,
      premiumAmount: data.premiumAmount,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      bondStatus: data.bondStatus,
      suretyCarrier: data.suretyCarrier,
      suretyCarrierCode: data.suretyCarrierCode,
      contractDescription: data.contractDescription,
      contractAmount: data.contractAmount,
      projectName: data.projectName,
      projectAddress: data.projectAddress,
      projectCity: data.projectCity,
      projectState: data.projectState,
    },
    include: {
      parties: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'SuretyBond',
      entityId: bond.id,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues: { bondStatus: existing.bondStatus },
      newValues: { bondStatus: bond.bondStatus },
    },
  });

  return bond;
}

export async function deleteBond(id: string, deletedBy?: string) {
  const existing = await prisma.suretyBond.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Bond not found');
  }

  await prisma.suretyBond.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      entityType: 'SuretyBond',
      entityId: id,
      action: 'DELETE',
      userId: deletedBy,
      oldValues: { bondNumber: existing.bondNumber },
    },
  });
}

export async function addBondParty(bondId: string, data: BondPartyInput) {
  const bond = await prisma.suretyBond.findUnique({ where: { id: bondId } });
  if (!bond) throw new NotFoundError('Bond not found');

  const party = await prisma.party.findUnique({ where: { id: data.partyId } });
  if (!party) throw new NotFoundError('Party not found');

  return prisma.bondParty.create({
    data: {
      bondId,
      partyId: data.partyId,
      role: data.role as any,
    },
    include: {
      party: { select: { id: true, fullName: true } },
    },
  });
}

export async function getExpiringBonds(daysAhead: number = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.suretyBond.findMany({
    where: {
      bondStatus: 'ACTIVE',
      expirationDate: {
        gte: today,
        lte: futureDate,
      },
    },
    include: {
      parties: {
        where: { role: 'PRINCIPAL' },
        include: {
          party: { select: { id: true, fullName: true } },
        },
        take: 1,
      },
    },
    orderBy: { expirationDate: 'asc' },
  });
}
