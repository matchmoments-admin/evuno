'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@evuno/ui';
import { useAuth } from '../../../../lib/use-auth';
import { apiFetch } from '../../../../lib/api';

interface Session {
  id: string;
  chargerId: string;
  ocppTransactionId: string;
  startedAt: string;
  durationMinutes: number;
  energyKwh: number;
  costAmount: string;
  costCurrency: string;
  paymentStatus: string;
}

function exportCSV(sessions: Session[]) {
  const headers = 'Charger ID,Transaction ID,Started At,Duration (min),Energy (kWh),Cost,Currency,Status';
  const rows = sessions.map((s) =>
    [
      s.chargerId,
      s.ocppTransactionId ?? '',
      s.startedAt,
      s.durationMinutes,
      s.energyKwh,
      s.costAmount,
      s.costCurrency,
      s.paymentStatus,
    ].join(','),
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evuno-sessions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SessionsPage() {
  const t = useTranslations('sessions');
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!token) return;
    apiFetch<Session[]>('/sessions?limit=100', { token }).then(setSessions).catch(() => {});
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text">{t('title')}</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => exportCSV(sessions)}
          disabled={sessions.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <div className="border border-border rounded-dashboard overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-text-muted bg-surface border-b border-border">
              <th className="text-left px-4 py-3 font-medium">{t('charger')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('startTime')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('duration')}</th>
              <th className="text-right px-4 py-3 font-medium">{t('energy')}</th>
              <th className="text-right px-4 py-3 font-medium">{t('cost')}</th>
              <th className="text-right px-4 py-3 font-medium">{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-text-muted">
                {token ? 'No sessions found' : 'Log in to view sessions'}
              </td></tr>
            )}
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm text-text font-mono">{session.chargerId.slice(0, 8)}</p>
                  <p className="text-xs text-text-muted font-mono">{session.ocppTransactionId}</p>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted font-mono">
                  {new Date(session.startedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">{session.durationMinutes} min</td>
                <td className="px-4 py-3 text-sm text-text font-mono text-right">{session.energyKwh} kWh</td>
                <td className="px-4 py-3 text-sm text-accent font-mono text-right">
                  {session.costAmount} {session.costCurrency}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    session.paymentStatus === 'succeeded'
                      ? 'bg-accent-muted text-accent'
                      : session.paymentStatus === 'failed'
                      ? 'bg-danger-muted text-danger'
                      : 'bg-warning-muted text-warning'
                  }`}>
                    {session.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
