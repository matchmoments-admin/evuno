import {
  COUNTRY_DEFAULTS,
  type SupportedCountry,
} from './constants/countries';

export interface ScoutInputs {
  address: string;
  country: SupportedCountry;
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

// Annual maintenance cost per charger by country and type
const MAINTENANCE_COST: Record<SupportedCountry, Record<'L2' | 'DCFC', number>> = {
  CL: { L2: 300_000, DCFC: 1_200_000 },   // CLP
  AU: { L2: 500, DCFC: 2_000 },             // AUD
};

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
  const maintenancePerCharger =
    MAINTENANCE_COST[inputs.country]?.[inputs.chargerType] ??
    MAINTENANCE_COST.CL[inputs.chargerType];
  const annualMaintenance = inputs.chargerCount * maintenancePerCharger;

  const netAnnual = annualRevenue - annualEnergyCost - annualMaintenance;
  const netInstall =
    inputs.installCostTotal * (1 - inputs.taxCreditPct / 100);
  const paybackYears = netAnnual > 0 ? netInstall / netAnnual : Infinity;
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
