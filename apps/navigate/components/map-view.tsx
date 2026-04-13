'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslations } from 'next-intl';
import { Input, Button } from '@evuno/ui';
import { ChargerPopup } from './charger-popup';
import { RoutePlanner } from './route-planner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Default center: Santiago, Chile
const DEFAULT_CENTER: [number, number] = [-70.6483, -33.4489];
const DEFAULT_ZOOM = 12;

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

export function MapView({ locale }: { locale: string }) {
  const t = useTranslations('map');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const [chargers, setChargers] = useState<Charger[]>([]);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadChargers = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/navigate/chargers?lat=${lat}&lng=${lng}&radius=25&maxResults=100`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setChargers(data);
    } catch {
      // Silently fail — map still works without charger data
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn('NEXT_PUBLIC_MAPBOX_TOKEN not set');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'bottom-right',
    );

    map.current.on('load', () => {
      loadChargers(DEFAULT_CENTER[1], DEFAULT_CENTER[0]);
    });

    map.current.on('moveend', () => {
      const center = map.current!.getCenter();
      loadChargers(center.lat, center.lng);
    });

    return () => {
      map.current?.remove();
    };
  }, [loadChargers]);

  // Update markers when chargers change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    chargers.forEach((charger) => {
      if (!charger.lat || !charger.lng) return;

      const maxPower = Math.max(...charger.connections.map((c) => c.powerKw || 0), 0);
      const color = !charger.isOperational
        ? '#6E6E8A'
        : maxPower >= 50
        ? '#3B82F6'
        : '#00E5A0';

      const el = document.createElement('div');
      el.className = 'charger-marker';
      el.style.cssText = `
        width: ${maxPower >= 50 ? '14px' : '10px'};
        height: ${maxPower >= 50 ? '14px' : '10px'};
        background: ${color};
        border: 2px solid ${color}44;
        border-radius: ${maxPower >= 50 ? '2px' : '50%'};
        cursor: pointer;
      `;

      el.addEventListener('click', () => {
        setSelectedCharger(charger);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([charger.lng, charger.lat])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [chargers]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || !map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&limit=1`,
    );
    const data = await res.json();
    const feature = data.features?.[0];
    if (feature) {
      map.current.flyTo({
        center: feature.center,
        zoom: 13,
      });
    }
  }

  return (
    <div className="relative h-screen w-full">
      {/* Map */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 max-w-md z-10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="bg-surface/95 backdrop-blur-sm"
          />
          <Button type="submit" size="md">
            Search
          </Button>
        </form>
      </div>

      {/* Route Planner Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant={showRoutePlanner ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setShowRoutePlanner(!showRoutePlanner)}
          className="backdrop-blur-sm"
        >
          {useTranslations('route')('planRoute')}
        </Button>
      </div>

      {/* Route Planner Panel */}
      {showRoutePlanner && (
        <div className="absolute top-16 right-4 w-80 z-10">
          <RoutePlanner locale={locale} />
        </div>
      )}

      {/* Charger Popup */}
      {selectedCharger && (
        <div className="absolute bottom-4 left-4 right-4 max-w-sm z-10">
          <ChargerPopup
            charger={selectedCharger}
            onClose={() => setSelectedCharger(null)}
          />
        </div>
      )}

      {/* Charger count indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-surface/90 backdrop-blur-sm border border-border rounded-consumer px-3 py-1.5 text-xs text-text-muted">
          {chargers.length} chargers
        </div>
      </div>
    </div>
  );
}
