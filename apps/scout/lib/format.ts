import type { SupportedCountry } from '@evuno/shared';

const formatters: Record<SupportedCountry, Intl.NumberFormat> = {
  CL: new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  AU: new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

export function formatCurrency(amount: number, country: SupportedCountry): string {
  return formatters[country].format(amount);
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
