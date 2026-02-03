import { z } from 'zod';

export const propertyAdditionalInterestSchema = z.object({
  interestType: z.string().min(1, 'Interest type is required'),
  rank: z.number().int().positive().optional(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip: z.string().optional(),
  loanNumber: z.string().optional(),
});

export const createPropertySchema = z.object({
  policyId: z.string().min(1, 'Policy ID is required'),
  locationNumber: z.number().int().positive().optional(),
  buildingNumber: z.number().int().positive().optional(),

  propertyType: z.string().optional(),
  occupancyType: z.string().optional(),

  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip: z.string().optional(),
  county: z.string().optional(),

  constructionType: z.string().optional(),
  roofType: z.string().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 5).optional(),
  squareFootage: z.number().int().positive().optional(),
  numberOfStories: z.number().int().positive().optional(),
  numberOfUnits: z.number().int().positive().optional(),

  protectionClass: z.string().optional(),
  distanceToFireStation: z.number().min(0).optional(),
  distanceToHydrant: z.number().min(0).optional(),
  sprinklered: z.boolean().default(false),
  alarmType: z.string().optional(),

  buildingValue: z.number().min(0).optional(),
  contentsValue: z.number().min(0).optional(),
  businessIncomeValue: z.number().min(0).optional(),

  additionalInterests: z.array(propertyAdditionalInterestSchema).optional(),
});

export const updatePropertySchema = createPropertySchema.partial().omit({ policyId: true });

export const propertyQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  policyId: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.string().optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
export type PropertyAdditionalInterestInput = z.infer<typeof propertyAdditionalInterestSchema>;
