-- =============================================================================
-- evuno — PostgreSQL init script
-- Creates databases, enables extensions, sets up RLS
-- =============================================================================

-- Create databases for Keycloak and CitrineOS
CREATE DATABASE evuno_auth;
CREATE DATABASE evuno_citrine;

-- Enable TimescaleDB on the main evuno database (connected by default)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- =============================================================================
-- Row-Level Security policies
-- Application sets: SET LOCAL app.tenant_id = '<uuid>';
-- =============================================================================

-- RLS will be applied after tables are created by Drizzle migrations.
-- These are run via: packages/db/src/migrations/

-- Helper function to get current tenant from session
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid AS $$
  SELECT current_setting('app.tenant_id', true)::uuid;
$$ LANGUAGE sql STABLE;

-- =============================================================================
-- RLS policy creation function (called after migrations create tables)
-- =============================================================================
CREATE OR REPLACE FUNCTION enable_rls_for_tenant_table(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format(
    'CREATE POLICY tenant_isolation ON %I USING (tenant_id = current_tenant_id())',
    table_name
  );
  EXECUTE format(
    'CREATE POLICY tenant_isolation_insert ON %I FOR INSERT WITH CHECK (tenant_id = current_tenant_id())',
    table_name
  );
END;
$$ LANGUAGE plpgsql;
