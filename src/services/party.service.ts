import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { CreatePartyInput, UpdatePartyInput, PartyQuery } from '../models/party.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'fullName', 'lastName', 'firstName'];

function buildWhereClause(query: PartyQuery): Prisma.PartyWhereInput {
  const where: Prisma.PartyWhereInput = { isActive: true };

  if (query.partyType) {
    where.partyType = query.partyType;
  }

  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { commercialName: { contains: query.search, mode: 'insensitive' } },
      { taxId: { contains: query.search } },
      { emails: { some: { emailAddress: { contains: query.search, mode: 'insensitive' } } } },
      { phones: { some: { phoneNumber: { contains: query.search } } } },
    ];
  }

  return where;
}

export async function listParties(query: PartyQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS);
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.party.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        addresses: { where: { isPrimary: true }, take: 1 },
        phones: { where: { isPrimary: true }, take: 1 },
        emails: { where: { isPrimary: true }, take: 1 },
      },
    }),
    prisma.party.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getPartyById(id: string) {
  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      addresses: true,
      phones: true,
      emails: true,
      policyParties: {
        include: {
          policy: {
            select: {
              id: true,
              policyNumber: true,
              lineOfBusiness: true,
              policyStatus: true,
              effectiveDate: true,
              expirationDate: true,
            },
          },
        },
      },
      claimParties: {
        include: {
          claim: {
            select: {
              id: true,
              claimNumber: true,
              claimStatus: true,
              lossDate: true,
            },
          },
        },
      },
      bondParties: {
        include: {
          bond: {
            select: {
              id: true,
              bondNumber: true,
              bondType: true,
              bondStatus: true,
            },
          },
        },
      },
    },
  });

  if (!party) {
    throw new NotFoundError('Party not found');
  }

  return party;
}

export async function createParty(data: CreatePartyInput, createdBy?: string) {
  const fullName = data.partyType === 'PERSON'
    ? `${data.firstName} ${data.lastName}`.trim()
    : data.commercialName || data.dba || '';

  const party = await prisma.party.create({
    data: {
      partyType: data.partyType,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      prefix: data.prefix,
      suffix: data.suffix,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender,
      commercialName: data.commercialName,
      dba: data.dba,
      legalEntityType: data.legalEntityType,
      fullName,
      taxIdType: data.taxIdType,
      taxId: data.taxId,
      addresses: data.addresses ? {
        create: data.addresses,
      } : undefined,
      phones: data.phones ? {
        create: data.phones,
      } : undefined,
      emails: data.emails ? {
        create: data.emails,
      } : undefined,
    },
    include: {
      addresses: true,
      phones: true,
      emails: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Party',
      entityId: party.id,
      action: 'CREATE',
      userId: createdBy,
      newValues: party as unknown as Prisma.JsonObject,
    },
  });

  return party;
}

export async function updateParty(id: string, data: UpdatePartyInput, updatedBy?: string) {
  const existing = await prisma.party.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Party not found');
  }

  const fullName = data.partyType === 'PERSON' || existing.partyType === 'PERSON'
    ? `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}`.trim()
    : data.commercialName || existing.commercialName || data.dba || existing.dba || '';

  const party = await prisma.party.update({
    where: { id },
    data: {
      partyType: data.partyType,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      prefix: data.prefix,
      suffix: data.suffix,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      commercialName: data.commercialName,
      dba: data.dba,
      legalEntityType: data.legalEntityType,
      fullName,
      taxIdType: data.taxIdType,
      taxId: data.taxId,
    },
    include: {
      addresses: true,
      phones: true,
      emails: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Party',
      entityId: party.id,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues: existing as unknown as Prisma.JsonObject,
      newValues: party as unknown as Prisma.JsonObject,
    },
  });

  return party;
}

export async function deleteParty(id: string, deletedBy?: string) {
  const existing = await prisma.party.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Party not found');
  }

  // Soft delete
  await prisma.party.update({
    where: { id },
    data: { isActive: false },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Party',
      entityId: id,
      action: 'DELETE',
      userId: deletedBy,
      oldValues: existing as unknown as Prisma.JsonObject,
    },
  });
}

export async function addAddress(partyId: string, data: { addressType?: string; line1?: string; line2?: string; city?: string; stateProvince?: string; postalCode?: string; county?: string; country?: string; isPrimary?: boolean }) {
  const party = await prisma.party.findUnique({ where: { id: partyId } });
  if (!party) throw new NotFoundError('Party not found');

  if (data.isPrimary) {
    await prisma.address.updateMany({
      where: { partyId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.address.create({
    data: {
      partyId,
      addressType: (data.addressType as any) || 'RESIDENCE',
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      stateProvince: data.stateProvince,
      postalCode: data.postalCode,
      county: data.county,
      country: data.country || 'US',
      isPrimary: data.isPrimary || false,
    },
  });
}

export async function addPhone(partyId: string, data: { phoneType?: string; phoneNumber: string; extension?: string; isPrimary?: boolean }) {
  const party = await prisma.party.findUnique({ where: { id: partyId } });
  if (!party) throw new NotFoundError('Party not found');

  if (data.isPrimary) {
    await prisma.phone.updateMany({
      where: { partyId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.phone.create({
    data: {
      partyId,
      phoneType: (data.phoneType as any) || 'HOME',
      phoneNumber: data.phoneNumber,
      extension: data.extension,
      isPrimary: data.isPrimary || false,
    },
  });
}

export async function addEmail(partyId: string, data: { emailType?: string; emailAddress: string; isPrimary?: boolean }) {
  const party = await prisma.party.findUnique({ where: { id: partyId } });
  if (!party) throw new NotFoundError('Party not found');

  if (data.isPrimary) {
    await prisma.email.updateMany({
      where: { partyId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.email.create({
    data: {
      partyId,
      emailType: (data.emailType as any) || 'PERSONAL',
      emailAddress: data.emailAddress,
      isPrimary: data.isPrimary || false,
    },
  });
}
