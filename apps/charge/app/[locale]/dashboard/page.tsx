'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MetricCard } from '../../../components/metric-card';
import { StatusBadge } from '../../../components/status-badge';
import { useAuth } from '../../../lib/use-auth';
import { apiFetch } from '../../../lib/api';

interface Stats {
  summary: {
    total_sessions: number;
    total_energy_kwh: number;
    total_revenue: number;
    avg_duration_minutes: number;
  };
}

interface Charger {
  id: string;
  name: string;
  status: string;
  liveStatus?: string;
}

interface Session {
  id: string;
  chargerId: string;
  startedAt: string;
  durationMinutes: number;
  energyKwh: number;
  costAmount: string;
  costCurrency: string;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!token) return;
    apiFetch<Stats>('/sessions/stats?days=1', { token }).then(setStats).catch(() => {});
    apiFetch<Charger[]>('/chargers', { token }).then(setChargers).catch(() => {});
    apiFetch<Session[]>('/sessions?limit=5', { token }).then(setSessions).catch(() => {});
  }, [token]);

  const getStatus = (c: Charger) => c.liveStatus ?? c.status;
  const statusCounts = {
    online: chargers.filter((c) => getStatus(c) === 'online').length,
    charging: chargers.filter((c) => getStatus(c) === 'charging').length,
    faulted: chargers.filter((c) => getStatus(c) === 'faulted').length,
    offline: chargers.filter((c) => getStatus(c) === 'offline').length,
  };
  const s = stats?.summary;

  return (
    <div>
      <h1 className="text-xl font-semibold text-text mb-6">{t('title')}</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard label={t('totalChargers')} value={String(chargers.length || '—')} />
        <MetricCard label={t('activeSessions')} value={String(s?.total_sessions ?? '—')} accent />
        <MetricCard label={t('todayRevenue')} value={s ? `$${Number(s.total_revenue).toFixed(2)}` : '—'} accent />
        <MetricCard label={t('todayEnergy')} value={s ? `${Number(s.total_energy_kwh).toFixed(0)} kWh` : '—'} />
      </div>

      <div className="flex gap-3 mb-8">
        {(['online', 'charging', 'faulted', 'offline'] as const).map((status) => (
          <div key={status} className="flex items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-sm font-mono text-text">{statusCounts[status]}</span>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-dashboard overflow-hidden">
        <div className="px-4 py-3 bg-surface border-b border-border">
          <h2 className="text-sm font-medium text-text">{t('recentSessions')}</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-text-muted border-b border-border">
              <th className="text-left px-4 py-2 font-medium">Charger</th>
              <th className="text-left px-4 py-2 font-medium">Start</th>
              <th className="text-left px-4 py-2 font-medium">Duration</th>
              <th className="text-right px-4 py-2 font-medium">Energy</th>
              <th className="text-right px-4 py-2 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && !token && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-text-muted">Log in to view sessions</td></tr>
            )}
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 text-sm text-text font-mono">{session.chargerId.slice(0, 8)}</td>
                <td className="px-4 py-3 text-sm text-text-muted font-mono">{new Date(session.startedAt).toLocaleTimeString()}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{session.durationMinutes} min</td>
                <td className="px-4 py-3 text-sm text-text font-mono text-right">{session.energyKwh} kWh</td>
                <td className="px-4 py-3 text-sm text-accent font-mono text-right">{session.costAmount} {session.costCurrency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
