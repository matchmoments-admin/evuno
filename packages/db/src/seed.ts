import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { tenants } from './schema/tenants';
import { chargers } from './schema/chargers';
import { users } from './schema/users';
import { sessions } from './schema/sessions';
import { subscriptions } from './schema/billing';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://evuno:evuno_dev@localhost:5432/evuno';
const sql = postgres(connectionString);
const db = drizzle(sql);

// Fixed UUIDs matching Keycloak realm-export.json group attributes
const TENANT_AU_ID = '00000000-0000-0000-0000-000000000001';
const TENANT_CL_ID = '00000000-0000-0000-0000-000000000002';

async function seed() {
  console.log('Seeding evuno database...');

  // Tenants
  await db.insert(tenants).values([
    {
      id: TENANT_AU_ID,
      name: 'Demo Australia',
      slug: 'demo-au',
      country: 'AU',
      currency: 'AUD',
      plan: 'growth',
    },
    {
      id: TENANT_CL_ID,
      name: 'Demo Chile',
      slug: 'demo-cl',
      country: 'CL',
      currency: 'CLP',
      plan: 'starter',
    },
  ]).onConflictDoNothing();

  console.log('  Tenants seeded');

  // Chargers — Australia
  await db.insert(chargers).values([
    {
      tenantId: TENANT_AU_ID,
      ocppId: 'AU-SYD-001',
      name: 'Sydney CBD Level 2',
      locationLat: -33.8688,
      locationLng: 151.2093,
      locationAddress: '123 George St',
      locationCity: 'Sydney',
      locationCountry: 'AU',
      status: 'online',
      level: 'L2',
      powerKw: 22,
      connectorType: 'Type2',
      isPublic: true,
      pricePerKwh: '0.4500',
      priceCurrency: 'AUD',
    },
    {
      tenantId: TENANT_AU_ID,
      ocppId: 'AU-SYD-002',
      name: 'Sydney CBD DC Fast',
      locationLat: -33.8712,
      locationLng: 151.2055,
      locationAddress: '45 Pitt St',
      locationCity: 'Sydney',
      locationCountry: 'AU',
      status: 'charging',
      level: 'DC',
      powerKw: 150,
      connectorType: 'CCS2',
      isPublic: true,
      pricePerKwh: '0.6500',
      priceCurrency: 'AUD',
    },
    {
      tenantId: TENANT_AU_ID,
      ocppId: 'AU-MEL-001',
      name: 'Melbourne Central',
      locationLat: -37.8136,
      locationLng: 144.9631,
      locationAddress: '300 Lonsdale St',
      locationCity: 'Melbourne',
      locationCountry: 'AU',
      status: 'online',
      level: 'DC',
      powerKw: 350,
      connectorType: 'CCS2',
      isPublic: true,
      pricePerKwh: '0.7900',
      priceCurrency: 'AUD',
    },
  ]).onConflictDoNothing();

  // Chargers — Chile
  await db.insert(chargers).values([
    {
      tenantId: TENANT_CL_ID,
      ocppId: 'CL-SCL-001',
      name: 'Providencia L2',
      locationLat: -33.4264,
      locationLng: -70.6153,
      locationAddress: 'Av. Providencia 1234',
      locationCity: 'Santiago',
      locationCountry: 'CL',
      status: 'online',
      level: 'L2',
      powerKw: 22,
      connectorType: 'Type2',
      isPublic: true,
      pricePerKwh: '250.0000',
      priceCurrency: 'CLP',
    },
    {
      tenantId: TENANT_CL_ID,
      ocppId: 'CL-SCL-002',
      name: 'Las Condes DC Fast',
      locationLat: -33.4103,
      locationLng: -70.5672,
      locationAddress: 'Av. Apoquindo 4500',
      locationCity: 'Santiago',
      locationCountry: 'CL',
      status: 'online',
      level: 'DC',
      powerKw: 50,
      connectorType: 'CCS2',
      isPublic: true,
      pricePerKwh: '350.0000',
      priceCurrency: 'CLP',
    },
    {
      tenantId: TENANT_CL_ID,
      ocppId: 'CL-SCL-003',
      name: 'Vitacura L2',
      locationLat: -33.3941,
      locationLng: -70.5975,
      locationAddress: 'Av. Vitacura 3000',
      locationCity: 'Santiago',
      locationCountry: 'CL',
      status: 'faulted',
      level: 'L2',
      powerKw: 7.4,
      connectorType: 'Type2',
      isPublic: true,
      pricePerKwh: '200.0000',
      priceCurrency: 'CLP',
    },
  ]).onConflictDoNothing();

  console.log('  Chargers seeded');

  // Users
  await db.insert(users).values([
    {
      keycloakId: 'kc-operator-au',
      tenantId: TENANT_AU_ID,
      email: 'operator@demo-au.evuno.co',
      name: 'AU Operator',
      role: 'operator',
      country: 'AU',
    },
    {
      keycloakId: 'kc-operator-cl',
      tenantId: TENANT_CL_ID,
      email: 'operador@demo-cl.evuno.co',
      name: 'CL Operador',
      role: 'operator',
      country: 'CL',
    },
    {
      keycloakId: 'kc-driver-01',
      tenantId: null,
      email: 'driver@example.com',
      name: 'Test Driver',
      role: 'driver',
      country: 'AU',
    },
  ]).onConflictDoNothing();

  console.log('  Users seeded');

  // Sample sessions (last 7 days)
  const now = new Date();
  const sessionValues = [];
  for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);

    // AU sessions
    for (let i = 0; i < 3; i++) {
      const startHour = 8 + i * 4;
      const started = new Date(day);
      started.setHours(startHour, 0, 0, 0);
      const ended = new Date(started);
      ended.setMinutes(started.getMinutes() + 30 + Math.floor(Math.random() * 60));
      const energy = 10 + Math.floor(Math.random() * 40);
      const cost = (energy * 0.55).toFixed(2);

      sessionValues.push({
        tenantId: TENANT_AU_ID,
        chargerId: undefined as unknown as string, // will be set after insert
        ocppTransactionId: `au-tx-${daysAgo}-${i}`,
        startedAt: started,
        endedAt: ended,
        energyKwh: energy,
        durationMinutes: Math.floor((ended.getTime() - started.getTime()) / 60000),
        costAmount: cost,
        costCurrency: 'AUD',
        paymentProvider: 'stripe',
        paymentStatus: 'succeeded',
      });
    }

    // CL sessions
    for (let i = 0; i < 2; i++) {
      const startHour = 9 + i * 5;
      const started = new Date(day);
      started.setHours(startHour, 0, 0, 0);
      const ended = new Date(started);
      ended.setMinutes(started.getMinutes() + 20 + Math.floor(Math.random() * 40));
      const energy = 5 + Math.floor(Math.random() * 25);
      const cost = (energy * 300).toFixed(0);

      sessionValues.push({
        tenantId: TENANT_CL_ID,
        chargerId: undefined as unknown as string,
        ocppTransactionId: `cl-tx-${daysAgo}-${i}`,
        startedAt: started,
        endedAt: ended,
        energyKwh: energy,
        durationMinutes: Math.floor((ended.getTime() - started.getTime()) / 60000),
        costAmount: cost,
        costCurrency: 'CLP',
        paymentProvider: 'stripe',
        paymentStatus: 'succeeded',
      });
    }
  }

  // Get charger IDs to assign to sessions
  const allChargers = await db.select().from(chargers);
  const auChargers = allChargers.filter((c) => c.tenantId === TENANT_AU_ID);
  const clChargers = allChargers.filter((c) => c.tenantId === TENANT_CL_ID);

  for (const s of sessionValues) {
    if (s.tenantId === TENANT_AU_ID && auChargers.length > 0) {
      s.chargerId = auChargers[Math.floor(Math.random() * auChargers.length)].id;
    } else if (clChargers.length > 0) {
      s.chargerId = clChargers[Math.floor(Math.random() * clChargers.length)].id;
    }
  }

  const validSessions = sessionValues.filter((s) => s.chargerId);
  if (validSessions.length > 0) {
    await db.insert(sessions).values(validSessions).onConflictDoNothing();
  }

  console.log(`  ${validSessions.length} sessions seeded`);

  // Subscriptions
  await db.insert(subscriptions).values([
    {
      tenantId: TENANT_AU_ID,
      plan: 'growth',
      status: 'active',
      currentPeriodStart: new Date('2026-04-01'),
      currentPeriodEnd: new Date('2026-05-01'),
    },
    {
      tenantId: TENANT_CL_ID,
      plan: 'starter',
      status: 'active',
      currentPeriodStart: new Date('2026-04-01'),
      currentPeriodEnd: new Date('2026-05-01'),
    },
  ]).onConflictDoNothing();

  console.log('  Subscriptions seeded');

  console.log('Seed complete.');
  await sql.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
