import {
  pgTable,
  uuid,
  text,
  char,
  numeric,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  plan: text('plan').notNull(), // free | starter | growth | enterprise
  status: text('status').notNull().default('active'), // active | past_due | canceled
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: text('provider').notNull(), // stripe
  eventId: text('event_id').notNull().unique(),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
