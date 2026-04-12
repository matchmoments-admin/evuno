import { STRIPE_COUNTRIES } from '@evuno/shared';
import type {
  CreateSubscriptionParams,
  CreateSessionPaymentParams,
  PaymentResult,
} from './types';

export class PaymentService {
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
    // Stripe implementation will be added in Phase 3
    throw new Error('Not implemented');
  }

  async createSessionPayment(
    params: CreateSessionPaymentParams,
  ): Promise<PaymentResult> {
    this.resolveProvider(params.customerCountry);
    // Stripe implementation will be added in Phase 3
    throw new Error('Not implemented');
  }

  async handleWebhook(
    payload: unknown,
    signature: string,
  ): Promise<void> {
    // Stripe webhook handler will be added in Phase 3
    throw new Error('Not implemented');
  }
}
