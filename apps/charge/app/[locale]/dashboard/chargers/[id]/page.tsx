'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@evuno/ui';
import { StatusBadge } from '../../../../../components/status-badge';
import { useAuth } from '../../../../../lib/use-auth';
import { apiFetch } from '../../../../../lib/api';

interface Charger {
  id: string;
  ocppId: string;
  name: string;
  status: string;
  level: string;
  powerKw: number;
  connectorType: string;
  locationCity: string;
  locationAddress: string;
  pricePerKwh: string;
  priceCurrency: string;
}

export default function ChargerDetailPage() {
  const { locale, id } = useParams();
  const { token } = useAuth();
  const [charger, setCharger] = useState<Charger | null>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    apiFetch<Charger>(`/chargers/${id}`, { token }).then(setCharger).catch(() => {});
  }, [token, id]);

  // Poll live status every 10 seconds
  useEffect(() => {
    if (!token || !id) return;
    const poll = async () => {
      try {
        const status = await apiFetch<{ status: string }>(`/chargers/${id}/status`, { token });
        setLiveStatus(status.status);
      } catch { /* ignore */ }
    };
    poll();
    const interval = setInterval(poll, 10_000);
    return () => clearInterval(interval);
  }, [token, id]);

  async function executeAction(action: string, params?: Record<string, unknown>) {
    if (!token || !id) return;
    setActionResult(null);
    try {
      await apiFetch(`/chargers/${id}/action`, {
        token,
        method: 'POST',
        body: JSON.stringify({ action, params }),
      });
      setActionResult(`${action} sent successfully`);
    } catch {
      setActionResult(`${action} failed`);
    }
  }

  if (!charger) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">{token ? 'Loading...' : 'Log in to view charger'}</p>
        <Link href={`/${locale}/dashboard/chargers`} className="text-accent text-sm mt-2 block">
          Back to chargers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${locale}/dashboard/chargers`} className="text-text-muted hover:text-text text-sm">
          &larr; Chargers
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">{charger.name}</h1>
          <p className="text-sm text-text-muted font-mono">{charger.ocppId}</p>
        </div>
        <StatusBadge status={liveStatus ?? charger.status} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Level" value={charger.level === 'DC' ? 'DC Fast' : 'Level 2 AC'} />
            <DetailRow label="Power" value={`${charger.powerKw} kW`} />
            <DetailRow label="Connector" value={charger.connectorType ?? '—'} />
            <DetailRow label="Price" value={`${charger.pricePerKwh} ${charger.priceCurrency}/kWh`} />
            <DetailRow label="Location" value={`${charger.locationAddress ?? ''}, ${charger.locationCity ?? ''}`} />
            <DetailRow label="Live Status" value={liveStatus ?? 'Polling...'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="default" className="w-full" onClick={() => executeAction('remoteStart')}>
              Remote Start
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => executeAction('remoteStop')}>
              Remote Stop
            </Button>
            <Button variant="outline" className="w-full" onClick={() => executeAction('reset', { type: 'Soft' })}>
              Reset (Soft)
            </Button>
            <Button variant="outline" className="w-full" onClick={() => executeAction('unlock')}>
              Unlock Connector
            </Button>
            {actionResult && (
              <p className={`text-xs ${actionResult.includes('failed') ? 'text-danger' : 'text-accent'}`}>
                {actionResult}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text font-mono">{value}</span>
    </div>
  );
}
