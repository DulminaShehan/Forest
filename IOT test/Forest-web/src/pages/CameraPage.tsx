import { FiCamera, FiMaximize2, FiSquare, FiZap } from 'react-icons/fi';
import { useForestMonitor } from '@/state/ForestMonitorContext';
import { CameraSnapshotGallery, FireDangerCard } from '@/components/dashboard';
import { GlassPanel, SectionHeading, StatusPill } from '@/components/ui';

export default function CameraPage() {
  const { state } = useForestMonitor();

  return (
    <div className="space-y-6">
      <SectionHeading title="Camera monitoring" subtitle="ESP32-CAM live feed, thermal preview, and AI labeled snapshots." />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassPanel className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">ESP32-CAM feed</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Live visual stream</h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill label="Live" tone="online" />
              <button type="button" className="rounded-full border border-white/10 bg-white/5 p-3 text-white">
                <FiMaximize2 />
              </button>
            </div>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(26,166,80,0.2),transparent_30%),linear-gradient(135deg,rgba(4,10,8,0.98),rgba(18,29,24,0.95))] p-5">
              <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-forest-400/25 bg-black/20 text-center">
                <div>
                  <FiCamera className="mx-auto text-4xl text-forest-200" />
                  <p className="mt-4 text-lg font-semibold text-white">Live camera feed</p>
                  <p className="mt-2 text-sm text-slate-400">Stream placeholder with crisp low-light overlay.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                <span className="inline-flex items-center gap-2"><FiZap className="text-ember-200" /> AI labels enabled</span>
                <span>1080p / 30fps</span>
              </div>
            </div>
            <div className="space-y-4">
              <FireDangerCard fireRisk={state.fireRisk} fireStatus={state.fireStatus} />
              <GlassPanel className="p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Thermal preview</p>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {Array.from({ length: 24 }, (_, index) => (
                    <div key={index} className={`aspect-square rounded-xl ${index % 4 === 0 ? 'bg-ember-500/45' : index % 3 === 0 ? 'bg-forest-500/35' : 'bg-white/8'}`} />
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">AI detection labels</p>
          <div className="mt-4 space-y-3">
            {['Wildlife motion', 'Hotspot bloom', 'Trail obstruction'].map((label, index) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{label}</span>
                  <StatusPill label={`${95 - index * 4}%`} tone={index === 0 ? 'online' : 'warning'} />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-forest-500 to-ember-500" style={{ width: `${92 - index * 6}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
      <CameraSnapshotGallery snapshots={state.cameraSnapshots} />
    </div>
  );
}