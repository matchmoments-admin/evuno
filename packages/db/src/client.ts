import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as tenantSchema from './schema/tenants';
import * as chargerSchema from './schema/chargers';
import * as sessionSchema from './schema/sessions';
import * as userSchema from './schema/users';
import * as billingSchema from './schema/billing';

const schema = {
  ...tenantSchema,
  ...chargerSchema,
  ...sessionSchema,
  ...userSchema,
  ...billingSchema,
};

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

export const db: PostgresJsDatabase<typeof schema> = drizzle(sql, { schema });
export type Database = PostgresJsDatabase<typeof schema>;

/**
 * Execute a callback within a tenant-scoped transaction.
 * Sets RLS context via `SET LOCAL app.tenant_id` so all queries
 * within the transaction are automatically filtered by tenant.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Database) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      `SET LOCAL app.tenant_id = '${tenantId}'`,
    );
    return fn(tx as unknown as Database);
  });
}
