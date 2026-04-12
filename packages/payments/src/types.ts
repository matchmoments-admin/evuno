export interface CreateSubscriptionParams {
  tenantId: string;
  customerCountry: string; // ISO 3166-1 alpha-2
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateSessionPaymentParams {
  sessionId: string;
  tenantId: string;
  customerCountry: string;
  amountMinorUnits: number; // always in minor units (cents/centavos)
  currency: string; // ISO 4217
  description: string;
}

export interface PaymentResult {
  provider: 'stripe';
  checkoutUrl?: string;
  paymentIntentId?: string;
  status: 'pending' | 'succeeded' | 'failed';
}
