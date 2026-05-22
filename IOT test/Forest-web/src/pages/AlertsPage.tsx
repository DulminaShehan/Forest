import { motion } from 'framer-motion';
import { FiAlertTriangle, FiBell } from 'react-icons/fi';
import { useForestMonitor } from '@/state/ForestMonitorContext';
import { GlassPanel, SectionHeading, StatusPill } from '@/components/ui';

export default function AlertsPage() {
  const { state } = useForestMonitor();

  return (
    <div className="space-y-6">
      <SectionHeading title="Alert center" subtitle="Track fire warnings, thermal anomalies, and wildlife movement in one timeline." />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Risk summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Current alert posture</h3>
            </div>
            <div className="rounded-2xl bg-ember-500/15 p-3 text-ember-200">
              <FiAlertTriangle />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Fire condition</p>
              <p className="mt-2 text-3xl font-semibold text-white">{state.fireStatus.active ? 'Active' : 'Stable'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Total alerts</p>
              <p className="mt-2 text-3xl font-semibold text-white">{state.alerts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">AI confidence</p>
              <p className="mt-2 text-3xl font-semibold text-white">{state.aiConfidence}%</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live alert feed</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Recent events</h3>
            </div>
            <StatusPill label="Realtime" tone="online" />
          </div>
          <div className="space-y-3">
            {state.alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 ${alert.level === 'danger' ? 'border-rose-500/20 bg-rose-500/10' : 'border-amber-500/20 bg-amber-500/10'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-white">
                      <FiBell className={alert.level === 'danger' ? 'text-rose-200' : 'text-amber-200'} />
                      <span className="font-semibold">{alert.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{alert.message}</p>
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
      </div>
    </div>
  );
}