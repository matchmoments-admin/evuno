export interface ChargerStatus {
  ocppId: string;
  status: 'online' | 'offline' | 'charging' | 'faulted';
  connectorId?: number;
  errorCode?: string;
  timestamp: string;
}
