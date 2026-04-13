import { Injectable } from '@nestjs/common';

const OCM_API = 'https://api.openchargemap.io/v3';
const CHARGETRIP_API = 'https://api.chargetrip.io/graphql';

interface ChargerSearchParams {
  lat: number;
  lng: number;
  radius?: number; // km
  maxResults?: number;
  connectorType?: string;
  minPower?: number;
}

@Injectable()
export class NavigateService {
  /**
   * Search for chargers using Open Charge Map API.
   * Returns charger locations near the given coordinates.
   */
  async searchChargers(params: ChargerSearchParams) {
    const apiKey = process.env.OPEN_CHARGE_MAP_API_KEY;
    const queryParams = new URLSearchParams({
      output: 'json',
      latitude: String(params.lat),
      longitude: String(params.lng),
      distance: String(params.radius ?? 25),
      distanceunit: 'KM',
      maxresults: String(params.maxResults ?? 50),
      compact: 'true',
      verbose: 'false',
    });

    if (apiKey) queryParams.set('key', apiKey);

    const response = await fetch(`${OCM_API}/poi?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Open Charge Map API error: ${response.status}`);
    }

    const data = (await response.json()) as unknown[];
    return this.transformOCMData(data, params);
  }

  /**
   * Plan an EV route using Chargetrip GraphQL API.
   */
  async planRoute(input: {
    vehicleId: string;
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    startSoc: number;
  }) {
    const clientId = process.env.CHARGETRIP_CLIENT_ID;
    const appId = process.env.CHARGETRIP_APP_ID;

    if (!clientId || !appId) {
      throw new Error('Chargetrip API credentials not configured');
    }

    // Step 1: Create route
    const createResponse = await fetch(CHARGETRIP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-app-id': appId,
      },
      body: JSON.stringify({
        query: `
          mutation newRoute($input: RequestRouteInput!) {
            newRoute(input: $input)
          }
        `,
        variables: {
          input: {
            ev: { id: input.vehicleId },
            routeRequest: {
              origin: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [input.origin.lng, input.origin.lat],
                },
              },
              destination: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [input.destination.lng, input.destination.lat],
                },
              },
            },
            battery: { stateOfCharge: { value: input.startSoc, type: 'percentage' } },
          },
        },
      }),
    });

    const createData = (await createResponse.json()) as { data?: { newRoute?: string } };
    const routeId = createData?.data?.newRoute;

    if (!routeId) {
      throw new Error('Failed to create route');
    }

    // Step 2: Poll for route result (simplified — in production use WebSocket subscription)
    await new Promise((r) => setTimeout(r, 3000));

    const resultResponse = await fetch(CHARGETRIP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-app-id': appId,
      },
      body: JSON.stringify({
        query: `
          query getRoute($id: ID!) {
            route(id: $id) {
              status
              distance
              duration
              consumption
              chargeTime
              savings { fuel co2 }
              legs {
                distance
                duration
                consumption
                rangeStart
                rangeEnd
                origin { geometry { coordinates } }
                destination { geometry { coordinates } }
                stationId
                plugsAvailable
                chargeTime
                evse { connectorType power }
              }
              polyline
            }
          }
        `,
        variables: { id: routeId },
      }),
    });

    const resultData = (await resultResponse.json()) as { data?: { route?: unknown } };
    return resultData?.data?.route ?? null;
  }

  /**
   * List available EV models from Chargetrip.
   */
  async listVehicles(search?: string) {
    const clientId = process.env.CHARGETRIP_CLIENT_ID;
    const appId = process.env.CHARGETRIP_APP_ID;

    if (!clientId || !appId) {
      throw new Error('Chargetrip API credentials not configured');
    }

    const response = await fetch(CHARGETRIP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-app-id': appId,
      },
      body: JSON.stringify({
        query: `
          query vehicles($search: String, $size: Int) {
            vehicleList(search: $search, size: $size) {
              id
              naming { make model chargetrip_version }
              battery { usable_kwh }
              range { chargetrip_range { best worst } }
              connectors { standard power }
            }
          }
        `,
        variables: { search: search ?? '', size: 50 },
      }),
    });

    const data = (await response.json()) as { data?: { vehicleList?: unknown[] } };
    return data?.data?.vehicleList ?? [];
  }

  private transformOCMData(data: unknown[], params: ChargerSearchParams) {
    return (data as Record<string, unknown>[]).map((poi) => {
      const addr = poi.AddressInfo as Record<string, unknown> | undefined;
      const connections = (poi.Connections ?? []) as Record<string, unknown>[];

      return {
        id: poi.ID,
        title: addr?.Title ?? 'Unknown',
        lat: addr?.Latitude as number,
        lng: addr?.Longitude as number,
        address: addr?.AddressLine1 ?? '',
        city: addr?.Town ?? '',
        country: (addr?.Country as Record<string, unknown>)?.ISOCode ?? '',
        distance: addr?.Distance as number,
        operatorName: (poi.OperatorInfo as Record<string, unknown>)?.Title ?? 'Unknown',
        isOperational: (poi.StatusType as Record<string, unknown>)?.IsOperational ?? false,
        connections: connections.map((conn) => ({
          type: (conn.ConnectionType as Record<string, unknown>)?.Title ?? 'Unknown',
          powerKw: conn.PowerKW ?? 0,
          currentType: (conn.CurrentType as Record<string, unknown>)?.Title ?? '',
          quantity: conn.Quantity ?? 1,
        })),
        usageCost: poi.UsageCost ?? null,
      };
    }).filter((c) => {
      if (params.minPower) {
        return c.connections.some((conn) => (conn.powerKw as number) >= params.minPower!);
      }
      return true;
    });
  }
}
