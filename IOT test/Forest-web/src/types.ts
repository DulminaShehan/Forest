export type RiskLevel = 'safe' | 'warning' | 'danger';
export type DeviceState = 'online' | 'degraded' | 'offline';

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  zone: string;
  level: RiskLevel;
  time: string;
}

export interface HistoryPoint {
  label: string;
  temperature: number;
  fire: number;
  animals: number;
  smoke: number;
}

export interface HeatCell {
  row: number;
  column: number;
  value: number;
}

export interface DeviceStatus {
  id: string;
  name: string;
  state: DeviceState;
  signal: number;
  latency: number;
  power: number;
}

export interface CameraSnapshot {
  id: string;
  label: string;
  capturedAt: string;
  confidence: number;
  source: string;
}

export interface ForestMonitorState {
  temperature: number;
  smoke: number;
  fireRisk: RiskLevel;
  fireStatus: {
    active: boolean;
    zone: string;
    updatedAt: string;
  };
  animalDetection: {
    count: number;
    active: boolean;
    lastDetected: string;
    zones: string[];
  };
  activeSensors: number;
  battery: number;
  solar: number;
  online: boolean;
  lastSync: string;
  alerts: AlertItem[];
  history: HistoryPoint[];
  heatmap: HeatCell[];
  deviceStatus: DeviceStatus[];
  weather: {
    condition: string;
    temperature: number;
    humidity: number;
    wind: number;
  };
  gps: {
    label: string;
    lat: number;
    lng: number;
  };
  aiPrediction: string;
  aiConfidence: number;
  cameraSnapshots: CameraSnapshot[];
  loading: boolean;
}