/**
 * TrustGrid Demo Seed
 * Populates the RCCG Convention Operations scenario for the hackathon demo
 */

import { PrismaClient, WorkerType, InstitutionType } from '@prisma/client'

// ── Platform Catalog seed data ─────────────────────────────────────────────
const CATALOG_DOMAINS = [
  { name: 'Technical & Trades',     description: 'Skilled tradespeople and technical service providers', icon: 'wrench',    color: '#F59E0B', sortOrder: 1 },
  { name: 'Professional Services',  description: 'Qualified professionals with recognised credentials',  icon: 'briefcase', color: '#4F46E5', sortOrder: 2 },
  { name: 'Healthcare & Wellness',  description: 'Medical professionals, caregivers, and wellness experts', icon: 'heart', color: '#EF4444', sortOrder: 3 },
  { name: 'Security & Safety',      description: 'Security guards, supervisors, and safety officers',   icon: 'shield',    color: '#6366F1', sortOrder: 4 },
  { name: 'Events & Hospitality',   description: 'Event management, catering, and hospitality staff',   icon: 'calendar',  color: '#8B5CF6', sortOrder: 5 },
  { name: 'Transport & Logistics',  description: 'Drivers, dispatch riders, and logistics coordinators', icon: 'truck',    color: '#0EA5E9', sortOrder: 6 },
  { name: 'Facility Management',    description: 'Cleaning, domestic services, and facility maintenance', icon: 'home',    color: '#10B981', sortOrder: 7 },
  { name: 'Education & Training',   description: 'Teachers, tutors, and corporate trainers',             icon: 'book',     color: '#F97316', sortOrder: 8 },
  { name: 'Creative & Media',       description: 'Photographers, designers, and media professionals',   icon: 'camera',   color: '#EC4899', sortOrder: 9 },
];
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

// ── Full Service Catalog — Upwork-style hierarchy ──────────────────────────
// Structure: Domain → Category → Skills/Specialisations
// Covers: Artisans, Professionals, Healthcare, Creative, Technical, Management
// Platform admin can extend this via the admin catalog management UI

