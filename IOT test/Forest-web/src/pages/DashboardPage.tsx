import { FiAlertTriangle, FiBatteryCharging, FiDroplet, FiServer, FiThermometer, FiWind } from 'react-icons/fi';
import { useForestMonitor } from '@/state/ForestMonitorContext';
import { AnalyticsCharts, AlertsFeed, FireDangerCard, LocationCard, SensorStatusCard, ThermalHeatmap, WildlifeCard, WeatherWidget } from '@/components/dashboard';
import { SectionHeading, StatCard } from '@/components/ui';

export default function DashboardPage() {
  const { state, loading } = useForestMonitor();

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Command dashboard"
        subtitle="Live forest telemetry, alert intelligence, and wildlife monitoring all in one operational view."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Forest Temperature" value={`${state.temperature.toFixed(1)} C`} description="Realtime thermal average" icon={<FiThermometer />} accent="forest" />
        <StatCard title="Fire Risk Level" value={state.fireRisk.toUpperCase()} description="AI assessed ignition risk" icon={<FiAlertTriangle />} accent="ember" />
        <StatCard title="Animal Count" value={state.animalDetection.count} description="Heat movement detections" icon={<FiWind />} accent="sky" />
        <StatCard title="Active Sensors" value={state.activeSensors} description="ESP32 and thermal mesh" icon={<FiServer />} accent="forest" />
        <StatCard title="Smoke Level" value={`${state.smoke.toFixed(1)}%`} description="Atmospheric smoke index" icon={<FiDroplet />} accent="ember" />
        <StatCard title="Battery / Solar" value={`${Math.round((state.battery + state.solar) / 2)}%`} description="Power support system" icon={<FiBatteryCharging />} accent="sky" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <FireDangerCard fireRisk={state.fireRisk} fireStatus={state.fireStatus} />
        <ThermalHeatmap heatmap={state.heatmap} loading={loading} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <WildlifeCard animalDetection={state.animalDetection} />
        <AlertsFeed alerts={state.alerts} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <LocationCard gps={state.gps} />
        <SensorStatusCard deviceStatus={state.deviceStatus} />
      </div>

      <WeatherWidget weather={state.weather} />
      <AnalyticsCharts history={state.history} />
    </div>
  );
}