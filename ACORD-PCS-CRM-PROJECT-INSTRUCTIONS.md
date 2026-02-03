# ACORD P&C/Surety CRM - Project Instructions

## Overview

Enterprise-grade CRM backend for **Property & Casualty / Surety** insurance agencies, implementing **ACORD** (Association for Cooperative Operations Research and Development) standards for P&C data compliance and interoperability.

### Line of Business
- Property & Casualty Insurance
- Surety Bonds

### Target Users
- P&C Insurance Agencies
- Surety Bond Agencies
- Multi-line Agencies (P&C focus)

### XSD Reference
- **Schema:** `acord-pcs-v1_16_0-ns-nodoc-codes.xsd`
- **Version:** 1.16.0
- **Standard:** ACORD Property & Casualty/Surety XML Standards

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Angular | 21 (standalone components, signals) |
| **Styling** | Bootstrap CSS | 5.3.8 (CSS only, no JS) |
| **Backend** | Node.js / Express | 24 LTS / 4.x |
| **Language** | TypeScript | 5.6+ |
| **ORM** | Prisma | 5.x |
| **Database** | PostgreSQL | 15+ (Supabase hosted) |
| **XML Parsing** | fast-xml-parser | 4.x |
| **XSD Validation** | libxmljs2 | (optional) |
| **Hosting** | Render.com | - |

---

## Core P&C Entities (from XSD)

Based on ACORD P&C/Surety v1.16.0 schema:

### Service Message Structure

```
ACORD (root)
├── InsuranceSvcRq / InsuranceSvcRs (policy service messages)
├── ClaimsSvcRq / ClaimsSvcRs (claims messages)
└── AccountingSvcRq / AccountingSvcRs (billing messages)
```

### Policy Entity

```
Policy
├── PolicyNumber
├── LOBCd (Line of Business Code)
├── EffectiveDt / ExpirationDt
├── ContractTerm
├── PolicyStatusCd
├── PolicyAmt
├── WrittenPremiumAmt
└── LOB-specific sections:
    ├── PrivatePassengerAuto
    ├── CommercialAuto
    ├── Homeowners
    ├── Dwelling
    ├── CommercialProperty
    ├── GeneralLiability
    ├── ProfessionalLiability
    ├── WorkersComp
    ├── InlandMarine
    ├── Umbrella
    ├── SuretyBond
    └── ...
```

### Party Entity (GeneralPartyInfo)

```
Party
├── NameInfo
│   ├── PersonName (GivenName, Surname, etc.)
│   └── CommlName (CommercialName)
├── Addr[]
│   ├── AddrTypeCd
│   ├── Addr1, Addr2, City, StateProvCd, PostalCode
│   └── CountryCd
├── Communications
│   ├── PhoneInfo[] (PhoneTypeCd, PhoneNumber)
│   └── EmailInfo[] (EmailAddr)
├── TaxIdentity
│   ├── TaxIdTypeCd (SSN, FEIN)
│   └── TaxId
└── Roles
    ├── InsuredOrPrincipal
    ├── Producer (Agent)
    ├── Claimant
    ├── AdditionalInsured
    └── ...
```

### Claims Entity

```
ClaimsOccurrence
├── ClaimNumber
├── LossDt
├── LossTime
├── LossCauseCd
├── ClaimStatusCd
├── ClaimAmt
├── ClaimsParty[]
│   ├── ClaimsPartyInfo
│   └── ClaimsPartyRoleCd
├── ClaimsPayment[]
│   ├── PaymentAmt
│   ├── PaymentDt
│   └── PayeeName
├── PropertyLossInfo
├── AutoLossInfo
├── InjuryInfo
└── LitigationInfo
```

### Vehicle Entity (Auto Lines)

