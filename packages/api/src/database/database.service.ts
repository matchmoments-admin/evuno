import { Injectable } from '@nestjs/common';
import { db, withTenant, type Database } from '@evuno/db';

@Injectable()
export class DatabaseService {
  get db(): Database {
    return db;
  }

  /**
   * Execute queries within a tenant-scoped transaction.
   * Sets RLS context via SET LOCAL app.tenant_id.
   */
  async withTenant<T>(
    tenantId: string,
    fn: (tx: Database) => Promise<T>,
  ): Promise<T> {
    return withTenant(tenantId, fn);
  }
}
