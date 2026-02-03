import { z } from 'zod';

export const partyTypeEnum = z.enum(['PERSON', 'ORGANIZATION']);
export const genderEnum = z.enum(['MALE', 'FEMALE', 'UNKNOWN']);
export const addressTypeEnum = z.enum(['RESIDENCE', 'BUSINESS', 'MAILING', 'BILLING', 'GARAGING', 'LOSS_LOCATION', 'OTHER']);
export const phoneTypeEnum = z.enum(['HOME', 'BUSINESS', 'MOBILE', 'FAX', 'OTHER']);
export const emailTypeEnum = z.enum(['PERSONAL', 'BUSINESS', 'OTHER']);

export const addressSchema = z.object({
  addressType: addressTypeEnum.optional().default('RESIDENCE'),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().max(2).optional(),
  postalCode: z.string().optional(),
  county: z.string().optional(),
  country: z.string().default('US'),
  isPrimary: z.boolean().default(false),
});

export const phoneSchema = z.object({
  phoneType: phoneTypeEnum.optional().default('HOME'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  extension: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const emailSchema = z.object({
  emailType: emailTypeEnum.optional().default('PERSONAL'),
  emailAddress: z.string().email('Invalid email address'),
  isPrimary: z.boolean().default(false),
});

const basePartySchema = z.object({
  partyType: partyTypeEnum.default('PERSON'),

  // Person fields
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  dateOfBirth: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  gender: genderEnum.optional(),

  // Organization fields
  commercialName: z.string().optional(),
  dba: z.string().optional(),
  legalEntityType: z.string().optional(),

  // Common fields
  taxIdType: z.string().optional(),
  taxId: z.string().optional(),

  // Contact info
  addresses: z.array(addressSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  emails: z.array(emailSchema).optional(),
});

export const createPartySchema = basePartySchema.refine((data) => {
  if (data.partyType === 'PERSON') {
    return data.firstName && data.lastName;
  }
  return data.commercialName;
}, {
  message: 'Person requires firstName and lastName; Organization requires commercialName',
});

export const updatePartySchema = basePartySchema.partial();

export const partyQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  partyType: partyTypeEnum.optional(),
});

export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type PartyQuery = z.infer<typeof partyQuerySchema>;
