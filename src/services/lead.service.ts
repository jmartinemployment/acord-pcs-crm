import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { CreateLeadInput, UpdateLeadInput, LeadQuery, ConvertLeadInput } from '../models/lead.schema';
import { getPaginationParams, createPaginatedResponse, getSortParams } from '../utils/pagination';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'leadDate', 'estimatedPremium', 'leadStatus'];

function buildWhereClause(query: LeadQuery): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { companyName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.leadSource) {
    where.leadSource = query.leadSource;
  }

  if (query.leadStatus) {
    where.leadStatus = query.leadStatus;
  }

  if (query.assignedTo) {
    where.assignedTo = query.assignedTo;
  }

  if (query.interestedLine) {
    where.interestedLines = { has: query.interestedLine };
  }

  return where;
}

export async function listLeads(query: LeadQuery) {
  const { skip, take, page, pageSize } = getPaginationParams(query);
  const { orderBy } = getSortParams(query, ALLOWED_SORT_FIELDS, 'leadDate');
  const where = buildWhereClause(query);

  const [items, totalCount] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        party: {
          select: { id: true, fullName: true },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return createPaginatedResponse(items, totalCount, page, pageSize);
}

export async function getLeadById(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      party: {
        select: {
          id: true,
          fullName: true,
          partyType: true,
          addresses: { where: { isPrimary: true }, take: 1 },
          phones: { where: { isPrimary: true }, take: 1 },
          emails: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
  });

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  return lead;
}

export async function createLead(data: CreateLeadInput, createdBy?: string) {
  const lead = await prisma.lead.create({
    data: {
      partyId: data.partyId,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      email: data.email || null,
      phone: data.phone,
      leadSource: data.leadSource,
      leadStatus: data.leadStatus,
      interestedLines: data.interestedLines || [],
      assignedTo: data.assignedTo,
      notes: data.notes,
      estimatedPremium: data.estimatedPremium,
    },
    include: {
      party: { select: { id: true, fullName: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Lead',
      entityId: lead.id,
      action: 'CREATE',
      userId: createdBy,
      newValues: { leadStatus: lead.leadStatus, leadSource: lead.leadSource },
    },
  });

  return lead;
}

export async function updateLead(id: string, data: UpdateLeadInput, updatedBy?: string) {
  const existing = await prisma.lead.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Lead not found');
  }

  const updateData: Prisma.LeadUpdateInput = {
    party: data.partyId ? { connect: { id: data.partyId } } : undefined,
    firstName: data.firstName,
    lastName: data.lastName,
    companyName: data.companyName,
    email: data.email || null,
    phone: data.phone,
    leadSource: data.leadSource,
    leadStatus: data.leadStatus,
    interestedLines: data.interestedLines,
    assignedTo: data.assignedTo,
    notes: data.notes,
    estimatedPremium: data.estimatedPremium,
  };

  // Track status changes
  if (data.leadStatus && data.leadStatus !== existing.leadStatus) {
    if (data.leadStatus === 'CONTACTED' && !existing.contactedDate) {
      updateData.contactedDate = new Date();
    }
    if (data.leadStatus === 'QUOTED' && !existing.quotedDate) {
      updateData.quotedDate = new Date();
    }
    if (data.leadStatus === 'WON' && !existing.convertedDate) {
      updateData.convertedDate = new Date();
    }
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
    include: {
      party: { select: { id: true, fullName: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Lead',
      entityId: lead.id,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues: { leadStatus: existing.leadStatus },
      newValues: { leadStatus: lead.leadStatus },
    },
  });

  return lead;
}

export async function deleteLead(id: string, deletedBy?: string) {
  const existing = await prisma.lead.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Lead not found');
  }

  await prisma.lead.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      entityType: 'Lead',
      entityId: id,
      action: 'DELETE',
      userId: deletedBy,
    },
  });
}

export async function convertLead(id: string, data: ConvertLeadInput, convertedBy?: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  let partyId = lead.partyId;

  // Create party if needed
  if (data.createParty && !partyId) {
    const isOrg = !!lead.companyName && !lead.firstName;
    const party = await prisma.party.create({
      data: {
        partyType: isOrg ? 'ORGANIZATION' : 'PERSON',
        firstName: lead.firstName,
        lastName: lead.lastName,
        commercialName: lead.companyName,
        fullName: isOrg
          ? lead.companyName
          : `${lead.firstName} ${lead.lastName}`.trim(),
        emails: lead.email ? {
          create: { emailAddress: lead.email, isPrimary: true },
        } : undefined,
        phones: lead.phone ? {
          create: { phoneNumber: lead.phone, isPrimary: true },
        } : undefined,
      },
    });
    partyId = party.id;
  }

  // Create policy if requested
  let policy = null;
  if (data.createPolicy && data.policyData && partyId) {
    policy = await prisma.policy.create({
      data: {
        policyNumber: data.policyData.policyNumber,
        lineOfBusiness: data.policyData.lineOfBusiness as any,
        effectiveDate: new Date(data.policyData.effectiveDate),
        expirationDate: new Date(data.policyData.expirationDate),
        policyStatus: 'PENDING',
        parties: {
          create: {
            partyId: partyId!,
            role: 'INSURED',
            isPrimaryInsured: true,
          },
        },
      },
    });
  }

  // Update lead
  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      partyId,
      leadStatus: 'WON',
      convertedDate: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Lead',
      entityId: id,
      action: 'UPDATE',
      userId: convertedBy,
      newValues: { action: 'CONVERTED', partyId, policyId: policy?.id },
    },
  });

  return {
    lead: updatedLead,
    party: partyId ? await prisma.party.findUnique({ where: { id: partyId } }) : null,
    policy,
  };
}

export async function getLeadPipeline() {
  const pipeline = await prisma.lead.groupBy({
    by: ['leadStatus'],
    _count: { id: true },
    _sum: { estimatedPremium: true },
  });

  return pipeline.map(p => ({
    status: p.leadStatus,
    count: p._count.id,
    totalEstimatedPremium: p._sum.estimatedPremium || 0,
  }));
}
