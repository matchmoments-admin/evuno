import type { ChargerStatus, OcppResponse, VariableAttribute } from './types';

/**
 * REST client for CitrineOS CSMS (OCPP 2.0.1).
 * CitrineOS runs as a separate Docker service — this client calls its HTTP API.
 */
export class CitrineOSClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8081', timeout = 5000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeout = timeout;
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `CitrineOS ${method} ${path} failed: ${response.status} ${text}`,
        );
      }

      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async getChargerStatus(ocppId: string): Promise<ChargerStatus> {
    try {
      const data = await this.request<Record<string, unknown>[]>(
        'GET',
        `/data/monitoring/VariableAttribute?stationId=${encodeURIComponent(ocppId)}`,
      );

      // Extract connector availability from OCPP 2.0.1 variable attributes
      let status: ChargerStatus['status'] = 'offline';
      let errorCode: string | undefined;

      if (Array.isArray(data) && data.length > 0) {
        const availAttr = data.find(
          (attr: Record<string, unknown>) =>
            (attr.variable as Record<string, unknown>)?.name === 'AvailabilityState',
        );
        const value = (availAttr as Record<string, unknown>)?.value as string | undefined;

        if (value === 'Available') status = 'online';
        else if (value === 'Occupied') status = 'charging';
        else if (value === 'Faulted') {
          status = 'faulted';
          const errorAttr = data.find(
            (attr: Record<string, unknown>) =>
              (attr.variable as Record<string, unknown>)?.name === 'Problem',
          );
          errorCode = (errorAttr as Record<string, unknown>)?.value as string | undefined;
        } else if (value === 'Unavailable') status = 'offline';
        else status = 'online'; // connected but no specific state
      }

      return {
        ocppId,
        status,
        errorCode,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // If CitrineOS is unreachable, return offline rather than crashing
      return {
        ocppId,
        status: 'offline',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async remoteStartTransaction(
    ocppId: string,
    connectorId: number,
    idTag: string,
  ): Promise<OcppResponse> {
    return this.request('POST', '/ocpp/RequestStartTransaction', {
      stationId: ocppId,
      evseId: connectorId,
      idToken: { idToken: idTag, type: 'Central' },
    });
  }

  async remoteStopTransaction(
    ocppId: string,
    transactionId: number,
  ): Promise<OcppResponse> {
    return this.request('POST', '/ocpp/RequestStopTransaction', {
      stationId: ocppId,
      transactionId: String(transactionId),
    });
  }

  async resetCharger(
    ocppId: string,
    type: 'Soft' | 'Hard',
  ): Promise<OcppResponse> {
    return this.request('POST', '/ocpp/Reset', {
      stationId: ocppId,
      type: type === 'Soft' ? 'OnIdle' : 'Immediate',
    });
  }

  async unlockConnector(
    ocppId: string,
    connectorId: number,
  ): Promise<OcppResponse> {
    return this.request('POST', '/ocpp/UnlockConnector', {
      stationId: ocppId,
      evseId: connectorId,
      connectorId: 1,
    });
  }

  async getConfiguration(
    ocppId: string,
  ): Promise<Record<string, string>> {
    const data = await this.request<VariableAttribute[]>(
      'GET',
      `/data/configuration/VariableAttribute?stationId=${encodeURIComponent(ocppId)}`,
    );

    const config: Record<string, string> = {};
    if (Array.isArray(data)) {
      for (const attr of data) {
        const key = `${attr.component?.name}.${attr.variable?.name}`;
        config[key] = attr.value ?? '';
      }
    }
    return config;
  }

  async changeConfiguration(
    ocppId: string,
    key: string,
    value: string,
  ): Promise<OcppResponse> {
    // Key format: "ComponentName.VariableName"
    const [componentName, variableName] = key.split('.');
    return this.request('POST', '/ocpp/SetVariables', {
      stationId: ocppId,
      setVariableData: [
        {
          attributeValue: value,
          component: { name: componentName },
          variable: { name: variableName ?? componentName },
        },
      ],
    });
  }
}
