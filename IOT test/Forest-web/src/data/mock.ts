import type { AlertItem, CameraSnapshot, DeviceStatus, ForestMonitorState, HeatCell, HistoryPoint, RiskLevel } from '@/types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.round(random(min, max));
const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const createHeatmap = (temperature: number, risk: RiskLevel): HeatCell[] => {
  const base = risk === 'danger' ? 72 : risk === 'warning' ? 48 : 24;
  return Array.from({ length: 48 }, (_, index) => ({
    row: Math.floor(index / 8),
    column: index % 8,
    value: clamp(base + temperature * 0.6 + random(-15, 20), 5, 100)
  }));
};

const createHistory = (): HistoryPoint[] =>
  Array.from({ length: 18 }, (_, index) => {
    const temperature = 24 + Math.sin(index / 3) * 4 + index * 0.4;
    const smoke = 18 + Math.cos(index / 4) * 3 + index * 0.18;
    const animals = 2 + Math.max(0, Math.sin(index / 2) * 2) + (index % 5 === 0 ? 3 : 0);
    const fire = Math.max(3, Math.min(95, smoke + temperature * 1.1 - 5));
    return {
      label: `${index}:00`,
      temperature: Number(temperature.toFixed(1)),
      smoke: Number(smoke.toFixed(1)),
      animals: Number(animals.toFixed(1)),
      fire: Number(fire.toFixed(1))
    };
  });

const createAlerts = (): AlertItem[] => [
  {
    id: 'alert-1',
    title: 'Fire detected in Zone A',
    message: 'Thermal spike and smoke index rose above the danger threshold.',
    zone: 'Zone A',
    level: 'danger',
    time: '2 min ago'
  },
  {
    id: 'alert-2',
    title: 'Animal movement detected',
    message: 'AMG8833 identified heat movement close to the north trail.',
    zone: 'Zone C',
    level: 'warning',
    time: '8 min ago'
  },
  {
    id: 'alert-3',
    title: 'High temperature warning',
    message: 'Forest edge temperature is trending upward unusually fast.',
    zone: 'Zone B',
    level: 'warning',
    time: '14 min ago'
  }
];

const createDeviceStatus = (): DeviceStatus[] => [
  { id: 'esp32-1', name: 'ESP32 Core Node', state: 'online', signal: 98, latency: 12, power: 87 },
  { id: 'amg8833-1', name: 'AMG8833 Thermal Sensor', state: 'online', signal: 96, latency: 9, power: 91 },
  { id: 'cam-1', name: 'ESP32-CAM Module', state: 'online', signal: 92, latency: 20, power: 79 },
  { id: 'gps-1', name: 'Forest GPS Beacon', state: 'degraded', signal: 68, latency: 41, power: 64 },
  { id: 'solar-1', name: 'Solar Charging Unit', state: 'online', signal: 89, latency: 17, power: 74 }
];

const createSnapshots = (): CameraSnapshot[] => [
  { id: 'snap-1', label: 'Boar detected', capturedAt: '05:12', confidence: 96, source: 'ESP32-CAM' },
  { id: 'snap-2', label: 'Thermal plume', capturedAt: '05:18', confidence: 88, source: 'AMG8833' },
  { id: 'snap-3', label: 'Forest path scan', capturedAt: '05:27', confidence: 84, source: 'ESP32-CAM' }
];

const deriveRisk = (temperature: number, smoke: number, fireActive: boolean): RiskLevel => {
  if (fireActive || temperature > 58 || smoke > 72) return 'danger';
  if (temperature > 42 || smoke > 38) return 'warning';
  return 'safe';
};

export const createInitialForestState = (): ForestMonitorState => {
  const temperature = 31.4;
  const smoke = 14.6;
  const fireRisk = deriveRisk(temperature, smoke, false);
  return {
    temperature,
    smoke,
    fireRisk,
    fireStatus: {
      active: false,
      zone: 'Zone B',
      updatedAt: nowLabel()
    },
    animalDetection: {
      count: 4,
      active: true,
      lastDetected: '05:26',
      zones: ['North Ridge', 'Waterline', 'Trail Sector C']
    },
    activeSensors: 5,
    battery: 82,
    solar: 67,
    online: true,
    lastSync: nowLabel(),
    alerts: createAlerts(),
    history: createHistory(),
    heatmap: createHeatmap(temperature, fireRisk),
    deviceStatus: createDeviceStatus(),
    weather: {
      condition: 'Clear',
      temperature: 29,
      humidity: 41,
      wind: 8
    },
    gps: {
      label: 'Green Crest Reserve, Sector 14',
      lat: 6.9123,
      lng: 79.8731
    },
    aiPrediction: 'Fire probability remains low for the next 90 minutes.',
    aiConfidence: 92,
    cameraSnapshots: createSnapshots(),
    loading: true
  };
};

