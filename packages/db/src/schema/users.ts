import {
  pgTable,
  uuid,
  text,
  char,
  timestamp,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  keycloakId: text('keycloak_id').notNull().unique(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').notNull().default('driver'), // driver | operator | admin
  country: char('country', { length: 2 }),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
