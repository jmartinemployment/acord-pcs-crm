import { z } from 'zod';

export const vehicleDriverSchema = z.object({
  partyId: z.string().min(1, 'Party ID is required'),
  isPrimaryDriver: z.boolean().default(false),
  driverStatus: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().max(2).optional(),
  licenseStatus: z.string().optional(),
  yearsLicensed: z.number().min(0).optional(),
  accidentsCount: z.number().min(0).default(0),
  violationsCount: z.number().min(0).default(0),
});

export const vehicleAdditionalInterestSchema = z.object({
  interestType: z.string().min(1, 'Interest type is required'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip: z.string().optional(),
  loanNumber: z.string().optional(),
});

export const createVehicleSchema = z.object({
  policyId: z.string().min(1, 'Policy ID is required'),
  vehicleNumber: z.number().int().positive().optional(),

  vin: z.string().length(17, 'VIN must be 17 characters').optional().or(z.literal('')),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  bodyType: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleUse: z.string().optional(),

  garagingAddress: z.string().optional(),
  garagingCity: z.string().optional(),
  garagingState: z.string().max(2).optional(),
  garagingZip: z.string().optional(),

  statedAmount: z.number().min(0).optional(),
  costNew: z.number().min(0).optional(),

  drivers: z.array(vehicleDriverSchema).optional(),
  additionalInterests: z.array(vehicleAdditionalInterestSchema).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().omit({ policyId: true });

export const vehicleQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  policyId: z.string().optional(),
  vin: z.string().optional(),
  year: z.string().optional(),
  make: z.string().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleQuery = z.infer<typeof vehicleQuerySchema>;
export type VehicleDriverInput = z.infer<typeof vehicleDriverSchema>;
export type VehicleAdditionalInterestInput = z.infer<typeof vehicleAdditionalInterestSchema>;