const buildAlert = (level: RiskLevel, title: string, message: string, zone: string): AlertItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  title,
  message,
  zone,
  level,
  time: 'just now'
});

const evolveDeviceStatus = (devices: DeviceStatus[]): DeviceStatus[] =>
  devices.map((device, index) => ({
    ...device,
    signal: clamp(device.signal + randomInt(-2, 2), 45, 100),
    latency: clamp(device.latency + randomInt(-3, 4), 5, 120),
    power: clamp(device.power + randomInt(-2, 1), 20, 100),
    state: index === 3 && Math.random() > 0.72 ? 'degraded' : device.state
  }));

export const advanceForestState = (state: ForestMonitorState): ForestMonitorState => {
  const nextTemperature = clamp(state.temperature + random(-0.8, 1.7), 18, 68);
  const nextSmoke = clamp(state.smoke + random(-0.7, 1.8), 4, 92);
  const fireActive = nextTemperature > 56 || nextSmoke > 68 || (state.fireStatus.active && Math.random() > 0.35);
  const nextRisk = deriveRisk(nextTemperature, nextSmoke, fireActive);
  const animalSpike = Math.random() > 0.63;
  const nextAnimalCount = Math.max(0, state.animalDetection.count + (animalSpike ? 1 : -1));
  const newAlertSource = animalSpike
    ? buildAlert('warning', 'Animal movement detected', 'Heat movement registered near the east trail.', 'Zone C')
    : fireActive && !state.fireStatus.active
      ? buildAlert('danger', 'Fire detected in Zone A', 'Rapid thermal rise indicates active ignition.', 'Zone A')
      : nextRisk === 'danger'
        ? buildAlert('danger', 'High temperature warning', 'Emergency cooling required in the hot zone.', 'Zone B')
        : null;
  const alerts = newAlertSource ? [newAlertSource, ...state.alerts].slice(0, 6) : state.alerts;
  const nextHistory = [...state.history.slice(-17), {
    label: nowLabel(),
    temperature: Number(nextTemperature.toFixed(1)),
    smoke: Number(nextSmoke.toFixed(1)),
    animals: Number(nextAnimalCount.toFixed(1)),
    fire: Number(clamp(nextSmoke + nextTemperature * 1.2, 8, 100).toFixed(1))
  }];

  return {
    ...state,
    temperature: Number(nextTemperature.toFixed(1)),
    smoke: Number(nextSmoke.toFixed(1)),
    fireRisk: nextRisk,
    fireStatus: {
      active: fireActive,
      zone: fireActive ? 'Zone A' : 'Zone B',
      updatedAt: nowLabel()
    },
    animalDetection: {
      count: nextAnimalCount,
      active: nextAnimalCount > 0,
      lastDetected: animalSpike ? nowLabel() : state.animalDetection.lastDetected,
      zones: animalSpike && !state.animalDetection.zones.includes('River Walk')
        ? ['North Ridge', 'Waterline', 'Trail Sector C', 'River Walk']
        : state.animalDetection.zones
    },
    activeSensors: state.activeSensors,
    battery: clamp(state.battery + random(-1.5, 0.6), 28, 100),
    solar: clamp(state.solar + random(-2, 1.7), 12, 100),
    online: Math.random() > 0.05,
    lastSync: nowLabel(),
    alerts,
    history: nextHistory,
    heatmap: createHeatmap(nextTemperature, nextRisk),
    deviceStatus: evolveDeviceStatus(state.deviceStatus),
    weather: {
      condition: nextTemperature > 40 ? 'Hot' : state.weather.condition,
      temperature: Number(clamp(state.weather.temperature + random(-0.4, 0.8), 22, 41).toFixed(1)),
      humidity: Number(clamp(state.weather.humidity + random(-1, 1), 20, 72).toFixed(1)),
      wind: Number(clamp(state.weather.wind + random(-1, 1.2), 1, 22).toFixed(1))
    },
    aiPrediction: fireActive
      ? 'AI predicts rapid escalation. Dispatch patrol and activate suppression protocol.'
      : animalSpike
        ? 'AI predicts wildlife activity near the river corridor within the next 30 minutes.'
        : 'AI predicts stable conditions with low fire probability for the near term.',
    aiConfidence: Number(clamp(state.aiConfidence + random(-3, 3), 82, 99).toFixed(0)),
    cameraSnapshots: animalSpike
      ? [
          { id: `${Date.now()}-snap`, label: 'Wildlife motion', capturedAt: nowLabel(), confidence: randomInt(84, 98), source: 'ESP32-CAM' },
          ...state.cameraSnapshots
        ].slice(0, 4)
      : state.cameraSnapshots
  };
};