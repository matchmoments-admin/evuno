'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ROIResult, SupportedCountry } from '@evuno/shared';
import { Button, Input, Label, Card, CardContent } from '@evuno/ui';

interface LeadCaptureFormProps {
  result: ROIResult;
  country: SupportedCountry;
}

export function LeadCaptureForm({ result, country }: LeadCaptureFormProps) {
  const t = useTranslations('lead');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      country,
      roiResult: result,
    };

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      // Silently handle — the lead form is non-critical
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <div className="w-12 h-12 rounded-full bg-accent-muted mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-text">{t('success')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-text mb-1">{t('title')}</h3>
        <p className="text-sm text-text-muted mb-6">{t('subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('name')}</Label>
            <Input name="name" required />
          </div>
          <div className="space-y-2">
            <Label>{t('email')}</Label>
            <Input name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label>{t('phone')}</Label>
            <Input name="phone" type="tel" required />
          </div>
          <div className="space-y-2">
            <Label>{t('company')}</Label>
            <Input name="company" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? '...' : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