const FULL_SERVICE_CATALOG = [
  // ── TECHNICAL / TRADES ───────────────────────────────────────────────────
  { id: 'cat_electrical', name: 'Electrical', domain: 'Technical & Trades', icon: 'bolt', color: '#F59E0B', defaultMinTrustScore: 60,
    skills: ['Electrician','Solar Installation','Panel Wiring','Generator Maintenance','Industrial Wiring','Stage Lighting','Low Voltage Systems','Smart Home Installation'],
    requiresCertification: ['COREN','Trade Licence'],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_plumbing', name: 'Plumbing', domain: 'Technical & Trades', icon: 'droplets', color: '#3B82F6', defaultMinTrustScore: 55,
    skills: ['Plumber','Pipe Fitting','Borehole Services','Drainage','Sanitary Installation','Water Treatment'],
    requiresCertification: ['Trade Licence'],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_hvac', name: 'HVAC & Cooling', domain: 'Technical & Trades', icon: 'wind', color: '#06B6D4', defaultMinTrustScore: 60,
    skills: ['AC Technician','Refrigeration','Ventilation Systems','Chiller Maintenance','Split Unit Installation'],
    requiresCertification: ['Trade Licence'],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_construction', name: 'Construction & Civil', domain: 'Technical & Trades', icon: 'hard-hat', color: '#92400E', defaultMinTrustScore: 55,
    skills: ['Builder','Bricklayer','Carpenter','Welder','Steel Fixer','Tiling','Painting & Decoration','Roofing'],
    requiresCertification: ['COREN (Civil)','Site Safety Card'],
    workerTypes: ['CONTRACTOR','EMPLOYEE'] },
  { id: 'cat_it_support', name: 'IT & Technology', domain: 'Technical & Trades', icon: 'monitor', color: '#4F46E5', defaultMinTrustScore: 60,
    skills: ['IT Support','Network Engineer','CCTV Installation','Server Administrator','Software Developer','Web Developer','Cybersecurity','Data Analyst'],
    requiresCertification: [],
    workerTypes: ['CONTRACTOR','FREELANCER'] },

  // ── PROFESSIONAL SERVICES ────────────────────────────────────────────────
  { id: 'cat_legal', name: 'Legal & Compliance', domain: 'Professional Services', icon: 'scale', color: '#7C3AED', defaultMinTrustScore: 75,
    skills: ['Corporate Lawyer','Employment Lawyer','Property Lawyer','Litigation','Contract Review','Compliance Officer','Legal Secretary','Notary'],
    requiresCertification: ['NBA Membership','SAN (Senior Advocate)'],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_finance', name: 'Finance & Accounting', domain: 'Professional Services', icon: 'calculator', color: '#0D9488', defaultMinTrustScore: 75,
    skills: ['Accountant','Auditor','Financial Analyst','Tax Consultant','Bookkeeper','Payroll Manager','CFO Services','Investment Advisor'],
    requiresCertification: ['ICAN','ACCA','CFA'],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_engineering', name: 'Engineering & Design', domain: 'Professional Services', icon: 'settings', color: '#DC2626', defaultMinTrustScore: 70,
    skills: ['Civil Engineer','Structural Engineer','Mechanical Engineer','Electrical Engineer','Architect','Interior Designer','Urban Planner','Quantity Surveyor'],
    requiresCertification: ['COREN','NIA','NIOB'],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_consulting', name: 'Management & Consulting', domain: 'Professional Services', icon: 'briefcase', color: '#059669', defaultMinTrustScore: 70,
    skills: ['Strategy Consultant','HR Consultant','Project Manager','Business Analyst','Change Manager','Operations Manager','Training & Development'],
    requiresCertification: [],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_communications', name: 'Communications & PR', domain: 'Professional Services', icon: 'megaphone', color: '#F97316', defaultMinTrustScore: 60,
    skills: ['Communications Manager','PR Specialist','Brand Strategist','Social Media Manager','Journalist','Copywriter','Translator','Interpreter'],
    requiresCertification: [],
    workerTypes: ['CONTRACTOR','FREELANCER'] },

  // ── HEALTHCARE & WELLNESS ────────────────────────────────────────────────
  { id: 'cat_medical', name: 'Medical & Clinical', domain: 'Healthcare & Wellness', icon: 'heart-pulse', color: '#EF4444', defaultMinTrustScore: 85,
    skills: ['Medical Doctor','Nurse','Pharmacist','Physiotherapist','Dentist','Laboratory Scientist','Radiographer','Paramedic'],
    requiresCertification: ['MDCN','NMCN','PCN'],
    workerTypes: ['CONTRACTOR','VOLUNTEER'] },
  { id: 'cat_welfare', name: 'Welfare & Social Care', domain: 'Healthcare & Wellness', icon: 'heart', color: '#EC4899', defaultMinTrustScore: 65,
    skills: ['Social Worker','Counsellor','Child Welfare Officer','Disability Support','Elderly Care','Mental Health Volunteer'],
    requiresCertification: [],
    workerTypes: ['VOLUNTEER','EMPLOYEE'] },
  { id: 'cat_fitness', name: 'Fitness & Wellness', domain: 'Healthcare & Wellness', icon: 'activity', color: '#10B981', defaultMinTrustScore: 55,
    skills: ['Fitness Instructor','Personal Trainer','Nutritionist','Yoga Instructor','Sports Coach'],
    requiresCertification: [],
    workerTypes: ['CONTRACTOR','FREELANCER'] },

  // ── SECURITY & SAFETY ────────────────────────────────────────────────────
  { id: 'cat_security', name: 'Security Services', domain: 'Security & Safety', icon: 'shield', color: '#6366F1', defaultMinTrustScore: 75,
    skills: ['Security Guard','Access Control Officer','Crowd Controller','CCTV Operator','Security Supervisor','Armed Guard','Fire Safety Officer'],
    requiresCertification: ['NSCDC Certification','PSC Licence'],
    workerTypes: ['CONTRACTOR','EMPLOYEE'] },

  // ── EVENTS & HOSPITALITY ─────────────────────────────────────────────────
  { id: 'cat_events', name: 'Events & Hospitality', domain: 'Events & Hospitality', icon: 'calendar', color: '#8B5CF6', defaultMinTrustScore: 50,
    skills: ['Event Manager','Stage Manager','Event Decorator','AV Technician','MC/Host','Protocol Officer','Usher','Event Photographer','Videographer'],
    requiresCertification: [],
    workerTypes: ['CONTRACTOR','FREELANCER'] },
  { id: 'cat_catering', name: 'Catering & Food Services', domain: 'Events & Hospitality', icon: 'utensils', color: '#F59E0B', defaultMinTrustScore: 50,
    skills: ['Chef','Caterer','Baker','Bartender','Waiter/Waitress','Food Safety Officer'],
    requiresCertification: ['NAFDAC Food Handler'],
    workerTypes: ['CONTRACTOR','FREELANCER'] },

  // ── TRANSPORT & LOGISTICS ────────────────────────────────────────────────
  { id: 'cat_transport', name: 'Transport & Logistics', domain: 'Transport & Logistics', icon: 'truck', color: '#0EA5E9', defaultMinTrustScore: 65,
    skills: ['Driver','Dispatch Rider','Truck Driver','Logistics Coordinator','Cargo Handler','Courier'],
    requiresCertification: ["Driver's Licence"],
    workerTypes: ['CONTRACTOR','EMPLOYEE'] },

  // ── FACILITY & CLEANING ──────────────────────────────────────────────────
  { id: 'cat_cleaning', name: 'Cleaning & Facility', domain: 'Facility Management', icon: 'sparkles', color: '#10B981', defaultMinTrustScore: 45,
    skills: ['Cleaner','Housekeeper','Laundry Worker','Gardener/Landscaper','Pest Control','Waste Management','Pool Attendant'],
    requiresCertification: [],
    workerTypes: ['CONTRACTOR','EMPLOYEE'] },
  { id: 'cat_domestic', name: 'Domestic Services', domain: 'Facility Management', icon: 'home', color: '#6B7280', defaultMinTrustScore: 50,
    skills: ['House Manager','Domestic Staff','Cook','Nanny/Au Pair','Personal Assistant','Driver-PA'],
    requiresCertification: [],
    workerTypes: ['EMPLOYEE','CONTRACTOR'] },

  // ── EDUCATION & TRAINING ─────────────────────────────────────────────────
  { id: 'cat_education', name: 'Education & Training', domain: 'Education', icon: 'book', color: '#F59E0B', defaultMinTrustScore: 65,
    skills: ['Teacher','Tutor','Corporate Trainer','Skills Instructor','Music Teacher','Language Tutor','Exam Prep Specialist'],
    requiresCertification: ['Teaching Qualification','TRCN'],
    workerTypes: ['CONTRACTOR','FREELANCER','EMPLOYEE'] },

  // ── GENERAL ─────────────────────────────────────────────────────────────
  { id: 'cat_general', name: 'General Labour', domain: 'General', icon: 'wrench', color: '#6B7280', defaultMinTrustScore: 40,
    skills: ['General Labour','Loading & Offloading','Site Worker','Errand Person'],
    requiresCertification: [],
    workerTypes: ['CONTRACTOR'] },
]

