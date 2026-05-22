import { FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { useForestMonitor } from '@/state/ForestMonitorContext';
import { AnalyticsCharts } from '@/components/dashboard';
import { GlassPanel, SectionHeading } from '@/components/ui';

export default function AnalyticsPage() {
  const { state } = useForestMonitor();

  return (
    <div className="space-y-6">
      <SectionHeading title="Analytics intelligence" subtitle="Trend analysis, AI forecasting, and incident history for operational planning." />
      <div className="grid gap-5 xl:grid-cols-3">
        <GlassPanel className="p-6">
          <div className="flex items-center gap-3 text-forest-200">
            <FiTrendingUp />
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Prediction panel</p>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-white">AI forecast</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">{state.aiPrediction}</p>
        </GlassPanel>
        <GlassPanel className="p-6">
          <div className="flex items-center gap-3 text-ember-200">
            <FiBarChart2 />
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Operational score</p>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-white">Forest resilience</h3>
          <p className="mt-4 text-4xl font-bold text-white">{Math.round(100 - state.smoke + state.battery / 2)}%</p>
          <p className="mt-2 text-sm text-slate-400">A blended indicator based on telemetry, power, and smoke.</p>
        </GlassPanel>
        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Latest sync</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{state.lastSync}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">Realtime updates are being ingested from Firebase when available or simulated locally when offline.</p>
        </GlassPanel>
      </div>
      <AnalyticsCharts history={state.history} />
    </div>
  );
}