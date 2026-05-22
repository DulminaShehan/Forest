import { FiCpu, FiHardDrive, FiRadio, FiServer } from 'react-icons/fi';
import { useForestMonitor } from '@/state/ForestMonitorContext';
import { GlassPanel, SectionHeading, StatusPill } from '@/components/ui';

const summaries = [
  { title: 'ESP32 network', icon: FiServer },
  { title: 'Thermal sensor core', icon: FiCpu },
  { title: 'Camera module', icon: FiHardDrive },
  { title: 'Radio uplink', icon: FiRadio }
];

export default function DeviceStatusPage() {
  const { state } = useForestMonitor();

  return (
    <div className="space-y-6">
      <SectionHeading title="Device status" subtitle="Monitor sensor health, uplink quality, power support, and edge hardware availability." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item, index) => {
          const Icon = item.icon;
          return (
            <GlassPanel key={item.title} className="p-5">
              <div className="inline-flex rounded-2xl bg-forest-500/15 p-3 text-forest-200">
                <Icon />
              </div>
              <p className="mt-4 text-sm text-slate-400">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{index === 0 ? `${state.activeSensors} active` : index === 1 ? 'AMG8833 live' : index === 2 ? 'ESP32-CAM OK' : 'Strong'}</p>
            </GlassPanel>
          );
        })}
      </div>
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Hardware list</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Connected device mesh</h3>
          </div>
          <StatusPill label="Online" tone="online" />
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {state.deviceStatus.map((device) => (
            <div key={device.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{device.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">{device.id}</p>
                </div>
                <StatusPill label={device.state} tone={device.state === 'online' ? 'online' : 'warning'} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Signal</p>
                  <p className="mt-1 font-semibold text-white">{device.signal}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Latency</p>
                  <p className="mt-1 font-semibold text-white">{device.latency} ms</p>
                </div>
                <div>
                  <p className="text-slate-500">Power</p>
                  <p className="mt-1 font-semibold text-white">{device.power}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}