import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './index';

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

export const db = drizzle(sql, { schema });
export type Database = typeof db;

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
