import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { subscriptions, tenants, webhookEvents } from '@evuno/db';
import { PaymentService } from '@evuno/payments';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BillingService {
  private payments: PaymentService;

  constructor(private readonly database: DatabaseService) {
    this.payments = new PaymentService();
  }

  async createCheckoutSession(tenantId: string, priceId: string, baseUrl: string) {
    // Get tenant country for payment routing
    const tenant = await this.database.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .then((r) => r[0]);

    if (!tenant) throw new Error('Tenant not found');

    return this.payments.createSubscription({
      tenantId,
      customerCountry: tenant.country ?? 'AU',
      priceId,
      successUrl: `${baseUrl}/dashboard/billing?success=true`,
      cancelUrl: `${baseUrl}/dashboard/billing?canceled=true`,
    });
  }

  async getSubscription(tenantId: string) {
    return this.database.withTenant(tenantId, async (tx) => {
      const results = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId));
      return results[0] ?? null;
    });
  }

  async handleWebhook(payload: string | Buffer, signature: string) {
    const result = await this.payments.handleWebhook(payload, signature);

    // Store the webhook event
    await this.database.db.insert(webhookEvents).values({
      provider: 'stripe',
      eventId: `stripe-${Date.now()}`,
      eventType: result.eventType,
      payload: result.data,
    });

    // Update subscription status based on event
    if (
      result.eventType === 'checkout.session.completed' &&
      result.data.tenantId &&
      result.data.subscriptionId
    ) {
      await this.database.db
        .update(subscriptions)
        .set({
          stripeSubscriptionId: result.data.subscriptionId as string,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.tenantId, result.data.tenantId as string));

      // Update tenant's stripe customer ID
      if (result.data.customerId) {
        await this.database.db
          .update(tenants)
          .set({
            stripeCustomerId: result.data.customerId as string,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, result.data.tenantId as string));
      }
    }

    if (result.eventType === 'customer.subscription.deleted' && result.data.subscriptionId) {
      await this.database.db
        .update(subscriptions)
        .set({ status: 'canceled', updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, result.data.subscriptionId as string));
    }

    return result;
  }

  async getInvoices(tenantId: string) {
    const tenant = await this.database.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .then((r) => r[0]);

    if (!tenant?.stripeCustomerId) return [];

    return this.payments.listInvoices(tenant.stripeCustomerId);
  }

  async getPortalUrl(tenantId: string, returnUrl: string) {
    const tenant = await this.database.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .then((r) => r[0]);

    if (!tenant?.stripeCustomerId) {
      throw new Error('No Stripe customer found for this tenant');
    }

    return this.payments.createCustomerPortalSession(
      tenant.stripeCustomerId,
      returnUrl,
    );
  }
}
