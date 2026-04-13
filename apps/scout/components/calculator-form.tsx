'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import {
  COUNTRY_DEFAULTS,
  type SupportedCountry,
  calculateROI,
  type ROIResult,
} from '@evuno/shared';
import { Button, Input, Select, Slider, Label, Card, CardContent } from '@evuno/ui';
import { ROIResults } from './roi-results';

const PROPERTY_TYPES = [
  'restaurant',
  'hotel',
  'mall',
  'apartment',
  'office',
  'hospital',
  'other',
] as const;

export function CalculatorForm() {
  const t = useTranslations('calculator');
  const [result, setResult] = useState<ROIResult | null>(null);
  const [country, setCountry] = useState<SupportedCountry>('CL');

  const defaults = COUNTRY_DEFAULTS[country];

  const [propertyType, setPropertyType] = useState<string>('hotel');
  const [parkingSpaces, setParkingSpaces] = useState(50);
  const [chargerType, setChargerType] = useState<'L2' | 'DCFC'>('L2');
  const [chargerCount, setChargerCount] = useState(4);
  const [electricityRate, setElectricityRate] = useState(defaults.commercialRate);
  const [sessionRate, setSessionRate] = useState(
    country === 'CL' ? 2500 : 8,
  );
  const [utilizationPct, setUtilizationPct] = useState(30);
  const [installCostTotal, setInstallCostTotal] = useState(
    defaults.l2InstallCostMin * 4,
  );
  const [taxCreditPct, setTaxCreditPct] = useState(defaults.taxCreditPct);
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Google Places Autocomplete setup
  const initAutocomplete = useCallback(() => {
    if (!addressInputRef.current || !(window as unknown as Record<string, unknown>).google) return;
    const google = (window as unknown as { google: { maps: { places: { Autocomplete: new (el: HTMLInputElement, opts: Record<string, unknown>) => { addListener: (event: string, cb: () => void) => void; getPlace: () => { formatted_address?: string; geometry?: { location: { lat: () => number; lng: () => number } } } } } } } }).google;
    const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: country.toLowerCase() },
      fields: ['formatted_address', 'geometry'],
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) setAddress(place.formatted_address);
      if (place.geometry?.location) {
        setCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });
  }, [country]);

  useEffect(() => {
    initAutocomplete();
  }, [initAutocomplete]);

  function handleCountryChange(newCountry: SupportedCountry) {
    setCountry(newCountry);
    const d = COUNTRY_DEFAULTS[newCountry];
    setElectricityRate(d.commercialRate);
    setSessionRate(newCountry === 'CL' ? 2500 : 8);
    setInstallCostTotal(
      (chargerType === 'L2' ? d.l2InstallCostMin : d.dcInstallCostMin) * chargerCount,
    );
    setTaxCreditPct(d.taxCreditPct);
    setResult(null);
  }

  function handleChargerTypeChange(type: 'L2' | 'DCFC') {
    setChargerType(type);
    const d = COUNTRY_DEFAULTS[country];
    setInstallCostTotal(
      (type === 'L2' ? d.l2InstallCostMin : d.dcInstallCostMin) * chargerCount,
    );
    setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const roi = calculateROI({
      address: '',
      country,
      propertyType: propertyType as typeof PROPERTY_TYPES[number],
      parkingSpaces,
      chargerType,
      chargerCount,
      electricityRate,
      sessionRate,
      utilizationPct,
      installCostTotal,
      taxCreditPct,
    });
    setResult(roi);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          onLoad={initAutocomplete}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-5">
            {/* Country */}
            <div className="space-y-2">
              <Label>{t('country')}</Label>
              <div className="flex gap-3">
                {(['CL', 'AU'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCountryChange(c)}
                    className={`flex-1 h-10 rounded-consumer border text-sm font-medium transition-colors ${
                      country === c
                        ? 'border-accent bg-accent-muted text-accent'
                        : 'border-border bg-surface text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {c === 'CL' ? 'Chile' : 'Australia'}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>{country === 'CL' ? 'Direccion' : 'Address'}</Label>
              <Input
                ref={addressInputRef}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={country === 'CL' ? 'Av. Providencia 1234, Santiago' : '123 George St, Sydney'}
              />
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label>{t('propertyType')}</Label>
              <Select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`propertyTypes.${type}`)}
                  </option>
                ))}
              </Select>
            </div>

            {/* Parking Spaces */}
            <div className="space-y-2">
              <Label>{t('parkingSpaces')}</Label>
              <Input
                type="number"
                min={1}
                max={10000}
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(Number(e.target.value))}
              />
            </div>

            {/* Charger Type */}
            <div className="space-y-2">
              <Label>{t('chargerType')}</Label>
              <div className="flex gap-3">
                {(['L2', 'DCFC'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChargerTypeChange(type)}
                    className={`flex-1 h-10 rounded-consumer border text-sm font-medium transition-colors ${
                      chargerType === type
                        ? 'border-accent bg-accent-muted text-accent'
                        : 'border-border bg-surface text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {type === 'L2' ? 'Level 2 AC (7-22 kW)' : 'DC Fast (50+ kW)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Charger Count */}
            <div className="space-y-2">
              <Label>{t('chargerCount')}</Label>
              <Input
                type="number"
                min={1}
                max={Math.min(parkingSpaces, 500)}
                value={chargerCount}
                onChange={(e) => {
                  const count = Number(e.target.value);
                  setChargerCount(count);
                  const d = COUNTRY_DEFAULTS[country];
                  setInstallCostTotal(
                    (chargerType === 'L2' ? d.l2InstallCostMin : d.dcInstallCostMin) * count,
                  );
                }}
              />
            </div>

            {/* Electricity Rate */}
            <div className="space-y-2">
              <Label>
                {t('electricityRate')} ({country === 'CL' ? 'CLP/kWh' : 'AUD cents/kWh'})
              </Label>
              <Input
                type="number"
                min={0}
                step={country === 'CL' ? 1 : 0.01}
                value={electricityRate}
                onChange={(e) => setElectricityRate(Number(e.target.value))}
              />
            </div>

            {/* Session Rate */}
            <div className="space-y-2">
              <Label>
                {t('sessionRate')} ({country === 'CL' ? 'CLP' : 'AUD'})
              </Label>
              <Input
                type="number"
                min={0}
                step={country === 'CL' ? 100 : 0.5}
                value={sessionRate}
                onChange={(e) => setSessionRate(Number(e.target.value))}
              />
            </div>

            {/* Utilization */}
            <div className="space-y-2">
              <Label>
                {t('utilization')}: {utilizationPct}%
              </Label>
              <Slider
                min={1}
                max={100}
                value={utilizationPct}
                onChange={(e) => setUtilizationPct(Number(e.target.value))}
              />
            </div>

            {/* Installation Cost */}
            <div className="space-y-2">
              <Label>
                {t('installCost')} ({country === 'CL' ? 'CLP' : 'AUD'})
              </Label>
              <Input
                type="number"
                min={0}
                value={installCostTotal}
                onChange={(e) => setInstallCostTotal(Number(e.target.value))}
              />
            </div>

            {/* Tax Credit */}
            <div className="space-y-2">
              <Label>{t('taxCredit')} (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={taxCreditPct}
                onChange={(e) => setTaxCreditPct(Number(e.target.value))}
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              {t('calculate')}
            </Button>
          </CardContent>
        </Card>
      </form>

      {result && (
        <div className="mt-8">
          <ROIResults result={result} country={country} coordinates={coordinates} />
        </div>
      )}
    </div>
  );
}
