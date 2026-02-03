import { z } from 'zod';

export const activityTypeEnum = z.enum([
  'CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'FOLLOW_UP',
  'QUOTE', 'RENEWAL', 'CLAIM_FOLLOWUP', 'POLICY_REVIEW', 'OTHER'
]);

export const activityStatusEnum = z.enum([
  'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DEFERRED'
]);

export const createActivitySchema = z.object({
  activityType: activityTypeEnum.default('NOTE'),
  activityStatus: activityStatusEnum.default('PENDING'),

  subject: z.string().optional(),
  description: z.string().optional(),

  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  dueTime: z.string().optional(),

  assignedTo: z.string().optional(),
  priority: z.number().int().min(1).max(5).default(3),

  partyId: z.string().optional(),
  policyId: z.string().optional(),
  claimId: z.string().optional(),
  bondId: z.string().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export const completeActivitySchema = z.object({
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  notes: z.string().optional(),
});

export const activityQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  activityType: activityTypeEnum.optional(),
  activityStatus: activityStatusEnum.optional(),
  partyId: z.string().optional(),
  policyId: z.string().optional(),
  claimId: z.string().optional(),
  bondId: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CompleteActivityInput = z.infer<typeof completeActivitySchema>;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;
