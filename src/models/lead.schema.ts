import { z } from 'zod';
import { lineOfBusinessEnum } from './policy.schema';

export const leadSourceEnum = z.enum([
  'REFERRAL', 'WEB_INQUIRY', 'COLD_CALL', 'WALK_IN', 'SEMINAR',
  'DIRECT_MAIL', 'SOCIAL_MEDIA', 'EXISTING_CLIENT', 'PURCHASED_LIST', 'OTHER'
]);

export const leadStatusEnum = z.enum([
  'NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON', 'LOST', 'DORMANT'
]);

export const createLeadSchema = z.object({
  partyId: z.string().optional(),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),

  leadSource: leadSourceEnum.optional(),
  leadStatus: leadStatusEnum.default('NEW'),

  interestedLines: z.array(lineOfBusinessEnum).optional(),

  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  estimatedPremium: z.number().min(0).optional(),
}).refine((data) => {
  // Must have either partyId or contact info
  return data.partyId || data.firstName || data.companyName || data.email;
}, {
  message: 'Must provide partyId or contact information (firstName, companyName, or email)',
});

export const updateLeadSchema = z.object({
  partyId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  leadSource: leadSourceEnum.optional(),
  leadStatus: leadStatusEnum.optional(),
  interestedLines: z.array(lineOfBusinessEnum).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  estimatedPremium: z.number().min(0).optional(),
});

export const convertLeadSchema = z.object({
  createParty: z.boolean().default(true),
  createPolicy: z.boolean().default(false),
  policyData: z.object({
    policyNumber: z.string(),
    lineOfBusiness: lineOfBusinessEnum,
    effectiveDate: z.string(),
    expirationDate: z.string(),
  }).optional(),
});

export const leadQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  leadSource: leadSourceEnum.optional(),
  leadStatus: leadStatusEnum.optional(),
  assignedTo: z.string().optional(),
  interestedLine: lineOfBusinessEnum.optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
export type LeadQuery = z.infer<typeof leadQuerySchema>;
