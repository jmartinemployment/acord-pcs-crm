import { z } from 'zod';
import { partyRoleEnum } from './policy.schema';

export const claimStatusEnum = z.enum([
  'OPEN', 'CLOSED', 'REOPENED', 'SUBROGATION', 'LITIGATION', 'DENIED'
]);

export const claimPartySchema = z.object({
  partyId: z.string().min(1, 'Party ID is required'),
  role: partyRoleEnum.default('CLAIMANT'),
});

export const claimPaymentSchema = z.object({
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  paymentAmount: z.number().positive('Payment amount must be positive'),
  paymentType: z.string().optional(),
  payeeName: z.string().optional(),
  payeeType: z.string().optional(),
  checkNumber: z.string().optional(),
  memo: z.string().optional(),
});

export const createClaimSchema = z.object({
  claimNumber: z.string().min(1, 'Claim number is required'),
  policyId: z.string().min(1, 'Policy ID is required'),

  lossDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  lossTime: z.string().optional(),
  lossCauseCode: z.string().optional(),
  lossDescription: z.string().optional(),

  lossAddress: z.string().optional(),
  lossCity: z.string().optional(),
  lossState: z.string().max(2).optional(),
  lossZip: z.string().optional(),

  claimStatus: claimStatusEnum.default('OPEN'),

  totalIncurred: z.number().min(0).optional(),
  totalPaid: z.number().min(0).optional(),
  totalReserve: z.number().min(0).optional(),

  adjusterName: z.string().optional(),
  adjusterPhone: z.string().optional(),
  adjusterEmail: z.string().email().optional().or(z.literal('')),

  parties: z.array(claimPartySchema).optional(),
});

export const updateClaimSchema = createClaimSchema.partial().omit({ claimNumber: true, policyId: true });

export const claimQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  claimStatus: claimStatusEnum.optional(),
  policyId: z.string().optional(),
  lossDateFrom: z.string().optional(),
  lossDateTo: z.string().optional(),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type ClaimQuery = z.infer<typeof claimQuerySchema>;
export type ClaimPartyInput = z.infer<typeof claimPartySchema>;
export type ClaimPaymentInput = z.infer<typeof claimPaymentSchema>;
