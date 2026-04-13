'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@evuno/ui';

interface ResultsMapProps {
  lat: number;
  lng: number;
}

export function ResultsMap({ lat, lng }: ResultsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 14,
      interactive: false,
    });

    // Property marker
    new mapboxgl.Marker({ color: '#00E5A0' })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Load nearby chargers from OCM
    map.current.on('load', async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
        const res = await fetch(`${API_BASE}/navigate/chargers?lat=${lat}&lng=${lng}&radius=5&maxResults=20`);
        if (!res.ok) return;
        const chargers = await res.json();
        for (const charger of chargers) {
          if (!charger.lat || !charger.lng) continue;
          const el = document.createElement('div');
          el.style.cssText = 'width:8px;height:8px;background:#6E6E8A;border-radius:50%;';
          new mapboxgl.Marker({ element: el })
            .setLngLat([charger.lng, charger.lat])
            .addTo(map.current!);
        }
      } catch { /* ignore */ }
    });

    return () => {
      map.current?.remove();
    };
  }, [lat, lng]);

  return (
    <Card>
      <CardContent className="p-0 overflow-hidden rounded-consumer">
        <div ref={mapContainer} className="h-[250px] w-full" />
        <div className="px-4 py-2 flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" /> Your property
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-text-muted inline-block" /> Existing chargers nearby
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
