import {
  pgTable,
  uuid,
  text,
  char,
  real,
  integer,
  numeric,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { chargers } from './chargers';

// TimescaleDB hypertable partitioned by started_at
// Composite PK required: TimescaleDB needs the partition column in all unique constraints
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().notNull(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    chargerId: uuid('charger_id')
      .notNull()
      .references(() => chargers.id),
    ocppTransactionId: text('ocpp_transaction_id'),
    userId: uuid('user_id'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    energyKwh: real('energy_kwh'),
    durationMinutes: integer('duration_minutes'),
    costAmount: numeric('cost_amount', { precision: 10, scale: 2 }),
    costCurrency: char('cost_currency', { length: 3 }),
    paymentIntentId: text('payment_intent_id'),
    paymentProvider: text('payment_provider'), // stripe
    paymentStatus: text('payment_status'), // pending | succeeded | failed
  },
  (table) => [
    primaryKey({ columns: [table.id, table.startedAt] }),
  ],
);
