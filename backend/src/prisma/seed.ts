/**
 * TrustGrid Demo Seed
 * Populates the RCCG Convention Operations scenario for the hackathon demo
 */

import { PrismaClient, WorkerType, InstitutionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
          serviceCategories: [
            { id: 'cat_electrical', name: 'Electrical', icon: 'bolt', color: '#F59E0B', defaultMinTrustScore: 60 },
            { id: 'cat_event', name: 'Event Services', icon: 'calendar', color: '#8B5CF6', defaultMinTrustScore: 45 },
            { id: 'cat_security', name: 'Security', icon: 'shield', color: '#6366F1', defaultMinTrustScore: 70 },
            { id: 'cat_medical', name: 'Medical', icon: 'heart-pulse', color: '#EF4444', defaultMinTrustScore: 75 },
            { id: 'cat_general', name: 'General Labour', icon: 'wrench', color: '#6B7280', defaultMinTrustScore: 40 },
          ],
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

  console.log('\n✅ Demo seed complete!\n');
  console.log('📋 Demo Data Summary:');
  console.log(`   Institution: ${institution.name}`);
  console.log(`   Admin login: phone=08001234567 password=Admin123!`);
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
