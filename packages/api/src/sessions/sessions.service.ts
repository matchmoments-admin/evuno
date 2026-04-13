import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { sessions } from '@evuno/db';
import { PaymentService } from '@evuno/payments';
import { DatabaseService } from '../database/database.service';

const PLATFORM_FEE_RATE = 0.015; // 1.5% per session

interface SessionFilters {
  chargerId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class SessionsService {
  private payments: PaymentService;

  constructor(private readonly database: DatabaseService) {
    this.payments = new PaymentService();
  }

  async findAll(tenantId: string, filters: SessionFilters = {}) {
    return this.database.withTenant(tenantId, async (tx) => {
      const conditions = [];

      if (filters.chargerId) {
        conditions.push(eq(sessions.chargerId, filters.chargerId));
      }
      if (filters.startDate) {
        conditions.push(gte(sessions.startedAt, new Date(filters.startDate)));
      }
      if (filters.endDate) {
        conditions.push(lte(sessions.startedAt, new Date(filters.endDate)));
      }
      if (filters.status) {
        conditions.push(eq(sessions.paymentStatus, filters.status));
      }

      const query = tx
        .select()
        .from(sessions)
        .orderBy(desc(sessions.startedAt))
        .limit(filters.limit ?? 50)
        .offset(filters.offset ?? 0);

      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }
      return query;
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.database.withTenant(tenantId, async (tx) => {
      const results = await tx
        .select()
        .from(sessions)
        .where(eq(sessions.id, id));
      if (results.length === 0) throw new NotFoundException('Session not found');
      return results[0];
    });
  }

  async endSession(
    tenantId: string,
    sessionId: string,
    costAmount: string,
    costCurrency: string,
    customerCountry: string,
  ) {
    return this.database.withTenant(tenantId, async (tx) => {
      // Look up the session
      const existing = await tx
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId));
      if (existing.length === 0) throw new NotFoundException('Session not found');

      const session = existing[0];
      const now = new Date();
      const durationMinutes = Math.round(
        (now.getTime() - session.startedAt.getTime()) / 60000,
      );

      // Calculate platform fee: 1.5% of session cost in minor units
      const costNum = parseFloat(costAmount);
      const feeMinorUnits = Math.round(costNum * PLATFORM_FEE_RATE * 100);

      let paymentIntentId: string | undefined;
      let paymentStatus: string = 'pending';

      // Create Stripe payment for the platform fee
      if (feeMinorUnits > 0) {
        try {
          const result = await this.payments.createSessionPayment({
            sessionId,
            tenantId,
            customerCountry,
            amountMinorUnits: feeMinorUnits,
            currency: costCurrency,
            description: `evuno platform fee — session ${sessionId}`,
          });
          paymentIntentId = result.paymentIntentId;
          paymentStatus = result.status;
        } catch {
          paymentStatus = 'failed';
        }
      }

      // Update the session record
      const updated = await tx
        .update(sessions)
        .set({
          endedAt: now,
          durationMinutes,
          costAmount: costAmount,
          costCurrency,
          paymentIntentId,
          paymentProvider: 'stripe',
          paymentStatus,
        })
        .where(eq(sessions.id, sessionId))
        .returning();

      return updated[0];
    });
  }

  async getStats(tenantId: string, days = 30): Promise<{ summary: unknown; daily: unknown }> {
    return this.database.withTenant(tenantId, async (tx) => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const result = await tx.execute(sql`
        SELECT
          COUNT(*)::int AS total_sessions,
          COALESCE(SUM(energy_kwh), 0)::real AS total_energy_kwh,
          COALESCE(SUM(cost_amount::numeric), 0)::numeric AS total_revenue,
          COALESCE(AVG(duration_minutes), 0)::real AS avg_duration_minutes
        FROM sessions
        WHERE started_at >= ${since}
      `);

      // Daily breakdown using TimescaleDB time_bucket
      const daily = await tx.execute(sql`
        SELECT
          time_bucket('1 day', started_at) AS day,
          COUNT(*)::int AS sessions,
          COALESCE(SUM(energy_kwh), 0)::real AS energy_kwh,
          COALESCE(SUM(cost_amount::numeric), 0)::numeric AS revenue
        FROM sessions
        WHERE started_at >= ${since}
        GROUP BY day
        ORDER BY day DESC
      `);

      return {
        summary: result[0] ?? {
          total_sessions: 0,
          total_energy_kwh: 0,
          total_revenue: 0,
          avg_duration_minutes: 0,
        },
        daily,
      };
    });
  }
}
