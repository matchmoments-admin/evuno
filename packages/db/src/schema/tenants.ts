import {
  pgTable,
  uuid,
  text,
  char,
  timestamp,
} from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  country: char('country', { length: 2 }),
  currency: char('currency', { length: 3 }),
  plan: text('plan').notNull().default('free'),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
