export interface ScoutInputs {
  address: string;
  propertyType:
    | 'restaurant'
    | 'hotel'
    | 'mall'
    | 'apartment'
    | 'office'
    | 'hospital'
    | 'other';
  parkingSpaces: number;
  chargerType: 'L2' | 'DCFC';
  chargerCount: number;
  electricityRate: number;
  sessionRate: number;
  utilizationPct: number;
}

export interface ROIResult {
  annualRevenue: number;
  annualEnergyCost: number;
  annualMaintenance: number;
  netAnnual: number;
  netInstall: number;
  paybackYears: number;
  fiveYearProfit: number;
  recommendation: 'positive' | 'marginal' | 'negative';
}

export function calculateROI(
  inputs: ScoutInputs & { installCostTotal: number; taxCreditPct: number },
): ROIResult {
  const sessionsPerDayPerCharger = inputs.chargerType === 'L2' ? 3 : 8;
  const kwhPerSession = inputs.chargerType === 'L2' ? 7 : 50;
  const adjustedSessions =
    sessionsPerDayPerCharger * (inputs.utilizationPct / 100);

  const annualRevenue =
    inputs.chargerCount * adjustedSessions * inputs.sessionRate * 365;
  const annualEnergyCost =
    inputs.chargerCount *
    adjustedSessions *
    kwhPerSession *
    inputs.electricityRate *
    365;
  const annualMaintenance = inputs.chargerCount * 300_000; // CLP $300K per charger/yr

  const netAnnual = annualRevenue - annualEnergyCost - annualMaintenance;
  const netInstall =
    inputs.installCostTotal * (1 - inputs.taxCreditPct / 100);
  const paybackYears = netInstall / netAnnual;
  const fiveYearProfit = netAnnual * 5 - netInstall;

  return {
    annualRevenue,
    annualEnergyCost,
    annualMaintenance,
    netAnnual,
    netInstall,
    paybackYears: Math.max(0, paybackYears),
    fiveYearProfit,
    recommendation:
      paybackYears < 5 ? 'positive' : paybackYears < 8 ? 'marginal' : 'negative',
  };
}
