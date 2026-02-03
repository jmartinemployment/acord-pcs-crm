import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { CreateVehicleInput, UpdateVehicleInput, VehicleQuery, VehicleDriverInput } from '../models/vehicle.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'year', 'make', 'model'];

function buildWhereClause(query: VehicleQuery): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = { isActive: true };

  if (query.policyId) {
    where.policyId = query.policyId;
  }

  if (query.vin) {
    where.vin = { contains: query.vin, mode: 'insensitive' };
  }

  if (query.year) {
    where.year = parseInt(query.year);
  }

  if (query.make) {
    where.make = { contains: query.make, mode: 'insensitive' };
  }

  return where;
}

export async function listVehicles(query: VehicleQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS, 'createdAt');
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        policy: {
          select: { id: true, policyNumber: true },
        },
        drivers: {
          include: {
            party: { select: { id: true, fullName: true } },
          },
        },
        _count: {
          select: { additionalInterests: true },
        },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getVehicleById(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
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
      drivers: {
        include: {
          party: {
            select: {
              id: true,
              fullName: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            },
          },
        },
      },
      additionalInterests: true,
    },
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  return vehicle;
}

export async function createVehicle(data: CreateVehicleInput, createdBy?: string) {
  const policy = await prisma.policy.findUnique({ where: { id: data.policyId } });
  if (!policy) throw new NotFoundError('Policy not found');

  const vehicle = await prisma.vehicle.create({
    data: {
      policyId: data.policyId,
      vehicleNumber: data.vehicleNumber,
      vin: data.vin || null,
      year: data.year,
      make: data.make,
      model: data.model,
      bodyType: data.bodyType,
      vehicleType: data.vehicleType,
      vehicleUse: data.vehicleUse,
      garagingAddress: data.garagingAddress,
      garagingCity: data.garagingCity,
      garagingState: data.garagingState,
      garagingZip: data.garagingZip,
      statedAmount: data.statedAmount,
      costNew: data.costNew,
      drivers: data.drivers ? {
        create: data.drivers.map(d => ({
          partyId: d.partyId,
          isPrimaryDriver: d.isPrimaryDriver,
          driverStatus: d.driverStatus,
          licenseNumber: d.licenseNumber,
          licenseState: d.licenseState,
          licenseStatus: d.licenseStatus,
          yearsLicensed: d.yearsLicensed,
          accidentsCount: d.accidentsCount,
          violationsCount: d.violationsCount,
        })),
      } : undefined,
      additionalInterests: data.additionalInterests ? {
        create: data.additionalInterests,
      } : undefined,
    },
    include: {
      policy: { select: { id: true, policyNumber: true } },
      drivers: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
      additionalInterests: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Vehicle',
      entityId: vehicle.id,
      action: 'CREATE',
      userId: createdBy,
      newValues: { vin: vehicle.vin, policyId: vehicle.policyId },
    },
  });

  return vehicle;
}

export async function updateVehicle(id: string, data: UpdateVehicleInput, updatedBy?: string) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Vehicle not found');

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      vehicleNumber: data.vehicleNumber,
      vin: data.vin,
      year: data.year,
      make: data.make,
      model: data.model,
      bodyType: data.bodyType,
      vehicleType: data.vehicleType,
      vehicleUse: data.vehicleUse,
      garagingAddress: data.garagingAddress,
      garagingCity: data.garagingCity,
      garagingState: data.garagingState,
      garagingZip: data.garagingZip,
      statedAmount: data.statedAmount,
      costNew: data.costNew,
    },
    include: {
      policy: { select: { id: true, policyNumber: true } },
      drivers: {
        include: {
          party: { select: { id: true, fullName: true } },
        },
      },
      additionalInterests: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Vehicle',
      entityId: vehicle.id,
      action: 'UPDATE',
      userId: updatedBy,
    },
  });

  return vehicle;
}

export async function deleteVehicle(id: string, deletedBy?: string) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Vehicle not found');

  await prisma.vehicle.update({
    where: { id },
    data: { isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Vehicle',
      entityId: id,
      action: 'DELETE',
      userId: deletedBy,
    },
  });
}

export async function addDriver(vehicleId: string, data: VehicleDriverInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new NotFoundError('Vehicle not found');

  const party = await prisma.party.findUnique({ where: { id: data.partyId } });
  if (!party) throw new NotFoundError('Party not found');

  return prisma.vehicleDriver.create({
    data: {
      vehicleId,
      ...data,
    },
    include: {
      party: { select: { id: true, fullName: true } },
    },
  });
}

export async function removeDriver(vehicleId: string, partyId: string) {
  await prisma.vehicleDriver.delete({
    where: {
      vehicleId_partyId: { vehicleId, partyId },
    },
  });
}
