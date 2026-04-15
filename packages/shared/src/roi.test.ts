import { describe, it, expect } from 'vitest';
import { calculateROI } from './roi';

describe('calculateROI', () => {
  it('returns positive recommendation for a viable Chilean L2 installation', () => {
    const result = calculateROI({
      address: 'Av. Providencia 1234, Santiago',
      country: 'CL',
      propertyType: 'hotel',
      parkingSpaces: 50,
      chargerType: 'L2',
      chargerCount: 4,
      electricityRate: 82, // CLP/kWh commercial
      sessionRate: 2500, // CLP per session
      utilizationPct: 30,
      installCostTotal: 1_800_000, // 4 × CLP 450K
      taxCreditPct: 0,
    });

    expect(result.annualRevenue).toBeGreaterThan(0);
    expect(result.annualEnergyCost).toBeGreaterThan(0);
    expect(result.annualMaintenance).toBe(4 * 300_000); // CL L2 maintenance
    expect(result.netAnnual).toBeGreaterThan(0);
    expect(result.paybackYears).toBeGreaterThan(0);
    expect(result.paybackYears).toBeLessThan(10);
    expect(result.recommendation).toBe('positive');
  });

  it('returns correct Australian maintenance costs', () => {
    const result = calculateROI({
      address: '123 George St, Sydney',
      country: 'AU',
      propertyType: 'office',
      parkingSpaces: 30,
      chargerType: 'L2',
      chargerCount: 2,
      electricityRate: 25, // AUD cents/kWh
      sessionRate: 8, // AUD per session
      utilizationPct: 20,
      installCostTotal: 5_000, // 2 × AUD 2,500
      taxCreditPct: 0,
    });

    expect(result.annualMaintenance).toBe(2 * 500); // AU L2: $500/charger/yr
  });

  it('returns negative recommendation for unviable DCFC installation', () => {
    const result = calculateROI({
      address: 'Remote Location',
      country: 'CL',
      propertyType: 'other',
      parkingSpaces: 5,
      chargerType: 'DCFC',
      chargerCount: 1,
      electricityRate: 200,
      sessionRate: 500, // very low session rate
      utilizationPct: 5, // 5% utilization
      installCostTotal: 40_000_000, // CLP 40M for DC fast
      taxCreditPct: 0,
    });

    expect(result.recommendation).toBe('negative');
    expect(result.paybackYears).toBeGreaterThan(8);
  });

  it('handles zero net annual gracefully', () => {
    const result = calculateROI({
      address: 'Test',
      country: 'AU',
      propertyType: 'apartment',
      parkingSpaces: 10,
      chargerType: 'L2',
      chargerCount: 1,
      electricityRate: 100, // extremely high rate
      sessionRate: 1, // extremely low session rate
      utilizationPct: 1,
      installCostTotal: 50_000,
      taxCreditPct: 0,
    });

    // When costs exceed revenue, payback should be Infinity
    if (result.netAnnual <= 0) {
      expect(result.paybackYears).toBe(Infinity);
    }
    expect(result.paybackYears).toBeGreaterThanOrEqual(0);
  });

  it('applies tax credit correctly', () => {
    const withoutCredit = calculateROI({
      address: 'Test',
      country: 'AU',
      propertyType: 'mall',
      parkingSpaces: 100,
      chargerType: 'L2',
      chargerCount: 10,
      electricityRate: 25,
      sessionRate: 8,
      utilizationPct: 40,
      installCostTotal: 50_000,
      taxCreditPct: 0,
    });

    const withCredit = calculateROI({
      address: 'Test',
      country: 'AU',
      propertyType: 'mall',
      parkingSpaces: 100,
      chargerType: 'L2',
      chargerCount: 10,
      electricityRate: 25,
      sessionRate: 8,
      utilizationPct: 40,
      installCostTotal: 50_000,
      taxCreditPct: 30,
    });

    expect(withCredit.netInstall).toBe(50_000 * 0.7);
    expect(withoutCredit.netInstall).toBe(50_000);
    expect(withCredit.fiveYearProfit).toBeGreaterThan(withoutCredit.fiveYearProfit);
  });
});
