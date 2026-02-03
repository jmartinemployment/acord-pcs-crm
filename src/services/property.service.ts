import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { CreatePropertyInput, UpdatePropertyInput, PropertyQuery, PropertyAdditionalInterestInput } from '../models/property.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'locationNumber', 'buildingValue', 'state', 'city'];

function buildWhereClause(query: PropertyQuery): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { isActive: true };

  if (query.policyId) {
    where.policyId = query.policyId;
  }

  if (query.state) {
    where.state = query.state;
  }

  if (query.city) {
    where.city = { contains: query.city, mode: 'insensitive' };
  }

  if (query.propertyType) {
    where.propertyType = query.propertyType;
  }

  return where;
}

export async function listProperties(query: PropertyQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS, 'createdAt');
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        policy: {
          select: { id: true, policyNumber: true },
        },
        _count: {
          select: { additionalInterests: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      policy: {
        select: {
          id: true,
          policyNumber: true,
          lineOfBusiness: true,
          effectiveDate: true,
          expirationDate: true,
        },
      },
      additionalInterests: true,
    },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  return property;
}

export async function createProperty(data: CreatePropertyInput, createdBy?: string) {
  const policy = await prisma.policy.findUnique({ where: { id: data.policyId } });
  if (!policy) throw new NotFoundError('Policy not found');

  const property = await prisma.property.create({
    data: {
      policyId: data.policyId,
      locationNumber: data.locationNumber,
      buildingNumber: data.buildingNumber,
      propertyType: data.propertyType,
      occupancyType: data.occupancyType,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      county: data.county,
      constructionType: data.constructionType,
      roofType: data.roofType,
      yearBuilt: data.yearBuilt,
      squareFootage: data.squareFootage,
      numberOfStories: data.numberOfStories,
      numberOfUnits: data.numberOfUnits,
      protectionClass: data.protectionClass,
      distanceToFireStation: data.distanceToFireStation,
      distanceToHydrant: data.distanceToHydrant,
      sprinklered: data.sprinklered,
      alarmType: data.alarmType,
      buildingValue: data.buildingValue,
      contentsValue: data.contentsValue,
      businessIncomeValue: data.businessIncomeValue,
      additionalInterests: data.additionalInterests ? {
        create: data.additionalInterests,
      } : undefined,
    },
    include: {
      policy: { select: { id: true, policyNumber: true } },
      additionalInterests: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Property',
      entityId: property.id,
      action: 'CREATE',
      userId: createdBy,
      newValues: { address: property.address, policyId: property.policyId },
    },
  });

  return property;
}

export async function updateProperty(id: string, data: UpdatePropertyInput, updatedBy?: string) {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Property not found');

  const property = await prisma.property.update({
    where: { id },
    data: {
      locationNumber: data.locationNumber,
      buildingNumber: data.buildingNumber,
      propertyType: data.propertyType,
      occupancyType: data.occupancyType,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      county: data.county,
      constructionType: data.constructionType,
      roofType: data.roofType,
      yearBuilt: data.yearBuilt,
      squareFootage: data.squareFootage,
      numberOfStories: data.numberOfStories,
      numberOfUnits: data.numberOfUnits,
      protectionClass: data.protectionClass,
      distanceToFireStation: data.distanceToFireStation,
      distanceToHydrant: data.distanceToHydrant,
      sprinklered: data.sprinklered,
      alarmType: data.alarmType,
      buildingValue: data.buildingValue,
      contentsValue: data.contentsValue,
      businessIncomeValue: data.businessIncomeValue,
    },
    include: {
      policy: { select: { id: true, policyNumber: true } },
      additionalInterests: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Property',
      entityId: property.id,
      action: 'UPDATE',
      userId: updatedBy,
    },
  });

  return property;
}

export async function deleteProperty(id: string, deletedBy?: string) {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Property not found');

  await prisma.property.update({
    where: { id },
    data: { isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Property',
      entityId: id,
      action: 'DELETE',
      userId: deletedBy,
    },
  });
}

export async function addMortgagee(propertyId: string, data: PropertyAdditionalInterestInput) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new NotFoundError('Property not found');

  return prisma.propertyAdditionalInterest.create({
    data: {
      propertyId,
      ...data,
    },
  });
}

export async function removeMortgagee(mortgageeId: string) {
  await prisma.propertyAdditionalInterest.delete({
    where: { id: mortgageeId },
  });
}