```
Vehicle
├── VehIdentificationNumber (VIN)
├── Manufacturer
├── Model
├── ModelYear
├── VehTypeCd
├── VehBodyTypeCd
├── VehUseCd
├── GaragingInfo
│   ├── GaragingAddr
│   └── GaragingZipCd
├── Coverage[]
│   ├── CoverageCd
│   ├── Limit
│   ├── Deductible
│   └── PremiumAmt
├── AdditionalInterest[] (Lienholder)
└── Driver[]
    ├── DriverInfo
    ├── LicenseNumber
    └── LicenseStateCd
```

### Property Entity (Property Lines)

```
Property (Location/Building)
├── LocationRef
├── PropertyTypeCd
├── Construction
│   ├── ConstructionCd
│   ├── RoofTypeCd
│   └── YearBuilt
├── SquareFootage
├── NumberOfStories
├── ValuationAmt
├── OccupancyTypeCd
├── Coverage[]
│   ├── CoverageCd (Building, Contents, BPP, etc.)
│   ├── Limit
│   ├── Deductible
│   └── CoverageForm (Basic, Broad, Special)
├── ProtectionClass
├── DistanceToFireStation
├── DistanceToHydrant
└── AdditionalInterest[] (Mortgagee)
```

### Surety Bond Entity

```
SuretyBond
├── BondNumber
├── BondTypeCd
│   ├── ContractBond
│   ├── CommercialBond
│   ├── CourtBond
│   └── FidelityBond
├── PenaltyAmt
├── BondAmt
├── EffectiveDt / ExpirationDt
├── Principal
│   └── GeneralPartyInfo
├── Obligee
│   └── GeneralPartyInfo
├── Surety (carrier)
├── UnderlyingContract
│   ├── ContractDesc
│   ├── ContractAmt
│   └── ContractDt
└── IndemnityAgreement
```

### CRM-Specific Entities (Not ACORD Standard)

```
Activity
├── ActivityType (Call, Email, Meeting, Task, Note)
├── ActivityDate
├── Description
├── AssignedTo
├── PartyID
├── PolicyID
├── ClaimID
└── Status

Lead
├── LeadSource
├── LeadStatus (New, Contacted, Qualified, Quoted, Won, Lost)
├── ProspectInfo
├── QuotedLines
└── ConversionDate

Attachment
├── EntityType (Party, Policy, Claim)
├── EntityId
├── FileName
├── MimeType
└── StorageUrl
```

---

## ACORD P&C Type Codes

### Line of Business Codes (LOBCd)

| Code | Description |
|------|-------------|
| AUTOP | Personal Auto |
| AUTOC | Commercial Auto |
| HOME | Homeowners |
| DWELL | Dwelling Fire |
| CPKGE | Commercial Package |
| BOP | Business Owners Policy |
| GL | General Liability |
| WORK | Workers Compensation |
| PROP | Commercial Property |
| CRIME | Crime/Fidelity |
| IMARINE | Inland Marine |
| UMBRL | Umbrella/Excess |
| PROFLIAB | Professional Liability |
| SURETY | Surety Bond |
| FARM | Farm/Ranch |
| FLOOD | Flood |
| EQKE | Earthquake |

### Policy Status Codes

| Code | Description |
|------|-------------|
| Active | Policy in force |
| Pending | Application submitted |
| Cancelled | Policy cancelled |
| Expired | Policy term ended |
| NonRenewed | Carrier declined renewal |
| Reinstated | Previously cancelled, now active |
| Bound | Coverage bound, policy pending |

### Claim Status Codes

| Code | Description |
|------|-------------|
| Open | Claim under investigation |
| Closed | Claim settled/resolved |
| Reopened | Previously closed, reopened |
| Subrogation | In subrogation process |
| Litigation | In legal proceedings |
| Denied | Claim denied |

### Coverage Codes (Common)

