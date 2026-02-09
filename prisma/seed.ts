import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ACORD P&C/Surety CRM with realistic demo data...\n');

  // Create demo users
  const passwordHash = await bcrypt.hash('Demo2026!', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah.mitchell@acordpcs.demo' },
      update: {},
      create: {
        email: 'sarah.mitchell@acordpcs.demo',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Mitchell',
        displayName: 'Sarah Mitchell',
        role: 'AGENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'james.carter@acordpcs.demo' },
      update: {},
      create: {
        email: 'james.carter@acordpcs.demo',
        passwordHash,
        firstName: 'James',
        lastName: 'Carter',
        displayName: 'James Carter',
        role: 'AGENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria.gonzalez@acordpcs.demo' },
      update: {},
      create: {
        email: 'maria.gonzalez@acordpcs.demo',
        passwordHash,
        firstName: 'Maria',
        lastName: 'Gonzalez',
        displayName: 'Maria Gonzalez',
        role: 'ADMIN',
      },
    }),
  ]);

  console.log(`Created ${users.length} demo users`);

  // Create Parties (Insureds, Agents, Claimants)
  const parties = await Promise.all([
    // Personal Lines Clients
    prisma.party.create({
      data: {
        partyType: 'PERSON',
        firstName: 'Robert',
        lastName: 'Thompson',
        fullName: 'Robert Thompson',
        dateOfBirth: new Date('1978-03-15'),
        taxIdType: 'SSN',
        taxId: '***-**-4521',
        addresses: {
          create: {
            addressType: 'RESIDENCE',
            line1: '2847 Palm Beach Boulevard',
            city: 'Fort Lauderdale',
            stateProvince: 'FL',
            postalCode: '33301',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'PERSONAL',
            emailAddress: 'robert.thompson@email.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'MOBILE',
            phoneNumber: '(954) 555-0123',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'PERSON',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        fullName: 'Jennifer Martinez',
        dateOfBirth: new Date('1985-07-22'),
        taxIdType: 'SSN',
        taxId: '***-**-7832',
        addresses: {
          create: {
            addressType: 'RESIDENCE',
            line1: '1456 Ocean Drive',
            line2: 'Unit 12B',
            city: 'Miami Beach',
            stateProvince: 'FL',
            postalCode: '33139',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'PERSONAL',
            emailAddress: 'jennifer.martinez@email.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'MOBILE',
            phoneNumber: '(305) 555-0456',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'PERSON',
        firstName: 'Michael',
        lastName: 'Chen',
        fullName: 'Michael Chen',
        dateOfBirth: new Date('1972-11-08'),
        taxIdType: 'SSN',
        taxId: '***-**-2156',
        addresses: {
          create: {
            addressType: 'RESIDENCE',
            line1: '892 Royal Palm Way',
            city: 'Boca Raton',
            stateProvince: 'FL',
            postalCode: '33432',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'PERSONAL',
            emailAddress: 'michael.chen@techcorp.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'MOBILE',
            phoneNumber: '(561) 555-0789',
            isPrimary: true,
          },
        },
      },
    }),
    // Commercial Clients
    prisma.party.create({
      data: {
        partyType: 'ORGANIZATION',
        commercialName: 'Sunshine Construction LLC',
        dba: 'Sunshine Builders',
        fullName: 'Sunshine Construction LLC',
        legalEntityType: 'LLC',
        taxIdType: 'FEIN',
        taxId: '**-***4567',
        addresses: {
          create: {
            addressType: 'BUSINESS',
            line1: '5500 NW 33rd Avenue',
            city: 'Fort Lauderdale',
            stateProvince: 'FL',
            postalCode: '33309',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'BUSINESS',
            emailAddress: 'info@sunshinebuilders.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'BUSINESS',
            phoneNumber: '(954) 555-1234',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'ORGANIZATION',
        commercialName: 'Atlantic Hospitality Group Inc',
        fullName: 'Atlantic Hospitality Group Inc',
        legalEntityType: 'Corporation',
        taxIdType: 'FEIN',
        taxId: '**-***8901',
        addresses: {
          create: {
            addressType: 'BUSINESS',
            line1: '1200 Brickell Avenue',
            line2: 'Suite 2400',
            city: 'Miami',
            stateProvince: 'FL',
            postalCode: '33131',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'BUSINESS',
            emailAddress: 'corporate@atlantichospitality.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'BUSINESS',
            phoneNumber: '(305) 555-5678',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'ORGANIZATION',
        commercialName: 'Coastal Medical Associates PA',
        fullName: 'Coastal Medical Associates PA',
        legalEntityType: 'Professional Association',
        taxIdType: 'FEIN',
        taxId: '**-***2345',
        addresses: {
          create: {
            addressType: 'BUSINESS',
            line1: '3200 S Congress Avenue',
            line2: 'Building C',
            city: 'Boynton Beach',
            stateProvince: 'FL',
            postalCode: '33426',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'BUSINESS',
            emailAddress: 'admin@coastalmedical.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'BUSINESS',
            phoneNumber: '(561) 555-9012',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'ORGANIZATION',
        commercialName: 'Palm Beach Auto Dealers Association',
        fullName: 'Palm Beach Auto Dealers Association',
        legalEntityType: 'Association',
        taxIdType: 'FEIN',
        taxId: '**-***6789',
        addresses: {
          create: {
            addressType: 'BUSINESS',
            line1: '4501 Okeechobee Boulevard',
            city: 'West Palm Beach',
            stateProvince: 'FL',
            postalCode: '33409',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'BUSINESS',
            emailAddress: 'operations@pbada.org',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'BUSINESS',
            phoneNumber: '(561) 555-3456',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'PERSON',
        firstName: 'David',
        lastName: 'Williams',
        fullName: 'David Williams',
        dateOfBirth: new Date('1990-02-14'),
        addresses: {
          create: {
            addressType: 'RESIDENCE',
            line1: '7823 SW 152nd Street',
            city: 'Palmetto Bay',
            stateProvince: 'FL',
            postalCode: '33157',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'PERSONAL',
            emailAddress: 'david.williams@email.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'MOBILE',
            phoneNumber: '(786) 555-4567',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'PERSON',
        firstName: 'Amanda',
        lastName: 'Foster',
        fullName: 'Amanda Foster',
        dateOfBirth: new Date('1968-09-30'),
        addresses: {
          create: {
            addressType: 'RESIDENCE',
            line1: '1122 Las Olas Boulevard',
            line2: 'PH 3',
            city: 'Fort Lauderdale',
            stateProvince: 'FL',
            postalCode: '33301',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'PERSONAL',
            emailAddress: 'amanda.foster@email.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'MOBILE',
            phoneNumber: '(954) 555-7890',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.party.create({
      data: {
        partyType: 'ORGANIZATION',
        commercialName: 'Rodriguez Trucking & Logistics',
        fullName: 'Rodriguez Trucking & Logistics',
        legalEntityType: 'LLC',
        taxIdType: 'FEIN',
        taxId: '**-***0123',
        addresses: {
          create: {
            addressType: 'BUSINESS',
            line1: '8900 NW 79th Avenue',
            city: 'Medley',
            stateProvince: 'FL',
            postalCode: '33166',
            isPrimary: true,
          },
        },
        emails: {
          create: {
            emailType: 'BUSINESS',
            emailAddress: 'dispatch@rodrigueztrucking.com',
            isPrimary: true,
          },
        },
        phones: {
          create: {
            phoneType: 'BUSINESS',
            phoneNumber: '(305) 555-2345',
            isPrimary: true,
          },
        },
      },
    }),
  ]);

  console.log(`Created ${parties.length} parties (insureds/clients)`);

  // Create Policies with Vehicles, Properties, and Coverages
  const policies = await Promise.all([
    // Personal Auto Policy - Robert Thompson
    prisma.policy.create({
      data: {
        policyNumber: 'PAP-2024-001234',
        lineOfBusiness: 'AUTOP',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-06-15'),
        expirationDate: new Date('2025-06-15'),
        writtenPremium: 1850,
        annualPremium: 1850,
        carrierName: 'Progressive Insurance',
        carrierCode: 'PROG',
        parties: {
          create: {
            partyId: parties[0].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        vehicles: {
          create: {
            vin: '1HGCM82633A004352',
            year: 2023,
            make: 'Honda',
            model: 'Accord EX-L',
            bodyType: 'Sedan',
            vehicleUse: 'Pleasure',
            garagingZip: '33301',
          },
        },
        coverages: {
          create: [
            { coverageCode: 'BI', coverageDesc: 'Bodily Injury', limitAmount: 100000, deductibleAmount: 0 },
            { coverageCode: 'PD', coverageDesc: 'Property Damage', limitAmount: 50000, deductibleAmount: 0 },
            { coverageCode: 'COMP', coverageDesc: 'Comprehensive', limitAmount: 45000, deductibleAmount: 500 },
            { coverageCode: 'COLL', coverageDesc: 'Collision', limitAmount: 45000, deductibleAmount: 1000 },
            { coverageCode: 'UM', coverageDesc: 'Uninsured Motorist', limitAmount: 100000, deductibleAmount: 0 },
          ],
        },
      },
    }),
    // Personal Auto Policy - Jennifer Martinez (Tesla)
    prisma.policy.create({
      data: {
        policyNumber: 'PAP-2024-001567',
        lineOfBusiness: 'AUTOP',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-09-01'),
        expirationDate: new Date('2025-09-01'),
        writtenPremium: 2450,
        annualPremium: 2450,
        carrierName: 'GEICO',
        carrierCode: 'GEIC',
        parties: {
          create: {
            partyId: parties[1].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        vehicles: {
          create: {
            vin: '5YJSA1E26MF123456',
            year: 2024,
            make: 'Tesla',
            model: 'Model S Plaid',
            bodyType: 'Sedan',
            vehicleUse: 'Commute',
            garagingZip: '33139',
          },
        },
        coverages: {
          create: [
            { coverageCode: 'BI', coverageDesc: 'Bodily Injury', limitAmount: 250000, deductibleAmount: 0 },
            { coverageCode: 'PD', coverageDesc: 'Property Damage', limitAmount: 100000, deductibleAmount: 0 },
            { coverageCode: 'COMP', coverageDesc: 'Comprehensive', limitAmount: 95000, deductibleAmount: 500 },
            { coverageCode: 'COLL', coverageDesc: 'Collision', limitAmount: 95000, deductibleAmount: 500 },
          ],
        },
      },
    }),
    // Homeowners Policy - Robert Thompson
    prisma.policy.create({
      data: {
        policyNumber: 'HO3-2024-002345',
        lineOfBusiness: 'HOME',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-04-01'),
        expirationDate: new Date('2025-04-01'),
        writtenPremium: 4200,
        annualPremium: 4200,
        carrierName: 'Citizens Property Insurance',
        carrierCode: 'CPIC',
        parties: {
          create: {
            partyId: parties[0].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        properties: {
          create: {
            propertyType: 'Single Family',
            constructionType: 'Masonry',
            yearBuilt: 2018,
            squareFootage: 2850,
            numberOfStories: 2,
            roofType: 'Tile',
            address: '2847 Palm Beach Boulevard',
            city: 'Fort Lauderdale',
            state: 'FL',
            zip: '33301',
            buildingValue: 650000,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'DWELL', coverageDesc: 'Dwelling Coverage', limitAmount: 650000, deductibleAmount: 2500 },
            { coverageCode: 'OTS', coverageDesc: 'Other Structures', limitAmount: 65000, deductibleAmount: 2500 },
            { coverageCode: 'PP', coverageDesc: 'Personal Property', limitAmount: 325000, deductibleAmount: 2500 },
            { coverageCode: 'LOU', coverageDesc: 'Loss of Use', limitAmount: 130000, deductibleAmount: 0 },
            { coverageCode: 'LIAB', coverageDesc: 'Personal Liability', limitAmount: 300000, deductibleAmount: 0 },
          ],
        },
      },
    }),
    // Condo Policy - Jennifer Martinez
    prisma.policy.create({
      data: {
        policyNumber: 'HO6-2024-002789',
        lineOfBusiness: 'HOME',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-07-15'),
        expirationDate: new Date('2025-07-15'),
        writtenPremium: 1850,
        annualPremium: 1850,
        carrierName: 'Universal Property & Casualty',
        carrierCode: 'UPCIC',
        parties: {
          create: {
            partyId: parties[1].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        properties: {
          create: {
            propertyType: 'Condo',
            constructionType: 'Concrete',
            yearBuilt: 2020,
            squareFootage: 1800,
            numberOfStories: 1,
            roofType: 'Flat',
            address: '1456 Ocean Drive, Unit 12B',
            city: 'Miami Beach',
            state: 'FL',
            zip: '33139',
            buildingValue: 150000,
            contentsValue: 200000,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'DWELL', coverageDesc: 'Unit Improvements', limitAmount: 150000, deductibleAmount: 1000 },
            { coverageCode: 'PP', coverageDesc: 'Personal Property', limitAmount: 200000, deductibleAmount: 1000 },
            { coverageCode: 'LIAB', coverageDesc: 'Personal Liability', limitAmount: 500000, deductibleAmount: 0 },
          ],
        },
      },
    }),
    // Commercial Property - Sunshine Construction
    prisma.policy.create({
      data: {
        policyNumber: 'CPP-2024-003456',
        lineOfBusiness: 'PROP',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-01-01'),
        writtenPremium: 28500,
        annualPremium: 28500,
        carrierName: 'Hartford Insurance',
        carrierCode: 'HART',
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        properties: {
          create: {
            propertyType: 'Commercial',
            constructionType: 'Steel',
            yearBuilt: 2010,
            squareFootage: 15000,
            numberOfStories: 1,
            roofType: 'Flat',
            address: '5500 NW 33rd Avenue',
            city: 'Fort Lauderdale',
            state: 'FL',
            zip: '33309',
            buildingValue: 2800000,
            contentsValue: 500000,
            businessIncomeValue: 1000000,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'BLDG', coverageDesc: 'Building Coverage', limitAmount: 2800000, deductibleAmount: 10000 },
            { coverageCode: 'BPP', coverageDesc: 'Business Personal Property', limitAmount: 500000, deductibleAmount: 5000 },
            { coverageCode: 'BI', coverageDesc: 'Business Interruption', limitAmount: 1000000, deductibleAmount: 0 },
            { coverageCode: 'EQ', coverageDesc: 'Equipment Breakdown', limitAmount: 250000, deductibleAmount: 2500 },
          ],
        },
      },
    }),
    // General Liability - Sunshine Construction
    prisma.policy.create({
      data: {
        policyNumber: 'CGL-2024-003789',
        lineOfBusiness: 'GL',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-01-01'),
        writtenPremium: 15800,
        annualPremium: 15800,
        carrierName: 'Hartford Insurance',
        carrierCode: 'HART',
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'OCC', coverageDesc: 'Each Occurrence', limitAmount: 1000000, deductibleAmount: 0 },
            { coverageCode: 'AGG', coverageDesc: 'General Aggregate', limitAmount: 2000000, deductibleAmount: 0 },
            { coverageCode: 'PROD', coverageDesc: 'Products-Completed Ops', limitAmount: 2000000, deductibleAmount: 0 },
            { coverageCode: 'PI', coverageDesc: 'Personal & Adv Injury', limitAmount: 1000000, deductibleAmount: 0 },
          ],
        },
      },
    }),
    // Workers Compensation - Sunshine Construction
    prisma.policy.create({
      data: {
        policyNumber: 'WC-2024-004123',
        lineOfBusiness: 'WORK',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-03-01'),
        expirationDate: new Date('2025-03-01'),
        writtenPremium: 42000,
        annualPremium: 42000,
        carrierName: 'Employers Insurance',
        carrierCode: 'EMPL',
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'WC', coverageDesc: 'Workers Comp - Statutory', limitAmount: 0, deductibleAmount: 0 },
            { coverageCode: 'EL', coverageDesc: 'Employers Liability', limitAmount: 1000000, deductibleAmount: 0 },
          ],
        },
      },
    }),
    // Commercial Auto - Rodriguez Trucking
    prisma.policy.create({
      data: {
        policyNumber: 'CAP-2024-004567',
        lineOfBusiness: 'AUTOC',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-02-15'),
        expirationDate: new Date('2025-02-15'),
        writtenPremium: 18500,
        annualPremium: 18500,
        carrierName: 'Progressive Commercial',
        carrierCode: 'PROGC',
        parties: {
          create: {
            partyId: parties[9].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        vehicles: {
          create: [
            {
              vin: '1FTFW1ET5EFA12345',
              year: 2024,
              make: 'Ford',
              model: 'F-150 Lightning',
              bodyType: 'Pickup',
              vehicleType: 'COM',
              vehicleUse: 'Business',
              garagingZip: '33166',
            },
            {
              vin: '3C6UR5CL8JG234567',
              year: 2023,
              make: 'RAM',
              model: '2500 Heavy Duty',
              bodyType: 'Pickup',
              vehicleType: 'COM',
              vehicleUse: 'Business',
              garagingZip: '33166',
            },
          ],
        },
        coverages: {
          create: [
            { coverageCode: 'BI', coverageDesc: 'Bodily Injury', limitAmount: 1000000, deductibleAmount: 0 },
            { coverageCode: 'PD', coverageDesc: 'Property Damage', limitAmount: 500000, deductibleAmount: 0 },
            { coverageCode: 'COMP', coverageDesc: 'Comprehensive', limitAmount: 150000, deductibleAmount: 2500 },
            { coverageCode: 'COLL', coverageDesc: 'Collision', limitAmount: 150000, deductibleAmount: 5000 },
            { coverageCode: 'CARGO', coverageDesc: 'Motor Truck Cargo', limitAmount: 100000, deductibleAmount: 1000 },
          ],
        },
      },
    }),
    // Medical Professional Liability - Coastal Medical
    prisma.policy.create({
      data: {
        policyNumber: 'MPL-2024-005234',
        lineOfBusiness: 'PROFLIAB',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-05-01'),
        expirationDate: new Date('2025-05-01'),
        writtenPremium: 85000,
        annualPremium: 85000,
        carrierName: 'The Doctors Company',
        carrierCode: 'TDC',
        parties: {
          create: {
            partyId: parties[5].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'OCC', coverageDesc: 'Each Medical Incident', limitAmount: 1000000, deductibleAmount: 25000 },
            { coverageCode: 'AGG', coverageDesc: 'Annual Aggregate', limitAmount: 3000000, deductibleAmount: 0 },
          ],
        },
      },
    }),
    // Policy expiring soon - Michael Chen HO3
    prisma.policy.create({
      data: {
        policyNumber: 'HO3-2023-001122',
        lineOfBusiness: 'HOME',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-02-15'),
        expirationDate: new Date('2025-02-15'),
        writtenPremium: 5800,
        annualPremium: 5800,
        carrierName: 'Chubb Insurance',
        carrierCode: 'CHUBB',
        parties: {
          create: {
            partyId: parties[2].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        properties: {
          create: {
            propertyType: 'Single Family',
            constructionType: 'Masonry',
            yearBuilt: 2015,
            squareFootage: 4200,
            numberOfStories: 2,
            roofType: 'Tile',
            address: '892 Royal Palm Way',
            city: 'Boca Raton',
            state: 'FL',
            zip: '33432',
            buildingValue: 1250000,
            contentsValue: 625000,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'DWELL', coverageDesc: 'Dwelling Coverage', limitAmount: 1250000, deductibleAmount: 5000 },
            { coverageCode: 'PP', coverageDesc: 'Personal Property', limitAmount: 625000, deductibleAmount: 5000 },
            { coverageCode: 'LIAB', coverageDesc: 'Personal Liability', limitAmount: 1000000, deductibleAmount: 0 },
          ],
        },
      },
    }),
    // Policy expiring soon - Michael Chen Auto
    prisma.policy.create({
      data: {
        policyNumber: 'PAP-2023-000891',
        lineOfBusiness: 'AUTOP',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-02-28'),
        expirationDate: new Date('2025-02-28'),
        writtenPremium: 3200,
        annualPremium: 3200,
        carrierName: 'Chubb Insurance',
        carrierCode: 'CHUBB',
        parties: {
          create: {
            partyId: parties[2].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        vehicles: {
          create: {
            vin: 'WBA8E9C55JNG12345',
            year: 2022,
            make: 'BMW',
            model: 'M5 Competition',
            bodyType: 'Sedan',
            vehicleUse: 'Pleasure',
            garagingZip: '33432',
          },
        },
        coverages: {
          create: [
            { coverageCode: 'BI', coverageDesc: 'Bodily Injury', limitAmount: 500000, deductibleAmount: 0 },
            { coverageCode: 'PD', coverageDesc: 'Property Damage', limitAmount: 250000, deductibleAmount: 0 },
            { coverageCode: 'COMP', coverageDesc: 'Comprehensive', limitAmount: 85000, deductibleAmount: 1000 },
            { coverageCode: 'COLL', coverageDesc: 'Collision', limitAmount: 85000, deductibleAmount: 1000 },
          ],
        },
      },
    }),
    // Amanda Foster - Porsche Auto
    prisma.policy.create({
      data: {
        policyNumber: 'PAP-2024-002001',
        lineOfBusiness: 'AUTOP',
        policyStatus: 'ACTIVE',
        effectiveDate: new Date('2024-08-01'),
        expirationDate: new Date('2025-08-01'),
        writtenPremium: 4500,
        annualPremium: 4500,
        carrierName: 'Hagerty Insurance',
        carrierCode: 'HGTY',
        parties: {
          create: {
            partyId: parties[8].id,
            role: 'NAMED_INSURED',
            isPrimaryInsured: true,
          },
        },
        vehicles: {
          create: {
            vin: 'WVWZZZ3CZWE123456',
            year: 2024,
            make: 'Porsche',
            model: 'Cayenne Turbo GT',
            bodyType: 'SUV',
            vehicleUse: 'Pleasure',
            garagingZip: '33301',
            statedAmount: 185000,
          },
        },
        coverages: {
          create: [
            { coverageCode: 'BI', coverageDesc: 'Bodily Injury', limitAmount: 500000, deductibleAmount: 0 },
            { coverageCode: 'PD', coverageDesc: 'Property Damage', limitAmount: 250000, deductibleAmount: 0 },
            { coverageCode: 'COMP', coverageDesc: 'Comprehensive', limitAmount: 185000, deductibleAmount: 1000 },
            { coverageCode: 'COLL', coverageDesc: 'Collision', limitAmount: 185000, deductibleAmount: 1000 },
          ],
        },
      },
    }),
  ]);

  console.log(`Created ${policies.length} policies`);

  // Create Claims
  const claims = await Promise.all([
    // Auto claim - minor accident
    prisma.claim.create({
      data: {
        claimNumber: 'CLM-2024-00123',
        claimStatus: 'OPEN',
        lossDate: new Date('2024-12-15'),
        reportedDate: new Date('2024-12-16'),
        lossDescription: 'Rear-end collision at traffic light on US-1. Minor bumper damage. No injuries reported. Third party vehicle also sustained minor damage.',
        lossAddress: 'US-1 & SE 17th Street',
        lossCity: 'Fort Lauderdale',
        lossState: 'FL',
        totalReserve: 4500,
        totalPaid: 0,
        policyId: policies[0].id,
        adjusterName: 'Mike Stevens',
        adjusterPhone: '(800) 555-0100',
        adjusterEmail: 'mstevens@progressive.com',
      },
    }),
    // Homeowners claim - water damage
    prisma.claim.create({
      data: {
        claimNumber: 'CLM-2024-00456',
        claimStatus: 'OPEN',
        lossCauseCode: 'WATER',
        lossDate: new Date('2024-11-20'),
        reportedDate: new Date('2024-11-21'),
        lossDescription: 'Water heater failure causing flooding in garage and adjacent rooms. Significant water damage to flooring, drywall, and personal property.',
        lossAddress: '2847 Palm Beach Boulevard',
        lossCity: 'Fort Lauderdale',
        lossState: 'FL',
        lossZip: '33301',
        totalReserve: 28000,
        totalPaid: 5000,
        policyId: policies[2].id,
        adjusterName: 'Sandra Lee',
        adjusterPhone: '(800) 555-0200',
        adjusterEmail: 'slee@citizens.com',
      },
    }),
    // GL claim - slip and fall
    prisma.claim.create({
      data: {
        claimNumber: 'CLM-2024-00789',
        claimStatus: 'OPEN',
        lossCauseCode: 'SLIP_FALL',
        lossDate: new Date('2024-10-05'),
        reportedDate: new Date('2024-10-06'),
        lossDescription: 'Visitor slipped on wet floor at construction site. Claimant reports back injury and is seeking medical treatment. Incident report filed with OSHA.',
        lossAddress: '5500 NW 33rd Avenue',
        lossCity: 'Fort Lauderdale',
        lossState: 'FL',
        lossZip: '33309',
        totalReserve: 75000,
        totalPaid: 12500,
        policyId: policies[5].id,
        adjusterName: 'Robert Chen',
        adjusterPhone: '(800) 555-0300',
        adjusterEmail: 'rchen@hartford.com',
      },
    }),
    // Workers Comp claim
    prisma.claim.create({
      data: {
        claimNumber: 'CLM-2024-01012',
        claimStatus: 'OPEN',
        lossCauseCode: 'MACHINERY',
        lossDate: new Date('2024-09-18'),
        reportedDate: new Date('2024-09-18'),
        lossDescription: 'Employee injured hand while operating power saw. Required emergency room visit and 10 stitches. Employee out of work for 2 weeks.',
        lossAddress: 'Job Site - 1500 NE 4th Court',
        lossCity: 'Fort Lauderdale',
        lossState: 'FL',
        totalReserve: 18000,
        totalPaid: 8500,
        policyId: policies[6].id,
        adjusterName: 'Patricia Moore',
        adjusterPhone: '(800) 555-0400',
        adjusterEmail: 'pmoore@employers.com',
      },
    }),
    // Auto claim - theft (closed)
    prisma.claim.create({
      data: {
        claimNumber: 'CLM-2024-01345',
        claimStatus: 'CLOSED',
        lossCauseCode: 'THEFT',
        lossDate: new Date('2024-08-10'),
        reportedDate: new Date('2024-08-11'),
        closedDate: new Date('2024-09-15'),
        closedReason: 'Claim paid in full',
        lossDescription: 'Vehicle broken into in parking garage. Laptop, GPS unit, and personal items stolen. Window smashed.',
        lossAddress: 'Sawgrass Mills Mall Parking Garage',
        lossCity: 'Sunrise',
        lossState: 'FL',
        totalReserve: 3500,
        totalPaid: 3200,
        policyId: policies[1].id,
        adjusterName: 'James Wilson',
        adjusterPhone: '(800) 555-0500',
        adjusterEmail: 'jwilson@geico.com',
      },
    }),
    // Condo claim - hurricane damage
    prisma.claim.create({
      data: {
        claimNumber: 'CLM-2024-01678',
        claimStatus: 'OPEN',
        lossCauseCode: 'WIND',
        lossDate: new Date('2024-10-09'),
        reportedDate: new Date('2024-10-12'),
        lossDescription: 'Hurricane Milton caused water intrusion through balcony door. Damage to flooring, furniture, and electronics. Association handling exterior repairs separately.',
        lossAddress: '1456 Ocean Drive, Unit 12B',
        lossCity: 'Miami Beach',
        lossState: 'FL',
        lossZip: '33139',
        totalReserve: 45000,
        totalPaid: 0,
        policyId: policies[3].id,
        adjusterName: 'Maria Santos',
        adjusterPhone: '(800) 555-0600',
        adjusterEmail: 'msantos@upcic.com',
      },
    }),
  ]);

  console.log(`Created ${claims.length} claims`);

  // Create Surety Bonds
  const bonds = await Promise.all([
    prisma.suretyBond.create({
      data: {
        bondNumber: 'SB-2024-00100',
        bondType: 'CONTRACT',
        bondSubType: 'Performance',
        bondStatus: 'ACTIVE',
        effectiveDate: new Date('2024-03-15'),
        expirationDate: new Date('2025-03-15'),
        penaltyAmount: 500000,
        premiumAmount: 7500,
        suretyCarrier: 'Travelers Surety',
        suretyCarrierCode: 'TRAV',
        projectName: 'Municipal Parking Garage Renovation - Phase 2',
        projectAddress: '100 N Andrews Avenue',
        projectCity: 'Fort Lauderdale',
        projectState: 'FL',
        contractDescription: 'Renovation of downtown municipal parking garage including structural repairs and lighting upgrades',
        contractAmount: 500000,
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'PRINCIPAL',
          },
        },
      },
    }),
    prisma.suretyBond.create({
      data: {
        bondNumber: 'SB-2024-00101',
        bondType: 'CONTRACT',
        bondSubType: 'Performance & Payment',
        bondStatus: 'ACTIVE',
        effectiveDate: new Date('2024-06-01'),
        expirationDate: new Date('2026-06-01'),
        penaltyAmount: 1200000,
        premiumAmount: 18000,
        suretyCarrier: 'Liberty Mutual Surety',
        suretyCarrierCode: 'LBMS',
        projectName: 'New Elementary School - Pembroke Pines',
        projectAddress: '600 SE 3rd Avenue',
        projectCity: 'Fort Lauderdale',
        projectState: 'FL',
        contractDescription: 'New construction of K-5 elementary school with 30 classrooms and administrative facilities',
        contractAmount: 12000000,
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'PRINCIPAL',
          },
        },
      },
    }),
    prisma.suretyBond.create({
      data: {
        bondNumber: 'SB-2024-00102',
        bondType: 'COMMERCIAL',
        bondSubType: 'License & Permit',
        bondStatus: 'ACTIVE',
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-01-01'),
        penaltyAmount: 25000,
        premiumAmount: 375,
        suretyCarrier: 'Surety One',
        suretyCarrierCode: 'SONE',
        contractDescription: 'General Contractor License Bond - CGC1234567',
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'PRINCIPAL',
          },
        },
      },
    }),
    prisma.suretyBond.create({
      data: {
        bondNumber: 'SB-2024-00103',
        bondType: 'CONTRACT',
        bondSubType: 'Performance',
        bondStatus: 'ACTIVE',
        effectiveDate: new Date('2024-08-15'),
        expirationDate: new Date('2025-08-15'),
        penaltyAmount: 350000,
        premiumAmount: 5250,
        suretyCarrier: 'Travelers Surety',
        suretyCarrierCode: 'TRAV',
        projectName: 'Road Resurfacing - Jog Road Extension',
        projectAddress: '301 N Olive Avenue',
        projectCity: 'West Palm Beach',
        projectState: 'FL',
        contractDescription: 'Resurfacing and drainage improvements for 2.5 miles of Jog Road',
        contractAmount: 350000,
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'PRINCIPAL',
          },
        },
      },
    }),
    prisma.suretyBond.create({
      data: {
        bondNumber: 'SB-2024-00104',
        bondType: 'CONTRACT',
        bondSubType: 'Bid Bond',
        bondStatus: 'ACTIVE',
        effectiveDate: new Date('2025-01-10'),
        expirationDate: new Date('2025-04-10'),
        penaltyAmount: 100000,
        premiumAmount: 500,
        suretyCarrier: 'CNA Surety',
        suretyCarrierCode: 'CNAS',
        projectName: 'MIA Terminal Expansion Project',
        projectAddress: '4200 NW 36th Street',
        projectCity: 'Miami',
        projectState: 'FL',
        contractDescription: 'Bid bond for Miami International Airport Terminal D expansion project',
        contractAmount: 10000000,
        parties: {
          create: {
            partyId: parties[3].id,
            role: 'PRINCIPAL',
          },
        },
      },
    }),
  ]);

  console.log(`Created ${bonds.length} surety bonds`);

  // Create Leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        leadStatus: 'NEW',
        leadSource: 'WEB_INQUIRY',
        firstName: 'Carlos',
        lastName: 'Mendez',
        email: 'carlos.mendez@email.com',
        phone: '(305) 555-1111',
        companyName: 'Mendez Landscaping Services',
        notes: 'Looking for commercial auto and GL coverage for landscaping business with 5 trucks and 12 employees.',
        estimatedPremium: 15000,
        interestedLines: ['AUTOC', 'GL'],
        assignedTo: users[0].id,
      },
    }),
    prisma.lead.create({
      data: {
        leadStatus: 'CONTACTED',
        leadSource: 'REFERRAL',
        firstName: 'Patricia',
        lastName: 'Nguyen',
        email: 'patricia.nguyen@techstartup.io',
        phone: '(954) 555-2222',
        companyName: 'InnovateTech Solutions',
        notes: 'Referred by Michael Chen. Tech startup needs D&O, E&O, and cyber liability coverage. Series A funding just closed.',
        estimatedPremium: 45000,
        interestedLines: ['PROFLIAB'],
        assignedTo: users[0].id,
        contactedDate: new Date('2025-01-28'),
      },
    }),
    prisma.lead.create({
      data: {
        leadStatus: 'QUOTED',
        leadSource: 'COLD_CALL',
        firstName: 'William',
        lastName: 'Jackson',
        email: 'wjackson@jacksonplumbing.com',
        phone: '(561) 555-3333',
        companyName: 'Jackson Plumbing & HVAC',
        notes: 'Existing client referral. Needs to replace current coverage - unhappy with claims handling. Quote sent 1/28.',
        estimatedPremium: 22000,
        interestedLines: ['GL', 'AUTOC', 'WORK'],
        assignedTo: users[1].id,
        contactedDate: new Date('2025-01-25'),
        quotedDate: new Date('2025-01-28'),
      },
    }),
    prisma.lead.create({
      data: {
        leadStatus: 'QUALIFIED',
        leadSource: 'WEB_INQUIRY',
        firstName: 'Rachel',
        lastName: 'Okonkwo',
        email: 'rachel@suncoastdental.com',
        phone: '(786) 555-4444',
        companyName: 'Suncoast Dental Group',
        notes: '3-location dental practice. Needs professional liability, property, and workers comp. Comparing against 2 other agencies.',
        estimatedPremium: 38000,
        interestedLines: ['PROFLIAB', 'PROP', 'WORK'],
        assignedTo: users[1].id,
        contactedDate: new Date('2025-01-20'),
      },
    }),
    prisma.lead.create({
      data: {
        leadStatus: 'NEW',
        leadSource: 'WEB_INQUIRY',
        firstName: 'Thomas',
        lastName: 'Rivera',
        email: 'trivera@riverafoods.com',
        phone: '(954) 555-5555',
        companyName: 'Rivera Foods Distribution',
        notes: 'Food distribution company with 15 refrigerated trucks. Needs commercial auto, cargo, and GL coverage.',
        estimatedPremium: 55000,
        interestedLines: ['AUTOC', 'GL', 'IMARINE'],
        assignedTo: users[0].id,
      },
    }),
    prisma.lead.create({
      data: {
        leadStatus: 'NEW',
        leadSource: 'DIRECT_MAIL',
        firstName: 'Sandra',
        lastName: 'Kim',
        email: 'sandra.kim@email.com',
        phone: '(305) 555-6666',
        notes: 'New homeowner in Coral Gables. Looking for HO3 and personal auto quotes. Just relocated from California.',
        estimatedPremium: 8000,
        interestedLines: ['HOME', 'AUTOP'],
        assignedTo: users[0].id,
      },
    }),
  ]);

  console.log(`Created ${leads.length} leads`);

  // Create Activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        activityType: 'CALL',
        activityStatus: 'PENDING',
        subject: 'Renewal discussion - HO3 policy',
        description: 'Called to discuss upcoming renewal. Client interested in increasing coverage limits due to recent renovations. Will send updated quote.',
        dueDate: new Date('2025-02-10'),
        partyId: parties[2].id,
        policyId: policies[9].id,
        assignedTo: users[0].id,
        priority: 2,
      },
    }),
    prisma.activity.create({
      data: {
        activityType: 'MEETING',
        activityStatus: 'SCHEDULED',
        subject: 'New business presentation - Tech startup',
        description: 'In-person meeting to present D&O/E&O/Cyber proposal. Bring comparison charts and loss prevention materials.',
        dueDate: new Date('2025-02-05'),
        assignedTo: users[0].id,
        priority: 1,
      },
    }),
    prisma.activity.create({
      data: {
        activityType: 'TASK',
        activityStatus: 'PENDING',
        subject: 'Submit claim documents to adjuster',
        description: 'Upload photos and contractor estimates for water damage claim CLM-2024-00456 to carrier portal.',
        dueDate: new Date('2025-02-03'),
        partyId: parties[0].id,
        claimId: claims[1].id,
        assignedTo: users[1].id,
        priority: 1,
      },
    }),
    prisma.activity.create({
      data: {
        activityType: 'EMAIL',
        activityStatus: 'PENDING',
        subject: 'Send GL audit worksheets',
        description: 'Carrier requesting payroll and subcontractor records for annual GL audit. Deadline is Feb 15.',
        dueDate: new Date('2025-02-08'),
        partyId: parties[3].id,
        policyId: policies[5].id,
        assignedTo: users[1].id,
        priority: 2,
      },
    }),
    prisma.activity.create({
      data: {
        activityType: 'FOLLOW_UP',
        activityStatus: 'PENDING',
        subject: 'Follow up on quoted lead',
        description: 'Check if William Jackson has reviewed the quote. Address any questions about coverage or pricing.',
        dueDate: new Date('2025-02-04'),
        assignedTo: users[1].id,
        priority: 2,
      },
    }),
    prisma.activity.create({
      data: {
        activityType: 'TASK',
        activityStatus: 'COMPLETED',
        subject: 'Order MVRs for fleet renewal',
        description: 'Pull motor vehicle reports for all drivers on Rodriguez Trucking account before Feb renewal.',
        dueDate: new Date('2025-02-01'),
        completedDate: new Date('2025-01-30'),
        partyId: parties[9].id,
        policyId: policies[7].id,
        assignedTo: users[0].id,
        priority: 2,
      },
    }),
    prisma.activity.create({
      data: {
        activityType: 'MEETING',
        activityStatus: 'SCHEDULED',
        subject: 'Bond application review',
        description: 'Meet with Sunshine Construction to review financials for new bid bond application.',
        dueDate: new Date('2025-02-12'),
        partyId: parties[3].id,
        assignedTo: users[2].id,
        priority: 2,
      },
    }),
    prisma.activity.create({
      data: {
        activityType: 'CALL',
        activityStatus: 'PENDING',
        subject: 'Claim status update',
        description: 'Call adjuster for status on hurricane claim. Client requesting update on timeline.',
        dueDate: new Date('2025-02-03'),
        partyId: parties[1].id,
        claimId: claims[5].id,
        assignedTo: users[0].id,
        priority: 1,
      },
    }),
  ]);

  console.log(`Created ${activities.length} activities`);

  // Create some audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        entityType: 'Policy',
        entityId: policies[0].id,
        action: 'CREATE',
        userId: users[0].id,
        userName: 'Sarah Mitchell',
        newValues: { policyStatus: 'ACTIVE', message: 'Policy created and bound' },
      },
      {
        entityType: 'Claim',
        entityId: claims[0].id,
        action: 'CREATE',
        userId: users[1].id,
        userName: 'James Carter',
        newValues: { claimStatus: 'OPEN', message: 'Claim reported and opened' },
      },
      {
        entityType: 'Claim',
        entityId: claims[4].id,
        action: 'UPDATE',
        userId: users[1].id,
        userName: 'James Carter',
        oldValues: { claimStatus: 'OPEN' },
        newValues: { claimStatus: 'CLOSED', totalPaid: 3200 },
      },
      {
        entityType: 'Lead',
        entityId: leads[2].id,
        action: 'UPDATE',
        userId: users[1].id,
        userName: 'James Carter',
        oldValues: { leadStatus: 'CONTACTED' },
        newValues: { leadStatus: 'QUOTED' },
      },
    ],
  });

  console.log('Created audit log entries');

  console.log('\n========================================');
  console.log('Demo data seeding complete!');
  console.log('========================================');
  console.log('\nDemo Users (password: Demo2026!):');
  console.log('  - sarah.mitchell@acordpcs.demo (Agent)');
  console.log('  - james.carter@acordpcs.demo (Agent)');
  console.log('  - maria.gonzalez@acordpcs.demo (Admin)');
  console.log('\nAdmin User (created earlier):');
  console.log('  - admin@acordpcs.local / SecureAdmin2026');
  console.log('\nData Summary:');
  console.log(`  - ${parties.length} Parties (clients/insureds)`);
  console.log(`  - ${policies.length} Policies`);
  console.log(`  - ${claims.length} Claims`);
  console.log(`  - ${bonds.length} Surety Bonds`);
  console.log(`  - ${leads.length} Leads`);
  console.log(`  - ${activities.length} Activities`);
}

try {
  await main();
} catch (e) {
  console.error('Seeding failed:', e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
