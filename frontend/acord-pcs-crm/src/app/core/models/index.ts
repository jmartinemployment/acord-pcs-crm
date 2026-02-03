// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Auth
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: 'ADMIN' | 'AGENT' | 'READONLY';
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Party
export interface Party {
  id: string;
  partyType: 'PERSON' | 'ORGANIZATION';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  commercialName?: string;
  dba?: string;
  dateOfBirth?: string;
  taxIdType?: string;
  taxId?: string;
  addresses?: Address[];
  phones?: Phone[];
  emails?: Email[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Address {
  id: string;
  addressType: string;
  line1?: string;
  line2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isPrimary: boolean;
}

export interface Phone {
  id: string;
  phoneType: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface Email {
  id: string;
  emailType: string;
  emailAddress: string;
  isPrimary: boolean;
}

// Policy
export interface Policy {
  id: string;
  policyNumber: string;
  lineOfBusiness: string;
  policyStatus: string;
  effectiveDate: string;
  expirationDate: string;
  writtenPremium?: number;
  annualPremium?: number;
  carrierName?: string;
  carrierCode?: string;
  parties?: PolicyParty[];
  vehicles?: Vehicle[];
  properties?: Property[];
  coverages?: Coverage[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyParty {
  id: string;
  partyId: string;
  party?: Party;
  role: string;
  isPrimaryInsured: boolean;
}

export interface Coverage {
  id: string;
  coverageCode: string;
  coverageDesc?: string;
  limitAmount?: number;
  deductibleAmount?: number;
  premiumAmount?: number;
}

// Vehicle
export interface Vehicle {
  id: string;
  policyId: string;
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  bodyType?: string;
  vehicleUse?: string;
  garagingZip?: string;
  statedAmount?: number;
}

// Property
export interface Property {
  id: string;
  policyId: string;
  propertyType?: string;
  constructionType?: string;
  yearBuilt?: number;
  squareFootage?: number;
  numberOfStories?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  buildingValue?: number;
  contentsValue?: number;
}

// Claim
export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policy?: Policy;
  claimStatus: string;
  lossDate: string;
  reportedDate: string;
  lossDescription?: string;
  lossAddress?: string;
  lossCity?: string;
  lossState?: string;
  totalReserve?: number;
  totalPaid?: number;
  adjusterName?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// Surety Bond
export interface SuretyBond {
  id: string;
  bondNumber: string;
  bondType: string;
  bondSubType?: string;
  bondStatus: string;
  effectiveDate: string;
  expirationDate?: string;
  penaltyAmount: number;
  premiumAmount?: number;
  suretyCarrier?: string;
  projectName?: string;
  projectCity?: string;
  projectState?: string;
  contractDescription?: string;
  contractAmount?: number;
  parties?: BondParty[];
  createdAt: string;
  updatedAt: string;
}

export interface BondParty {
  id: string;
  partyId: string;
  party?: Party;
  role: string;
}

// Lead
export interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  leadStatus: string;
  leadSource?: string;
  interestedLines?: string[];
  notes?: string;
  estimatedPremium?: number;
  assignedTo?: string;
  leadDate: string;
  contactedDate?: string;
  quotedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Activity
export interface Activity {
  id: string;
  activityType: string;
  activityStatus: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  completedDate?: string;
  partyId?: string;
  party?: Party;
  policyId?: string;
  policy?: Policy;
  claimId?: string;
  claim?: Claim;
  bondId?: string;
  assignedTo?: string;
  priority?: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard
export interface DashboardOverview {
  stats: DashboardStats;
  renewals: RenewalPipeline;
  claims: ClaimsSummary;
  tasks: TaskSummary;
  leads: LeadPipeline;
  recentActivity: Activity[];
}

export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  totalPremium: number;
  openClaims: number;
  totalClaimsPaid: number;
  activeLeads: number;
}

export interface RenewalPipeline {
  expiring30Days: number;
  expiring60Days: number;
  expiring90Days: number;
  policies: Policy[];
}

export interface ClaimsSummary {
  openClaims: number;
  totalReserves: number;
  totalPaid: number;
  byStatus: { status: string; count: number }[];
}

export interface TaskSummary {
  overdue: number;
  dueToday: number;
  upcoming: number;
  completed: number;
}

export interface LeadPipeline {
  new: number;
  contacted: number;
  qualified: number;
  quoted: number;
  won: number;
  estimatedPremium: number;
}
