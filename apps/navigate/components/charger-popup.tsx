'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, Badge, Button } from '@evuno/ui';

interface Charger {
  id: number;
  title: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  operatorName: string;
  isOperational: boolean;
  connections: { type: string; powerKw: number; currentType: string; quantity: number }[];
  usageCost: string | null;
}

export function ChargerPopup({
  charger,
  onClose,
}: {
  charger: Charger;
  onClose: () => void;
}) {
  const t = useTranslations('charger');

  const maxPower = Math.max(...charger.connections.map((c) => c.powerKw || 0), 0);

  return (
    <Card className="bg-surface/95 backdrop-blur-sm">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium text-text">{charger.title}</h3>
            <p className="text-xs text-text-muted">{charger.operatorName}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text text-lg leading-none">&times;</button>
        </div>

        <p className="text-xs text-text-muted mb-3">
          {charger.address}{charger.city ? `, ${charger.city}` : ''}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant={charger.isOperational ? 'available' : 'offline'}>
            {charger.isOperational ? t('available') : t('offline')}
          </Badge>
          {maxPower >= 50 && (
            <Badge variant="info">DC Fast</Badge>
          )}
        </div>

        {/* Connectors */}
        <div className="space-y-1 mb-3">
          {charger.connections.map((conn, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-text-muted">{conn.type}</span>
              <span className="text-text font-mono">
                {conn.powerKw ? `${conn.powerKw} kW` : '—'} &times; {conn.quantity}
              </span>
            </div>
          ))}
        </div>

        {charger.usageCost && (
          <p className="text-xs text-text-muted mb-3">
            {t('price')}: {charger.usageCost}
          </p>
        )}

        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${charger.lat},${charger.lng}`,
              '_blank',
            );
          }}
        >
          {t('navigate')}
        </Button>
      </CardContent>
    </Card>
  );
}