| Code | Description | LOB |
|------|-------------|-----|
| BIPD | Bodily Injury/Property Damage | Auto, GL |
| COMP | Comprehensive | Auto |
| COLL | Collision | Auto |
| MEDPM | Medical Payments | Auto, GL |
| UM | Uninsured Motorists | Auto |
| UIM | Underinsured Motorists | Auto |
| BLDG | Building | Property |
| BPP | Business Personal Property | Property |
| BLINC | Business Income | Property |
| PRODCO | Products/Completed Ops | GL |
| PREMPOP | Premises/Operations | GL |

---

## Database Schema Design

### Enums

```prisma
enum LineOfBusiness {
  AUTOP       // Personal Auto
  AUTOC       // Commercial Auto
  HOME        // Homeowners
  DWELL       // Dwelling
  CPKGE       // Commercial Package
  BOP         // Business Owners
  GL          // General Liability
  WORK        // Workers Comp
  PROP        // Commercial Property
  CRIME       // Crime/Fidelity
  IMARINE     // Inland Marine
  UMBRL       // Umbrella
  PROFLIAB    // Professional Liability
  SURETY      // Surety
  FARM        // Farm/Ranch
  FLOOD       // Flood
  EQKE        // Earthquake
}

enum PolicyStatus {
  PENDING
  BOUND
  ACTIVE
  CANCELLED
  EXPIRED
  NON_RENEWED
  REINSTATED
}

enum ClaimStatus {
  OPEN
  CLOSED
  REOPENED
  SUBROGATION
  LITIGATION
  DENIED
}

enum PartyType {
  PERSON
  ORGANIZATION
}

enum PartyRole {
  INSURED
  ADDITIONAL_INSURED
  DRIVER
  MORTGAGEE
  LIENHOLDER
  LOSS_PAYEE
  CLAIMANT
  PRODUCER
  PRINCIPAL        // Surety
  OBLIGEE          // Surety
  INDEMNITOR       // Surety
}

enum BondType {
  CONTRACT         // Performance, Payment, Bid
  COMMERCIAL       // License, Permit
  COURT            // Appeal, Probate
  FIDELITY         // Employee Dishonesty
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  TASK
  NOTE
  FOLLOW_UP
  QUOTE
  RENEWAL
  CLAIM_FOLLOWUP
}
```

### Core Models

