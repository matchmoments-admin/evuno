'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent } from '@evuno/ui';
import { StatusBadge } from '../../../../components/status-badge';
import { useAuth } from '../../../../lib/use-auth';
import { apiFetch } from '../../../../lib/api';

interface Charger {
  id: string;
  ocppId: string;
  name: string;
  status: string;
  liveStatus?: string;
  level: string;
  powerKw: number;
  connectorType: string;
  locationCity: string;
}

export default function ChargersPage() {
  const t = useTranslations('chargers');
  const { locale } = useParams();
  const { token } = useAuth();
  const [chargers, setChargers] = useState<Charger[]>([]);

  useEffect(() => {
    if (!token) return;
    apiFetch<Charger[]>('/chargers', { token }).then(setChargers).catch(() => {});
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text">{t('title')}</h1>
        <Button size="sm">{t('addCharger')}</Button>
      </div>

      <div className="grid gap-3">
        {chargers.length === 0 && (
          <p className="text-sm text-text-muted py-8 text-center">No chargers registered yet</p>
        )}
        {chargers.map((charger) => (
          <Link key={charger.id} href={`/${locale}/dashboard/chargers/${charger.id}`}>
            <Card className="hover:bg-surface-hover transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-dashboard flex items-center justify-center text-xs font-mono ${
                    charger.level === 'DC' ? 'bg-info-muted text-info' : 'bg-accent-muted text-accent'
                  }`}>
                    {charger.level === 'DC' ? 'DC' : 'AC'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{charger.name}</p>
                    <p className="text-xs text-text-muted font-mono">{charger.ocppId} &middot; {charger.locationCity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted font-mono">
                    {charger.powerKw} kW &middot; {charger.connectorType}
                  </span>
                  <StatusBadge status={charger.liveStatus ?? charger.status} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
