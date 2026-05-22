import { motion } from 'framer-motion';
import { FiBell, FiCamera, FiDroplet, FiMapPin, FiThermometer, FiWifi, FiWind, FiZap } from 'react-icons/fi';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { GlassPanel, LoadingSkeleton, StatusPill } from '@/components/ui';
import type { AlertItem, CameraSnapshot, DeviceStatus, ForestMonitorState, HeatCell } from '@/types';

const chartTheme = {
  grid: 'rgba(255,255,255,0.08)',
  text: '#94a3b8',
  forest: '#31c86d',
  ember: '#ff7a22',
  cyan: '#5ee7ff'
};

export function ThermalHeatmap({ heatmap, loading }: { heatmap: HeatCell[]; loading?: boolean }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Thermal vision</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Real-time heatmap</h3>
        </div>
        <StatusPill label="AMG8833 live" tone="online" />
      </div>
      {loading ? (
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 48 }, (_, index) => (
            <LoadingSkeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-8 gap-2">
          {heatmap.map((cell) => {
            const glow = `rgba(255, ${Math.round(110 + cell.value)}, 34, ${(cell.value + 30) / 130})`;
            return (
              <motion.div
                key={`${cell.row}-${cell.column}`}
                whileHover={{ scale: 1.05 }}
                className="aspect-square rounded-xl border border-white/10"
                style={{ background: `radial-gradient(circle at 30% 30%, ${glow}, rgba(5,11,9,0.95))` }}
              />
            );
          })}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
        <span>Cool</span>
        <span>Warm</span>
        <span>Hot</span>
      </div>
    </GlassPanel>
  );
}

export function FireDangerCard({ fireStatus, fireRisk }: { fireStatus: ForestMonitorState['fireStatus']; fireRisk: ForestMonitorState['fireRisk'] }) {
  const palette: Record<ForestMonitorState['fireRisk'], string> = {
    safe: 'from-forest-500/15 to-forest-500/5 text-forest-200',
    warning: 'from-amber-500/20 to-amber-500/5 text-amber-200',
    danger: 'from-rose-500/25 to-ember-500/10 text-rose-100'
  };

  return (
    <GlassPanel className={`p-5 bg-gradient-to-br ${palette[fireRisk]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Fire risk engine</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">{fireStatus.active ? 'Active fire event' : 'No active fire'}</h3>
          <p className="mt-2 max-w-md text-sm text-white/80">
            {fireStatus.active
              ? `Immediate response is recommended in ${fireStatus.zone}. The danger model is elevated.`
              : 'Current conditions are stable. Risk will update continuously from realtime telemetry.'}
          </p>
        </div>
        <div className={`rounded-3xl p-4 ${fireStatus.active ? 'bg-ember-500/20 text-ember-100 animate-pulseGlow' : 'bg-forest-500/15 text-forest-100'}`}>
          <FiZap className="text-3xl" />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <StatusPill label={fireRisk} tone={fireRisk} />
        <span className="text-white/70">Zone: {fireStatus.zone}</span>
        <span className="text-white/50">Updated {fireStatus.updatedAt}</span>
      </div>
    </GlassPanel>
  );
}

export function WildlifeCard({ animalDetection }: { animalDetection: ForestMonitorState['animalDetection'] }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Wildlife motion</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Animal detection</h3>
        </div>
        <div className="rounded-2xl bg-forest-500/15 p-3 text-forest-200">
          <FiBell />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Heat movement count</p>
          <p className="mt-2 text-4xl font-bold text-white">{animalDetection.count}</p>
          <p className="mt-1 text-sm text-slate-300">Last detected at {animalDetection.lastDetected}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Detection zones</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {animalDetection.zones.map((zone) => (
              <span key={zone} className="rounded-full bg-forest-500/10 px-3 py-1 text-xs text-forest-100 ring-1 ring-forest-400/20">
                {zone}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function LocationCard({ gps }: { gps: ForestMonitorState['gps'] }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Forest location</p>
          <h3 className="mt-1 text-xl font-semibold text-white">GPS coverage</h3>
        </div>
        <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-200">
          <FiMapPin />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(26,166,80,0.18),transparent_35%),linear-gradient(135deg,rgba(6,18,14,0.96),rgba(15,25,21,0.92))] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Reserve label</p>
            <p className="mt-1 text-lg font-semibold text-white">{gps.label}</p>
          </div>
          <StatusPill label="Mapped" tone="online" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400">Latitude</p>
            <p className="mt-1 font-semibold text-white">{gps.lat.toFixed(4)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400">Longitude</p>
            <p className="mt-1 font-semibold text-white">{gps.lng.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function SensorStatusCard({ deviceStatus }: { deviceStatus: DeviceStatus[] }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Hardware mesh</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Sensor status</h3>
        </div>
        <div className="rounded-2xl bg-forest-500/15 p-3 text-forest-200">
          <FiWifi />
        </div>
      </div>
      <div className="space-y-3">
        {deviceStatus.map((device) => (
          <div key={device.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{device.name}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{device.id}</p>
              </div>
              <StatusPill label={device.state} tone={device.state === 'online' ? 'online' : 'warning'} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-slate-300">
              <div>
                <p className="text-slate-500">Signal</p>
                <p className="font-semibold text-white">{device.signal}%</p>
              </div>
              <div>
                <p className="text-slate-500">Latency</p>
                <p className="font-semibold text-white">{device.latency} ms</p>
              </div>
              <div>
                <p className="text-slate-500">Power</p>
                <p className="font-semibold text-white">{device.power}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export function WeatherWidget({ weather }: { weather: ForestMonitorState['weather'] }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Weather intelligence</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Current conditions</h3>
        </div>
        <div className="rounded-2xl bg-ember-500/15 p-3 text-ember-200">
          <FiWind />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Condition</p>
          <p className="mt-2 text-2xl font-semibold text-white">{weather.condition}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Temp</p>
          <p className="mt-2 text-2xl font-semibold text-white">{weather.temperature.toFixed(1)} C</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Humidity</p>
          <p className="mt-2 text-2xl font-semibold text-white">{weather.humidity.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Wind</p>
          <p className="mt-2 text-2xl font-semibold text-white">{weather.wind.toFixed(1)} km/h</p>
        </div>
      </div>
    </GlassPanel>
  );
}

export function AnalyticsCharts({ history }: { history: ForestMonitorState['history'] }) {
  const incidentData = history.map((point) => ({ label: point.label, incidents: Math.round(point.fire / 18) }));
  const animalData = history.map((point) => ({ label: point.label, activity: point.animals }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <GlassPanel className="p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Temperature history</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Forest temperature trend</h3>
          </div>
          <FiThermometer className="text-2xl text-ember-200" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="forestTemperature" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartTheme.forest} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={chartTheme.forest} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 6" />
              <XAxis dataKey="label" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} />
              <Tooltip contentStyle={{ background: '#071310', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="temperature" stroke={chartTheme.forest} fill="url(#forestTemperature)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
      <GlassPanel className="p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Fire incidents</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Risk event analysis</h3>
          </div>
          <FiZap className="text-2xl text-ember-200" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incidentData}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 6" />
              <XAxis dataKey="label" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} />
              <Tooltip contentStyle={{ background: '#071310', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="incidents" radius={[12, 12, 0, 0]}>
                {incidentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? chartTheme.ember : chartTheme.forest} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
      <GlassPanel className="p-5 xl:col-span-2">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Animal movement</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Wildlife activity chart</h3>
          </div>
          <FiCamera className="text-2xl text-cyan-200" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={animalData}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 6" />
              <XAxis dataKey="label" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} />
              <Tooltip contentStyle={{ background: '#071310', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="activity" stroke={chartTheme.cyan} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
    </div>
  );
}

export function AlertsFeed({ alerts }: { alerts: AlertItem[] }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live alerts</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Command notifications</h3>
        </div>
        <StatusPill label="Realtime" tone="online" />
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={`rounded-2xl border p-4 ${alert.level === 'danger' ? 'border-rose-500/20 bg-rose-500/10' : alert.level === 'warning' ? 'border-amber-500/20 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <FiBell className={alert.level === 'danger' ? 'text-rose-200' : 'text-ember-200'} />
                  <span className="font-semibold text-white">{alert.title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{alert.message}</p>
              </div>
              <StatusPill label={alert.level} tone={alert.level} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
              <span>{alert.zone}</span>
              <span>{alert.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

export function CameraSnapshotGallery({ snapshots }: { snapshots: CameraSnapshot[] }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Snapshot archive</p>
          <h3 className="mt-1 text-xl font-semibold text-white">AI tagged captures</h3>
        </div>
        <FiCamera className="text-2xl text-forest-200" />
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        {snapshots.map((snapshot) => (
          <div key={snapshot.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-32 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,rgba(26,166,80,0.28),transparent_35%),linear-gradient(135deg,rgba(5,11,9,0.98),rgba(16,32,27,0.95))] text-sm text-forest-100">
              {snapshot.source}
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-white">{snapshot.label}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{snapshot.capturedAt}</p>
              </div>
              <StatusPill label={`${snapshot.confidence}%`} tone={snapshot.confidence > 90 ? 'online' : 'warning'} />
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}