const NIGERIAN_FIRST_NAMES = [
  'Chukwuemeka', 'Adewale', 'Oluwaseun', 'Emeka', 'Tunde', 'Segun',
  'Babatunde', 'Olumide', 'Kehinde', 'Taiwo', 'Bolu', 'Gbenga',
  'Nnamdi', 'Ifeanyi', 'Obiora', 'Chibuike', 'Ugochukwu', 'Amara',
  'Chidinma', 'Adaeze', 'Ngozi', 'Uchenna', 'Kelechi', 'Chidi',
  'Musa', 'Ibrahim', 'Abdullahi', 'Suleiman', 'Umar', 'Abubakar',
  'Femi', 'Dapo', 'Kunle', 'Bimbo', 'Ronke', 'Tokunbo',
  'Ejiro', 'Efe', 'Ovie', 'Oghenekaro', 'Erhuvwukorotu', 'Okiemute',
];

const NIGERIAN_LAST_NAMES = [
  'Adeyemi', 'Okafor', 'Nwosu', 'Eze', 'Okeke', 'Obi', 'Madu',
  'Adebayo', 'Afolabi', 'Ogundimu', 'Ogundipe', 'Adeleke', 'Adesanya',
  'Babatunde', 'Olawale', 'Oladele', 'Abiodun', 'Adekunle', 'Adeniyi',
  'Ibrahim', 'Musa', 'Abdullahi', 'Bello', 'Aliyu', 'Mohammed',
  'Okoro', 'Onwudiwe', 'Nzekwe', 'Chukwu', 'Onyekachi', 'Uzoma',
  'Otunola', 'Oyinloye', 'Ayoade', 'Bakare', 'Oyelaran', 'Ayanwale',
];

