export const SUPPORTED_COUNTRIES = ['AU', 'CL'] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export const STRIPE_COUNTRIES = [
  'AU', // Australia
  'CL', // Chile
  'US', // United States
  'GB', // United Kingdom
  'SG', // Singapore
  'JP', // Japan
  'NZ', // New Zealand
] as const;

export interface CountryDefaults {
  electricityRatePerKwh: number;
  commercialRate: number;
  l2InstallCostMin: number;
  l2InstallCostMax: number;
  dcInstallCostMin: number;
  taxCreditPct: number;
  currency: string;
  locale: string;
  timezone: string;
}

export const COUNTRY_DEFAULTS: Record<SupportedCountry, CountryDefaults> = {
  CL: {
    electricityRatePerKwh: 120, // CLP/kWh residential average
    commercialRate: 82, // CLP/kWh (~68% of residential)
    l2InstallCostMin: 450_000, // CLP
    l2InstallCostMax: 1_200_000, // CLP
    dcInstallCostMin: 40_000_000, // CLP (50kW)
    taxCreditPct: 0, // Chile has no federal charging tax credit
    currency: 'CLP',
    locale: 'es-CL',
    timezone: 'America/Santiago',
  },
  AU: {
    electricityRatePerKwh: 33, // AUD cents/kWh residential average
    commercialRate: 25, // AUD cents/kWh commercial
    l2InstallCostMin: 2_500, // AUD
    l2InstallCostMax: 8_000, // AUD
    dcInstallCostMin: 50_000, // AUD (50kW)
    taxCreditPct: 0,
    currency: 'AUD',
    locale: 'en-AU',
    timezone: 'Australia/Sydney',
  },
};
