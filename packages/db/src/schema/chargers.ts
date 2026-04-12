import {
  pgTable,
  uuid,
  text,
  char,
  real,
  boolean,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const chargers = pgTable('chargers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  ocppId: text('ocpp_id').notNull(),
  name: text('name').notNull(),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationAddress: text('location_address'),
  locationCity: text('location_city'),
  locationCountry: char('location_country', { length: 2 }),
  status: text('status').notNull().default('offline'),
  level: text('level').notNull(), // L1 | L2 | DC
  powerKw: real('power_kw').notNull(),
  connectorType: text('connector_type'), // CCS2 | CHAdeMO | Type2
  isPublic: boolean('is_public').default(false),
  pricePerKwh: numeric('price_per_kwh', { precision: 10, scale: 4 }),
  priceCurrency: char('price_currency', { length: 3 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