const ELECTRICIAN_SKILLS = [
  ['Electrician', 'Panel Wiring', 'Generator Maintenance'],
  ['Electrician', 'Solar Installation', 'Inverter Systems'],
  ['Electrician', 'Industrial Wiring', 'Switchboard Installation'],
  ['Electrician', 'Low Voltage Systems', 'Cable Management'],
  ['Electrician', 'Stage Lighting', 'Event Power Systems'],
];

const GENERAL_SKILLS = [
  ['General Labour', 'Equipment Handling'],
  ['Loading & Offloading', 'General Labour'],
  ['Cleaning', 'General Labour', 'Event Setup'],
  ['Event Setup', 'Stage Crew'],
  ['Crowd Management', 'General Labour'],
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generatePhone(): string {
  const prefixes = ['0803', '0806', '0813', '0816', '0701', '0706', '0813', '0907'];
  const prefix = randomElement(prefixes);
  const suffix = Math.floor(Math.random() * 9000000 + 1000000).toString();
  return `${prefix}${suffix}`;
}

async function seed() {
  console.log('🌱 Seeding TrustGrid demo data...');

  // Clean up — order matters due to FK constraints (children before parents)
  await prisma.onboardingApplication.deleteMany();
  await prisma.organisationWorker.deleteMany();
  await prisma.organisationDocument.deleteMany();
  await prisma.organisationBranch.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.incidentResolution.deleteMany();
  await prisma.incidentNote.deleteMany();
  await prisma.assignmentWorker.deleteMany();
  await prisma.workforceAssignment.deleteMany();
  await prisma.procurementApproval.deleteMany();
  await prisma.procurementLineItem.deleteMany();
  await prisma.procurementRequest.deleteMany();
  await prisma.trustEvent.deleteMany();
  await prisma.endorsement.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.documentRecord.deleteMany();
  await prisma.credentialRecord.deleteMany();
  await prisma.identityVerification.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.userAccount.deleteMany();
  await prisma.institutionConfig.deleteMany();
  await prisma.institution.deleteMany();

  console.log('✓ Cleaned up existing data');

  // Create Institution: RCCG Convention Operations
  const institution = await prisma.institution.create({
    data: {
      name: 'RCCG Convention Operations',
      slug: 'rccg-convention-ops',
      type: InstitutionType.CONVENTION_ORGANIZER,
      email: 'ops@rccg.org',
      phone: '+2348001234567',
      city: 'Redemption Camp',
      state: 'Ogun',
      country: 'NG',
      isVerified: true,
      config: {
        create: {
          trustScoreWeights: {
            account_created: 5,
            identity_verified: 10,
            credential_verified: 5,
            deployment_completed: 2,
            deployment_abandoned: -3,
            rating_5_star: 3,
            rating_4_star: 1.5,
            rating_3_star: 0.5,
            rating_2_star: -1,
            rating_1_star: -2.5,
            endorsement_added: 1.5,
            endorsement_removed: -1.5,
            incident_raised: -5,
            incident_resolved: 3,
            incident_dismissed: 1,
            inactivity_penalty: -0.5,
          },
          minimumTrustScore: 60,
          requireIdentityVerification: true,
          serviceCategories: FULL_SERVICE_CATALOG,
        },
      },
    },
  });

  console.log(`✓ Created institution: ${institution.name}`);

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.userAccount.create({
    data: {
      institutionId: institution.id,
      firstName: 'Deacon',
      lastName: 'Emeka',
      phone: '08001234567',
      email: 'emeka@rccg.org',
      role: 'INSTITUTION_ADMIN',
      passwordHash,
      phoneVerified: true,
    },
  });

  const operatorUser = await prisma.userAccount.create({
    data: {
      institutionId: institution.id,
      firstName: 'Sister',
      lastName: 'Adaeze',
      phone: '08001234568',
      email: 'adaeze@rccg.org',
      role: 'INSTITUTION_OPERATOR',
      passwordHash,
    },
  });

  console.log(`✓ Created admin: ${adminUser.firstName} ${adminUser.lastName}`);

  // Create 65 workers (electricians + general workers)
  const workerProfiles: Array<{ id: string; userId: string; trustScore: number }> = [];

  for (let i = 0; i < 65; i++) {
    const firstName = randomElement(NIGERIAN_FIRST_NAMES);
    const lastName = randomElement(NIGERIAN_LAST_NAMES);
    const isElectrician = i < 48; // 48 electricians, 17 general workers

    const skillSet = isElectrician
      ? randomElement(ELECTRICIAN_SKILLS)
      : randomElement(GENERAL_SKILLS);

    const user = await prisma.userAccount.create({
      data: {
        institutionId: institution.id,
        firstName,
        lastName,
        phone: generatePhone(),
        role: 'WORKER',
      },
    });

    // Determine trust score tier
    let baseTrustScore: number;
    if (i < 10) baseTrustScore = randomBetween(85, 97);       // Top tier
    else if (i < 25) baseTrustScore = randomBetween(70, 84);  // High tier
    else if (i < 40) baseTrustScore = randomBetween(60, 69);  // Mid tier
    else if (i < 55) baseTrustScore = randomBetween(45, 59);  // Low tier
    else baseTrustScore = randomBetween(25, 44);               // Poor tier

    const isVerified = baseTrustScore >= 60;
    const totalDeployments = Math.floor(randomBetween(0, 35));
    const completedDeployments = Math.floor(totalDeployments * randomBetween(0.75, 1.0));
    const avgRating = baseTrustScore >= 70 ? randomBetween(4.0, 5.0) : randomBetween(2.5, 4.0);
    const endorsements = baseTrustScore >= 70 ? Math.floor(randomBetween(1, 8)) : Math.floor(randomBetween(0, 3));

    const worker = await prisma.workerProfile.create({
      data: {
        institutionId: institution.id,
        userId: user.id,
        primarySkill: skillSet[0],
        skills: skillSet,
        categoryIds: isElectrician ? ['cat_electrical'] : ['cat_general', 'cat_event'],
        workerType: WorkerType.CONTRACTOR,
        isAvailable: baseTrustScore >= 40,
        verificationStatus: isVerified ? 'FULLY_VERIFIED' : 'UNVERIFIED',
        trustScore: Math.round(baseTrustScore * 10) / 10,
        trustScoreUpdatedAt: new Date(),
        totalDeployments,
        completedDeployments,
        averageRating: totalDeployments > 0 ? Math.round(avgRating * 10) / 10 : null,
        totalEndorsements: endorsements,
        yearsExperience: Math.floor(randomBetween(1, 15)),
        hourlyRate: isElectrician ? Math.floor(randomBetween(2000, 5000)) : Math.floor(randomBetween(1000, 2500)),
        dailyRate: isElectrician ? Math.floor(randomBetween(8000, 20000)) : Math.floor(randomBetween(4000, 10000)),
      },
    });

    // Create synthetic trust events so recomputation returns the seeded score
    // We use a MANUAL_ADJUSTMENT event with a delta equal to the target score
    // This ensures that when real events are added, the base score is preserved
    await prisma.trustEvent.create({
      data: {
        institutionId: institution.id,
        workerId: worker.id,
        eventType: 'MANUAL_ADJUSTMENT',
        delta: Math.round(baseTrustScore * 10) / 10,
        weightApplied: 1.0,
        referenceType: 'seed',
        referenceId: 'initial_seed',
        metadata: { note: 'Initial trust score from seed data' },
        createdBy: adminUser.id,
      },
    });

    workerProfiles.push({ id: worker.id, userId: user.id, trustScore: baseTrustScore });
  }

  console.log(`✓ Created ${workerProfiles.length} workers`);

  // Add endorsements to high-trust workers
  const highTrustWorkers = workerProfiles.filter(w => w.trustScore >= 70).slice(0, 20);
  for (const worker of highTrustWorkers) {
    const count = Math.floor(randomBetween(1, 5));
    for (let j = 0; j < count; j++) {
      await prisma.endorsement.create({
        data: {
          institutionId: institution.id,
          workerId: worker.id,
          endorsedById: j === 0 ? adminUser.id : operatorUser.id,
          endorserName: j === 0 ? 'Deacon Emeka (Admin)' : 'Sister Adaeze (Operator)',
          endorserRole: j === 0 ? 'Convention Manager' : 'Operations Coordinator',
          comment: randomElement([
            'Excellent worker. Reliable and professional.',
            'Has worked multiple conventions. Always delivers.',
            'Highly recommended. Very skilled and trustworthy.',
            'Good work ethic. Completed assignments ahead of schedule.',
            'Community member in good standing. Work is excellent.',
          ]),
          weight: 3.0,
        },
      });
    }
  }

  console.log('✓ Added endorsements for top workers');

  // Add some incidents (with resolutions)
  const incidentWorkers = workerProfiles.slice(20, 28);
  for (let i = 0; i < incidentWorkers.length; i++) {
    const incident = await prisma.incidentReport.create({
      data: {
        institutionId: institution.id,
        workerId: incidentWorkers[i].id,
        reportedById: adminUser.id,
        title: randomElement([
          'Late arrival to assignment',
          'Equipment handling complaint',
          'Unauthorized absence during event',
          'Client complaint received',
          'Safety protocol not followed',
        ]),
        description: 'Incident reported during the 2024 Holy Ghost Congress. Under investigation.',
        severity: randomElement(['LOW', 'MEDIUM', 'HIGH']),
        status: i < 5 ? 'RESOLVED' : 'OPEN',
        incidentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      },
    });

    if (i < 5) {
      await prisma.incidentResolution.create({
        data: {
          incidentId: incident.id,
          resolvedById: adminUser.id,
          outcome: randomElement(['WORKER_EXONERATED', 'WORKER_PENALIZED']),
          summary: 'Investigation completed. Matter resolved satisfactorily.',
          trustScoreImpact: i < 3 ? 3 : -2,
        },
      });

      await prisma.incidentReport.update({
        where: { id: incident.id },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      });
    }
  }

  console.log('✓ Added incidents');

  // Create the convention service request
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      institutionId: institution.id,
      requesterId: adminUser.id,
      title: 'Convention Electricians — May 2026',
      description:
        'Need 50 verified electricians for the 3-day RCCG National Convention. Workers must be fully verified with trust score ≥65. Roles: stage power, generator maintenance, lighting systems, emergency response.',
      categoryId: 'cat_electrical',
      requiredSkills: ['Electrician'],
      workersNeeded: 50,
      minimumTrustScore: 65,
      scheduledStartAt: new Date('2026-05-15T07:00:00Z'),
      scheduledEndAt: new Date('2026-05-18T20:00:00Z'),
      estimatedHours: 10,
      locationAddress: 'Redemption Camp, Km 46, Lagos-Ibadan Expressway, Ogun State',
      priority: 'HIGH',
      status: 'SUBMITTED',
      notes: 'Annual convention — critical event. Supervisor: Deacon Emeka (08001234567)',
    },
  });

  console.log(`✓ Created service request: ${serviceRequest.title}`);

  // ── Seed all demo user types ────────────────────────────────────────────────

  // 1. Worker user — Chukwuemeka (can log in to worker app)
  const workerUserAccount = await prisma.userAccount.create({
    data: {
      institutionId: institution.id,
      firstName: 'Chukwuemeka',
      lastName: 'Adeyemi',
      phone: '08001234570',
      email: 'chukwuemeka@demo.com',
      role: 'WORKER',
      passwordHash,
      phoneVerified: true,
    },
  })
  // Link to a top-scoring worker profile
  const topWorker = workerProfiles[0]
  await prisma.workerProfile.update({
    where: { id: topWorker.id },
    data: { userId: workerUserAccount.id },
  }).catch(() => {}) // skip if already linked

  // 2. Resident user — can request services
  await prisma.userAccount.create({
    data: {
      institutionId: institution.id,
      firstName: 'Funke',
      lastName: 'Adeola',
      phone: '08001234571',
      email: 'funke@resident.com',
      role: 'RESIDENT',
      passwordHash,
      phoneVerified: true,
    },
  })

  // 3. Professional worker — Corporate Lawyer (shows non-artisan category)
  const lawyerUser = await prisma.userAccount.create({
    data: {
      institutionId: institution.id,
      firstName: 'Ngozi',
      lastName: 'Okafor',
      phone: '08001234572',
      email: 'ngozi.okafor@legalaid.com',
      role: 'WORKER',
      passwordHash,
      phoneVerified: true,
    },
  })
  await prisma.workerProfile.create({
    data: {
      institutionId: institution.id,
      userId: lawyerUser.id,
      primarySkill: 'Corporate Lawyer',
      skills: ['Corporate Law', 'Contract Review', 'Employment Law', 'Dispute Resolution'],
      categoryIds: ['cat_legal'],
      workerType: 'CONTRACTOR',
      yearsExperience: 12,
      bio: 'Qualified barrister and solicitor. Specialises in corporate governance, employment law, and institutional compliance.',
      hourlyRate: 25000,
      dailyRate: 120000,
      verificationStatus: 'FULLY_VERIFIED',
      trustScore: 88.5,
      trustScoreUpdatedAt: new Date(),
      totalDeployments: 8,
      completedDeployments: 8,
      averageRating: 4.9,
      totalEndorsements: 4,
      isAvailable: true,
    },
  })

  // 4. Organisation seed — Emeka Electrical Services Ltd
  const orgAdmin = await prisma.userAccount.create({
    data: {
      institutionId: institution.id,
      firstName: 'Emeka',
      lastName: 'Obi',
      phone: '08001234573',
      email: 'emeka.obi@emekaelectrical.ng',
      role: 'ORGANISATION_ADMIN',
      passwordHash,
      phoneVerified: true,
    },
  })
  await prisma.organisation.create({
    data: {
      institutionId: institution.id,
      name: 'Emeka Electrical Services Ltd',
      slug: `emeka-electrical-${Date.now()}`,
      type: 'OTHER',
      rcNumber: 'RC1234567',
      phone: '08001234573',
      email: 'info@emekaelectrical.ng',
      address: '14 Ikeja Industrial Estate, Lagos',
      serviceCategories: ['Electrical', 'Solar Installation', 'Generator Maintenance'],
      verificationStatus: 'PARTIALLY_VERIFIED',
      onboardingStatus: 'ACTIVE',
      trustScore: 72.0,
      totalContracts: 15,
      completedContracts: 14,
      averageRating: 4.7,
      isActive: true,
      adminUserId: orgAdmin.id,
    },
  })

  console.log('✓ Created all demo user types')

  // ── Seed platform catalog ──────────────────────────────────────────────────
  await prisma.institutionCatalogOverride.deleteMany()
  await prisma.platformCatalogCategory.deleteMany()
  await prisma.platformCatalogDomain.deleteMany()

  for (const domainData of CATALOG_DOMAINS) {
    const domain = await prisma.platformCatalogDomain.create({ data: domainData })

    // Get categories for this domain from FULL_SERVICE_CATALOG
    const domainCategories = FULL_SERVICE_CATALOG.filter(c => c.domain === domainData.name)

    for (let i = 0; i < domainCategories.length; i++) {
      const cat = domainCategories[i]
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      await prisma.platformCatalogCategory.create({
        data: {
          domainId: domain.id,
          name: cat.name,
          slug: `${slug}-${domain.id.slice(-4)}`,
          skills: cat.skills ?? [],
          requiredCertifications: cat.requiresCertification ?? [],
          allowedWorkerTypes: cat.workerTypes ?? ['CONTRACTOR','FREELANCER'],
          defaultMinTrustScore: cat.defaultMinTrustScore ?? 50,
          isProfessional: domainData.name === 'Professional Services' || domainData.name === 'Healthcare & Wellness',
          requiresLicence: (cat.requiresCertification ?? []).length > 0,
          color: domainData.color,
          sortOrder: i,
          createdBy: adminUser.id,
        },
      })
    }
  }

  console.log(`✓ Seeded platform catalog: ${CATALOG_DOMAINS.length} domains, ${FULL_SERVICE_CATALOG.length} categories`)

  console.log('\n✅ Demo seed complete!\n');
  console.log('📋 Demo Data Summary:');
  console.log(`   Institution: ${institution.name}`);
  console.log('');
  console.log('👥 ALL USER TYPE CREDENTIALS (password: Admin123! for all):');
  console.log('   INSTITUTION_ADMIN:    08001234567  (Deacon Emeka — full access)');
  console.log('   INSTITUTION_OPERATOR: 08001234568  (Sister Adaeze — day-to-day ops)');
  console.log('   WORKER (artisan):     08001234570  (Chukwuemeka — electrician, A+ grade)');
  console.log('   WORKER (professional):08001234572  (Ngozi — corporate lawyer)');
  console.log('   ORGANISATION_ADMIN:   08001234573  (Emeka Obi — Emeka Electrical Ltd)');
  console.log('   RESIDENT:             08001234571  (Funke Adeola — community member)');
  console.log(`   Institution ID: ${institution.id}`);
  console.log(`   Workers seeded: ${workerProfiles.length}`);
  console.log(`     - Electricians: 48`);
  console.log(`     - General workers: 17`);
  console.log(`   Service Request: ${serviceRequest.title}`);
  console.log(`   Service Request ID: ${serviceRequest.id}`);
  console.log('\n🎯 Demo flow:');
  console.log('   1. Login as admin');
  console.log('   2. View workers registry (filter by Electrician, trust score ≥65)');
  console.log('   3. Open the convention service request');
  console.log('   4. View matched workers (≥65 trust score, Electrician skill)');
  console.log('   5. Assign top 50 workers');
  console.log('   6. Submit a performance review for a worker');
  console.log('   7. Watch trust score update');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
