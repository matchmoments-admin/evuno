import Stripe from 'stripe';
import { STRIPE_COUNTRIES } from '@evuno/shared';
import type {
  CreateSubscriptionParams,
  CreateSessionPaymentParams,
  PaymentResult,
} from './types';

export class PaymentService {
  private stripe: Stripe;

  constructor(secretKey?: string) {
    this.stripe = new Stripe(secretKey ?? process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  private resolveProvider(country: string): 'stripe' {
    if (
      (STRIPE_COUNTRIES as readonly string[]).includes(country.toUpperCase())
    ) {
      return 'stripe';
    }
    throw new Error(
      `UnsupportedCountryError: No payment provider configured for country "${country}"`,
    );
  }

  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<PaymentResult> {
    this.resolveProvider(params.customerCountry);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { tenantId: params.tenantId },
      client_reference_id: params.tenantId,
    });

    return {
      provider: 'stripe',
      checkoutUrl: session.url ?? undefined,
      status: 'pending',
    };
  }

  async createSessionPayment(
    params: CreateSessionPaymentParams,
  ): Promise<PaymentResult> {
    this.resolveProvider(params.customerCountry);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: params.amountMinorUnits,
      currency: params.currency.toLowerCase(),
      description: params.description,
      metadata: {
        tenantId: params.tenantId,
        sessionId: params.sessionId,
      },
    });

    return {
      provider: 'stripe',
      paymentIntentId: paymentIntent.id,
      status: 'pending',
    };
  }

  async handleWebhook(
    payload: string | Buffer,
    signature: string,
  ): Promise<{ eventType: string; data: Record<string, unknown> }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    const data: Record<string, unknown> = {};

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        data.tenantId = session.metadata?.tenantId;
        data.subscriptionId = session.subscription;
        data.customerId = session.customer;
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        data.subscriptionId = invoice.subscription;
        data.amountPaid = invoice.amount_paid;
        data.currency = invoice.currency;
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        data.subscriptionId = invoice.subscription;
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        data.subscriptionId = sub.id;
        data.status = sub.status;
        data.currentPeriodEnd = new Date(sub.current_period_end * 1000);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        data.subscriptionId = sub.id;
        data.status = 'canceled';
        break;
      }
    }

    return { eventType: event.type, data };
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async listInvoices(customerId: string, limit = 10): Promise<Stripe.Invoice[]> {
    const result = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return result.data;
  }

  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }
}
