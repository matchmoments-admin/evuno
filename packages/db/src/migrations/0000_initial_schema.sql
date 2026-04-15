-- =============================================================================
-- evuno — Initial schema migration
-- Creates all tables matching Drizzle ORM schemas
-- Run BEFORE 0001_setup_hypertables_rls.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country char(2),
  currency char(3),
  plan text NOT NULL DEFAULT 'free',
  logo_url text,
  primary_color text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chargers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  ocpp_id text NOT NULL,
  name text NOT NULL,
  location_lat real,
  location_lng real,
  location_address text,
  location_city text,
  location_country char(2),
  status text NOT NULL DEFAULT 'offline',
  level text NOT NULL,
  power_kw real NOT NULL,
  connector_type text,
  is_public boolean DEFAULT false,
  price_per_kwh numeric(10, 4),
  price_currency char(3),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  keycloak_id text NOT NULL UNIQUE,
  tenant_id uuid REFERENCES tenants(id),
  email text NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'driver',
  country char(2),
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sessions table: uses composite PK for TimescaleDB hypertable compatibility
-- The partition column (started_at) must be in all unique constraints
CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  charger_id uuid NOT NULL REFERENCES chargers(id),
  ocpp_transaction_id text,
  user_id uuid,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  energy_kwh real,
  duration_minutes integer,
  cost_amount numeric(10, 2),
  cost_currency char(3),
  payment_intent_id text,
  payment_provider text,
  payment_status text,
  PRIMARY KEY (id, started_at)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL,
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
