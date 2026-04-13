'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ROIResult, SupportedCountry } from '@evuno/shared';
import { Card, CardContent, Badge } from '@evuno/ui';
import { formatCurrency, formatNumber } from '../lib/format';
import { LeadCaptureForm } from './lead-capture-form';
import { ResultsMap } from './results-map';

interface ROIResultsProps {
  result: ROIResult;
  country: SupportedCountry;
  coordinates?: { lat: number; lng: number } | null;
}

const recommendationVariant = {
  positive: 'default' as const,
  marginal: 'warning' as const,
  negative: 'danger' as const,
};

export function ROIResults({ result, country, coordinates }: ROIResultsProps) {
  const t = useTranslations('results');
  const [showLeadForm, setShowLeadForm] = useState(false);

  const metrics = [
    { label: t('annualRevenue'), value: formatCurrency(result.annualRevenue, country), positive: true },
    { label: t('annualEnergyCost'), value: formatCurrency(result.annualEnergyCost, country), positive: false },
    { label: t('annualMaintenance'), value: formatCurrency(result.annualMaintenance, country), positive: false },
    { label: t('netAnnualProfit'), value: formatCurrency(result.netAnnual, country), positive: result.netAnnual > 0 },
  ];

  const paybackWidth = Math.min((1 / Math.max(result.paybackYears, 0.1)) * 100, 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text">{t('title')}</h2>
            <Badge variant={recommendationVariant[result.recommendation]}>
              {t(`recommendation.${result.recommendation}`)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="p-4 rounded-consumer bg-bg border border-border">
                <p className="text-xs text-text-muted mb-1">{metric.label}</p>
                <p className={`text-lg font-mono font-semibold ${
                  metric.positive ? 'text-accent' : 'text-text'
                }`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          {/* Payback Period */}
          <div className="p-4 rounded-consumer bg-bg border border-border mb-4">
            <div className="flex justify-between mb-2">
              <p className="text-xs text-text-muted">{t('paybackPeriod')}</p>
              <p className="text-sm font-mono font-semibold text-text">
                {result.paybackYears === Infinity
                  ? '---'
                  : `${formatNumber(result.paybackYears)} ${t('years')}`}
              </p>
            </div>
            <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.recommendation === 'positive'
                    ? 'bg-accent'
                    : result.recommendation === 'marginal'
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
                style={{ width: `${paybackWidth}%` }}
              />
            </div>
          </div>

          {/* 5-Year Profit */}
          <div className="p-4 rounded-consumer bg-bg border border-border">
            <p className="text-xs text-text-muted mb-1">{t('fiveYearProfit')}</p>
            <p className={`text-xl font-mono font-semibold ${
              result.fiveYearProfit > 0 ? 'text-accent' : 'text-danger'
            }`}>
              {formatCurrency(result.fiveYearProfit, country)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location Map */}
      {coordinates && (
        <ResultsMap lat={coordinates.lat} lng={coordinates.lng} />
      )}

      {/* Lead Capture CTA */}
      {!showLeadForm ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowLeadForm(true)}
            className="w-full h-12 bg-accent text-bg font-medium rounded-consumer hover:bg-accent-hover transition-colors"
          >
            {t('getReport')}
          </button>
          <a
            href="mailto:sales@evuno.co"
            className="w-full h-12 flex items-center justify-center border border-border bg-surface text-text font-medium rounded-consumer hover:bg-surface-hover transition-colors"
          >
            {t('talkToSpecialist')}
          </a>
        </div>
      ) : (
        <LeadCaptureForm result={result} country={country} />
      )}
    </div>
  );
}
