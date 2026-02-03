import { z } from 'zod';
import { partyRoleEnum } from './policy.schema';

export const bondTypeEnum = z.enum(['CONTRACT', 'COMMERCIAL', 'COURT', 'FIDELITY']);
export const bondStatusEnum = z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'CLAIMED']);

export const bondPartySchema = z.object({
  partyId: z.string().min(1, 'Party ID is required'),
  role: partyRoleEnum.refine(
    (role) => ['PRINCIPAL', 'OBLIGEE', 'INDEMNITOR'].includes(role),
    'Role must be PRINCIPAL, OBLIGEE, or INDEMNITOR'
  ),
});

export const createBondSchema = z.object({
  bondNumber: z.string().min(1, 'Bond number is required'),
  bondType: bondTypeEnum,
  bondSubType: z.string().optional(),

  penaltyAmount: z.number().positive('Penalty amount is required'),
  bondAmount: z.number().min(0).optional(),
  premiumAmount: z.number().min(0).optional(),

  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  bondStatus: bondStatusEnum.default('ACTIVE'),

  suretyCarrier: z.string().optional(),
  suretyCarrierCode: z.string().optional(),

  contractDescription: z.string().optional(),
  contractAmount: z.number().min(0).optional(),
  projectName: z.string().optional(),
  projectAddress: z.string().optional(),
  projectCity: z.string().optional(),
  projectState: z.string().max(2).optional(),

  parties: z.array(bondPartySchema).optional(),
});

export const updateBondSchema = createBondSchema.partial().omit({ bondNumber: true });

export const bondQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  bondType: bondTypeEnum.optional(),
  bondStatus: bondStatusEnum.optional(),
  effectiveDateFrom: z.string().optional(),
  effectiveDateTo: z.string().optional(),
  expirationDateFrom: z.string().optional(),
  expirationDateTo: z.string().optional(),
});

export type CreateBondInput = z.infer<typeof createBondSchema>;
export type UpdateBondInput = z.infer<typeof updateBondSchema>;
export type BondQuery = z.infer<typeof bondQuerySchema>;
export type BondPartyInput = z.infer<typeof bondPartySchema>;
