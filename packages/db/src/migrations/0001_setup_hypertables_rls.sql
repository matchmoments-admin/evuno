-- Custom migration: TimescaleDB hypertables + RLS policies
-- Run AFTER the Drizzle-generated schema migration

-- Convert sessions to a TimescaleDB hypertable (7-day chunks for charging sessions)
SELECT create_hypertable('sessions', 'started_at', if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

-- Enable compression on sessions (compress chunks older than 7 days)
ALTER TABLE sessions SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,charger_id'
);
SELECT add_compression_policy('sessions', INTERVAL '7 days', if_not_exists => TRUE);

-- Retention policy: drop session data older than 2 years
SELECT add_retention_policy('sessions', INTERVAL '2 years', if_not_exists => TRUE);

-- Enable RLS on all tenant-scoped tables
SELECT enable_rls_for_tenant_table('chargers');
SELECT enable_rls_for_tenant_table('sessions');
SELECT enable_rls_for_tenant_table('users');
SELECT enable_rls_for_tenant_table('subscriptions');
