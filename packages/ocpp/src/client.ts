import type { ChargerStatus } from './types';

/**
 * REST client for CitrineOS CSMS.
 * CitrineOS runs as a separate Docker service — this client calls its HTTP API.
 */
export class CitrineOSClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8081') {
    this.baseUrl = baseUrl;
  }

  async getChargerStatus(ocppId: string): Promise<ChargerStatus> {
    // Will be implemented in Phase 4
    throw new Error('Not implemented');
  }

  async remoteStartTransaction(
    ocppId: string,
    connectorId: number,
    idTag: string,
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async remoteStopTransaction(
    ocppId: string,
    transactionId: number,
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async resetCharger(
    ocppId: string,
    type: 'Soft' | 'Hard',
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async unlockConnector(
    ocppId: string,
    connectorId: number,
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async getConfiguration(
    ocppId: string,
  ): Promise<Record<string, string>> {
    throw new Error('Not implemented');
  }

  async changeConfiguration(
    ocppId: string,
    key: string,
    value: string,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