```prisma
model Party {
  id                String      @id @default(cuid())
  partyType         PartyType   @default(PERSON)

  // Person fields
  firstName         String?
  middleName        String?
  lastName          String?
  suffix            String?
  dateOfBirth       DateTime?

  // Organization fields
  commercialName    String?
  dba               String?

  // Common fields
  fullName          String?     // Computed or stored
  taxIdType         String?     // SSN, FEIN
  taxId             String?

  // Contact info
  addresses         Address[]
  phones            Phone[]
  emails            Email[]

  // Relationships
  policies          PolicyParty[]
  claims            ClaimParty[]
  vehicles          VehicleDriver[]
  bonds             BondParty[]
  activities        Activity[]

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model Policy {
  id                String        @id @default(cuid())
  policyNumber      String        @unique
  lineOfBusiness    LineOfBusiness

  effectiveDate     DateTime
  expirationDate    DateTime
  policyStatus      PolicyStatus  @default(PENDING)

  writtenPremium    Decimal?      @db.Decimal(12, 2)
  policyAmount      Decimal?      @db.Decimal(15, 2)

  // Carrier info
  carrierCode       String?
  carrierName       String?

  // Producer
  producerId        String?
  agencyCode        String?

  // Related entities
  parties           PolicyParty[]
  vehicles          Vehicle[]
  properties        Property[]
  coverages         Coverage[]
  claims            Claim[]
  attachments       Attachment[]
  activities        Activity[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model Claim {
  id                String        @id @default(cuid())
  claimNumber       String        @unique

  policy            Policy        @relation(fields: [policyId], references: [id])
  policyId          String

  lossDate          DateTime
  lossTime          String?
  reportedDate      DateTime      @default(now())
  lossCauseCode     String?
  lossDescription   String?       @db.Text

  claimStatus       ClaimStatus   @default(OPEN)

  totalIncurred     Decimal?      @db.Decimal(15, 2)
  totalPaid         Decimal?      @db.Decimal(15, 2)
  totalReserve      Decimal?      @db.Decimal(15, 2)

  // Location of loss
  lossLocationAddr  String?
  lossLocationCity  String?
  lossLocationState String?
  lossLocationZip   String?

  parties           ClaimParty[]
  payments          ClaimPayment[]
  attachments       Attachment[]
  activities        Activity[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model Vehicle {
  id                String        @id @default(cuid())

  policy            Policy?       @relation(fields: [policyId], references: [id])
  policyId          String?

  vin               String?
  year              Int?
  make              String?
  model             String?
  bodyType          String?
  vehicleType       String?       // PPT, COM, MOTO, etc.
  vehicleUse        String?       // Pleasure, Commute, Business

  // Garaging
  garagingAddr      String?
  garagingCity      String?
  garagingState     String?
  garagingZip       String?

  // Value
  statedAmt         Decimal?      @db.Decimal(12, 2)
  costNew           Decimal?      @db.Decimal(12, 2)

  coverages         VehicleCoverage[]
  drivers           VehicleDriver[]
  additionalInterests AdditionalInterest[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model Property {
  id                String        @id @default(cuid())

  policy            Policy?       @relation(fields: [policyId], references: [id])
  policyId          String?

  locationNumber    Int?
  buildingNumber    Int?

  propertyType      String?       // Building, BPP, etc.
  occupancyType     String?

  // Address
  address           String?
  city              String?
  state             String?
  zip               String?
  county            String?

  // Construction
  constructionType  String?
  roofType          String?
  yearBuilt         Int?
  squareFootage     Int?
  numberOfStories   Int?

  // Protection
  protectionClass   String?
  distanceToFireStation Decimal?  @db.Decimal(5, 2)
  distanceToHydrant Decimal?      @db.Decimal(5, 2)

  // Values
  buildingValue     Decimal?      @db.Decimal(15, 2)
  contentsValue     Decimal?      @db.Decimal(15, 2)

  coverages         PropertyCoverage[]
  additionalInterests AdditionalInterest[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model SuretyBond {
  id                String        @id @default(cuid())

  bondNumber        String        @unique
  bondType          BondType
  bondSubType       String?       // Specific bond type

  penaltyAmount     Decimal       @db.Decimal(15, 2)
  bondAmount        Decimal?      @db.Decimal(15, 2)
  premiumAmount     Decimal?      @db.Decimal(12, 2)

  effectiveDate     DateTime
  expirationDate    DateTime?
  bondStatus        String?       @default("Active")

  // Carrier
  suretyCarrier     String?
  carrierCode       String?

  // Underlying contract (for contract bonds)
  contractDesc      String?
  contractAmount    Decimal?      @db.Decimal(15, 2)
  projectName       String?
  projectLocation   String?

  // Parties
  parties           BondParty[]
  attachments       Attachment[]
  activities        Activity[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

---

## API Endpoints Design

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Parties
- GET `/api/parties` - List with pagination/search
- GET `/api/parties/:id` - Get by ID
- POST `/api/parties` - Create
- PATCH `/api/parties/:id` - Update
- DELETE `/api/parties/:id` - Delete
- GET `/api/parties/:id/policies` - Party's policies
- GET `/api/parties/:id/claims` - Party's claims

### Policies
- GET `/api/policies` - List with filters (LOB, status, date range)
- GET `/api/policies/:id` - Get by ID with details
- POST `/api/policies` - Create
- PATCH `/api/policies/:id` - Update
- DELETE `/api/policies/:id` - Delete
- GET `/api/policies/:id/vehicles` - Policy vehicles
- GET `/api/policies/:id/properties` - Policy properties
- GET `/api/policies/:id/coverages` - Policy coverages
- GET `/api/policies/:id/claims` - Policy claims
- GET `/api/policies/renewals` - Upcoming renewals

### Claims
- GET `/api/claims` - List with filters
- GET `/api/claims/:id` - Get by ID
- POST `/api/claims` - Create
- PATCH `/api/claims/:id` - Update status/details
- GET `/api/claims/:id/payments` - Claim payments
- POST `/api/claims/:id/payments` - Add payment
- GET `/api/claims/open` - Open claims dashboard

### Vehicles
- GET `/api/vehicles` - List all
- GET `/api/vehicles/:id` - Get by ID
- POST `/api/policies/:policyId/vehicles` - Add to policy
- PATCH `/api/vehicles/:id` - Update
- DELETE `/api/vehicles/:id` - Remove

### Properties
- GET `/api/properties` - List all
- GET `/api/properties/:id` - Get by ID
- POST `/api/policies/:policyId/properties` - Add to policy
- PATCH `/api/properties/:id` - Update
- DELETE `/api/properties/:id` - Remove

### Surety Bonds
- GET `/api/bonds` - List bonds
- GET `/api/bonds/:id` - Get by ID
- POST `/api/bonds` - Create
- PATCH `/api/bonds/:id` - Update
- GET `/api/bonds/expiring` - Expiring bonds

### Activities (CRM)
- GET `/api/activities` - List with filters
- GET `/api/activities/:id` - Get by ID
- POST `/api/activities` - Create
- PATCH `/api/activities/:id` - Update
- GET `/api/activities/upcoming` - Upcoming tasks
- GET `/api/activities/overdue` - Overdue items

### Dashboard
- GET `/api/dashboard/overview` - Summary stats
- GET `/api/dashboard/renewals` - Renewal pipeline
- GET `/api/dashboard/claims` - Claims summary
- GET `/api/dashboard/tasks` - Task summary

### ACORD XML
- POST `/api/acord/import` - Import ACORD XML
- GET `/api/acord/export/policy/:id` - Export policy
- GET `/api/acord/export/claim/:id` - Export claim

---

## Project Structure

```
/acord-pcs-crm/
├── ACORD-PCS-CRM-PROJECT-INSTRUCTIONS.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts                 # Express server entry
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── parties.ts
│   │   ├── policies.ts
│   │   ├── claims.ts
│   │   ├── vehicles.ts
│   │   ├── properties.ts
│   │   ├── bonds.ts
│   │   ├── activities.ts
│   │   ├── dashboard.ts
│   │   └── acord.ts
│   ├── services/
│   │   ├── party.service.ts
│   │   ├── policy.service.ts
│   │   ├── claim.service.ts
│   │   └── acord.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/
│   │   └── (Zod schemas)
│   └── utils/
│       ├── prisma.ts
│       └── helpers.ts
├── xsd/
│   └── acord-pcs-v1_16_0-ns-nodoc-codes.xsd
└── frontend/                    # Angular workspace (created later)
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/crm_pcs?schema=public"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=attachments

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
APP_NAME=ACORD P&C CRM
APP_URL=http://localhost:4200
```

---

## ACORD Resources

- [ACORD Standards](https://www.acord.org)
- [ACORD P&C/Surety Standards](https://www.acord.org/standards-architecture/acord-data-standards/pc_702702a)
- [ACORD Implementation Guides](https://www.acord.org/standards-architecture/implementation-guides)

---

## Implementation Notes

1. **Start with core entities**: Party, Policy, Claim
2. **Add LOB-specific models**: Vehicle (Auto), Property (Property/HO), SuretyBond
3. **Implement party roles** via junction tables for flexibility
4. **Coverage modeling**: Use polymorphic approach (VehicleCoverage, PropertyCoverage, etc.)
5. **Claims**: Support multi-claimant, multi-coverage claims
6. **XML Import/Export**: Use fast-xml-parser with ACORD namespace handling
7. **Frontend**: Angular 21 with standalone components, reactive forms for complex policy data entry
