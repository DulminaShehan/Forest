import { useState } from 'react';
import { FiBell, FiCloud, FiLock, FiSliders, FiSmartphone, FiWifi } from 'react-icons/fi';
import { GlassPanel, SectionHeading, StatusPill } from '@/components/ui';

const toggles = [
  'Realtime alert toasts',
  'Night mode command view',
  'Wildlife silent mode',
  'Weather overlay panel'
];

export default function SettingsPage() {
  const [values, setValues] = useState({
    fireThreshold: 56,
    smokeThreshold: 68,
    wildlifeThreshold: 3
  });

  return (
    <div className="space-y-6">
      <SectionHeading title="System settings" subtitle="Tune alert thresholds, notification behaviors, and monitoring preferences." />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Security and sync</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Command center controls</h3>
            </div>
            <StatusPill label="Protected" tone="online" />
          </div>
          <div className="mt-5 space-y-4">
            {[
              { label: 'Firebase realtime sync', icon: FiCloud },
              { label: 'Device auth lock', icon: FiLock },
              { label: 'Mobile push alerts', icon: FiSmartphone },
              { label: 'Weather API overlay', icon: FiWifi }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="text-forest-200" />
                    <span className="font-medium text-white">{item.label}</span>
                  </div>
                  <StatusPill label="On" tone="online" />
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Threshold tuning</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Fire response parameters</h3>
            </div>
            <div className="rounded-2xl bg-ember-500/15 p-3 text-ember-200">
              <FiSliders />
            </div>
          </div>
          <div className="mt-6 space-y-5">
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Fire temperature threshold: {values.fireThreshold} C</span>
              <input type="range" min="40" max="70" value={values.fireThreshold} onChange={(event) => setValues({ ...values, fireThreshold: Number(event.target.value) })} className="w-full accent-forest-400" />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Smoke threshold: {values.smokeThreshold}%</span>
              <input type="range" min="20" max="95" value={values.smokeThreshold} onChange={(event) => setValues({ ...values, smokeThreshold: Number(event.target.value) })} className="w-full accent-ember-400" />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Wildlife trigger sensitivity: {values.wildlifeThreshold}</span>
              <input type="range" min="1" max="10" value={values.wildlifeThreshold} onChange={(event) => setValues({ ...values, wildlifeThreshold: Number(event.target.value) })} className="w-full accent-cyan-400" />
            </label>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {toggles.map((label) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-sm text-white">{label}</span>
                <div className="h-6 w-12 rounded-full bg-gradient-to-r from-forest-500 to-ember-500 p-1">
                  <div className="h-4 w-4 rounded-full bg-white translate-x-6 transition" />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
      <GlassPanel className="p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Notification channels</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <FiBell className="text-forest-200" />
            <p className="mt-3 text-white">Push notifications enabled</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <FiSmartphone className="text-cyan-200" />
            <p className="mt-3 text-white">Mobile escalation active</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <FiCloud className="text-ember-200" />
            <p className="mt-3 text-white">Firebase snapshot sync ready</p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}