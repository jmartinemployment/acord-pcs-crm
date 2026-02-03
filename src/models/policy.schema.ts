import { z } from 'zod';

export const lineOfBusinessEnum = z.enum([
  'AUTOP', 'AUTOC', 'HOME', 'DWELL', 'CPKGE', 'BOP', 'GL', 'WORK',
  'PROP', 'CRIME', 'IMARINE', 'UMBRL', 'PROFLIAB', 'SURETY', 'FARM',
  'FLOOD', 'EQKE', 'OTHER'
]);

export const policyStatusEnum = z.enum([
  'PENDING', 'BOUND', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'NON_RENEWED', 'REINSTATED'
]);

export const partyRoleEnum = z.enum([
  'INSURED', 'NAMED_INSURED', 'ADDITIONAL_INSURED', 'DRIVER', 'MORTGAGEE',
  'LIENHOLDER', 'LOSS_PAYEE', 'CLAIMANT', 'PRODUCER', 'PRINCIPAL',
  'OBLIGEE', 'INDEMNITOR', 'EMPLOYER', 'EMPLOYEE', 'OTHER'
]);

export const policyPartySchema = z.object({
  partyId: z.string().min(1, 'Party ID is required'),
  role: partyRoleEnum.default('INSURED'),
  isPrimaryInsured: z.boolean().default(false),
  interestDesc: z.string().optional(),
});

export const coverageSchema = z.object({
  coverageCode: z.string().min(1, 'Coverage code is required'),
  coverageDesc: z.string().optional(),
  limitAmount: z.number().positive().optional(),
  deductibleAmount: z.number().min(0).optional(),
  premiumAmount: z.number().min(0).optional(),
  limitType: z.string().optional(),
  deductibleType: z.string().optional(),
  vehicleId: z.string().optional(),
  propertyId: z.string().optional(),
});

export const createPolicySchema = z.object({
  policyNumber: z.string().min(1, 'Policy number is required'),
  lineOfBusiness: lineOfBusinessEnum,

  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  policyStatus: policyStatusEnum.default('PENDING'),

  writtenPremium: z.number().min(0).optional(),
  annualPremium: z.number().min(0).optional(),
  policyLimit: z.number().min(0).optional(),

  carrierCode: z.string().optional(),
  carrierName: z.string().optional(),

  producerId: z.string().optional(),
  producerName: z.string().optional(),
  agencyCode: z.string().optional(),
  agencyName: z.string().optional(),

  paymentPlan: z.string().optional(),
  billingType: z.string().optional(),

  parties: z.array(policyPartySchema).optional(),
  coverages: z.array(coverageSchema).optional(),
});

export const updatePolicySchema = createPolicySchema.partial().omit({ policyNumber: true });

export const policyQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  lineOfBusiness: lineOfBusinessEnum.optional(),
  policyStatus: policyStatusEnum.optional(),
  effectiveDateFrom: z.string().optional(),
  effectiveDateTo: z.string().optional(),
  expirationDateFrom: z.string().optional(),
  expirationDateTo: z.string().optional(),
  carrierCode: z.string().optional(),
});

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
export type PolicyQuery = z.infer<typeof policyQuerySchema>;
export type PolicyPartyInput = z.infer<typeof policyPartySchema>;
export type CoverageInput = z.infer<typeof coverageSchema>;
