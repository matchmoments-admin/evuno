'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Input, Button, Label, Select, Slider } from '@evuno/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const DEFAULT_VEHICLE_ID = '5d161be9c9eef46132d9d20a'; // Tesla Model 3

interface Vehicle {
  id: string;
  naming: { make: string; model: string; chargetrip_version?: string };
  battery?: { usable_kwh: number };
  range?: { chargetrip_range?: { best: number; worst: number } };
}

interface RouteLeg {
  distance: number;
  duration: number;
  consumption: number;
  stationId: string;
  chargeTime: number;
  rangeStart?: number;
  rangeEnd?: number;
  stateOfCharge?: { value: number };
}

interface RouteResult {
  status: string;
  distance: number;
  duration: number;
  consumption: number;
  chargeTime: number;
  legs: RouteLeg[];
}

export function RoutePlanner({ locale }: { locale: string }) {
  const t = useTranslations('route');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startSoc, setStartSoc] = useState(80);
  const [vehicleId, setVehicleId] = useState(DEFAULT_VEHICLE_ID);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch(`${API_BASE}/navigate/vehicles`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setVehicles(data);
            // Select first vehicle if current default not in list
            if (!data.find((v: Vehicle) => v.id === vehicleId)) {
              setVehicleId(data[0].id);
            }
          }
        }
      } catch {
        // Keep default Tesla Model 3 if API fails
      }
    }
    loadVehicles();
  }, []);

  async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`,
    );
    const data = await res.json();
    const coords = data.features?.[0]?.center;
    if (coords) return { lat: coords[1], lng: coords[0] };
    return null;
  }

  async function handlePlanRoute(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRoute(null);

    try {
      const [originCoords, destCoords] = await Promise.all([
        geocode(origin),
        geocode(destination),
      ]);

      if (!originCoords || !destCoords) {
        setError('Could not find one or both locations');
        return;
      }

      const res = await fetch(`${API_BASE}/navigate/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          origin: originCoords,
          destination: destCoords,
          startSoc,
        }),
      });

      if (!res.ok) throw new Error('Route planning failed');

      const data = await res.json();
      if (data) setRoute(data);
      else setError('No route found');
    } catch {
      setError('Failed to plan route. Check API keys are configured.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-surface/95 backdrop-blur-sm">
      <CardContent className="pt-4">
        <form onSubmit={handlePlanRoute} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{t('origin')}</Label>
            <Input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Santiago, Chile"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('destination')}</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Valparaiso, Chile"
              className="h-8 text-sm"
            />
          </div>

          {/* Vehicle Selector */}
          <div className="space-y-1">
            <Label className="text-xs">{t('vehicle')}</Label>
            {vehicles.length > 0 ? (
              <Select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="h-8 text-sm"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.naming.make} {v.naming.model}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="text-xs text-text-muted py-1">Tesla Model 3 (default)</div>
            )}
            <p className="text-[10px] text-text-muted">
              {locale === 'es' ? 'Mas vehiculos proximamente' : 'More vehicles coming soon'}
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              {t('startingSoc')}: {startSoc}%
            </Label>
            <Slider
              min={5}
              max={100}
              value={startSoc}
              onChange={(e) => setStartSoc(Number(e.target.value))}
            />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={loading}>
            {loading ? '...' : t('planRoute')}
          </Button>
        </form>

        {error && (
          <p className="text-xs text-danger mt-3">{error}</p>
        )}

        {route && (
          <div className="mt-4 pt-3 border-t border-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Distance</span>
              <span className="text-text font-mono">{(route.distance / 1000).toFixed(0)} km</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Duration</span>
              <span className="text-text font-mono">{Math.round(route.duration / 60)} min</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Energy</span>
              <span className="text-text font-mono">{route.consumption?.toFixed(1)} kWh</span>
            </div>

            {route.legs && route.legs.filter((l) => l.stationId).length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium text-text mb-1">
                  {t('chargingStops')} ({route.legs.filter((l) => l.stationId).length})
                </p>
                {route.legs
                  .filter((l) => l.stationId)
                  .map((leg, i) => (
                    <div key={i} className="text-xs text-text-muted py-1 border-t border-border flex justify-between">
                      <span>Stop {i + 1}: {Math.round(leg.chargeTime / 60)} min</span>
                      {leg.rangeStart != null && (
                        <span className="font-mono text-accent">
                          {Math.round(leg.rangeStart)}% &rarr; {Math.round(leg.rangeEnd ?? leg.rangeStart)}%
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
