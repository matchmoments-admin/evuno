export interface ChargerStatus {
  ocppId: string;
  status: 'online' | 'offline' | 'charging' | 'faulted';
  connectorId?: number;
  errorCode?: string;
  timestamp: string;
}

export interface OcppResponse {
  status: string;
  [key: string]: unknown;
}

export interface VariableAttribute {
  component: { name: string };
  variable: { name: string };
  value?: string;
  mutability?: string;
}
