import { motion } from 'framer-motion';
import { FiArrowRight, FiCamera, FiCpu, FiEye, FiShield, FiThermometer, FiZap } from 'react-icons/fi';
import { GlowButton, GlassPanel, SectionHeading } from '@/components/ui';

const featureCards = [
  { title: 'Real-time thermal watch', description: 'AMG8833 heat sensing maps hotspots instantly across every forest sector.', icon: FiThermometer },
  { title: 'Fire early warning', description: 'AI signal fusion models smoke, heat, and temporal patterns to raise alerts early.', icon: FiZap },
  { title: 'Wildlife protection', description: 'Preserve animal corridors and detect movement without disturbing the habitat.', icon: FiEye },
  { title: 'ESP32 edge control', description: 'Low-power sensor nodes stream secure telemetry to the command center.', icon: FiCpu }
];

const steps = [
  'ESP32 nodes collect temperature, smoke, GPS, and thermal frames.',
  'Firebase Realtime Database streams data into the cloud dashboard.',
  'AI rules and live analytics classify fire risk and wildlife activity.',
  'Alerts are surfaced instantly to patrol teams and conservation staff.'
];

const landingStats = [
  { label: 'Zones covered', value: '18' },
  { label: 'Sensors online', value: '5' },
  { label: 'Reaction speed', value: '< 2s' },
  { label: 'Wildlife detections', value: '24h live' }
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-midnight-900 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(26,166,80,0.28),transparent_22%),radial-gradient(circle_at_80%_30%,rgba(255,91,15,0.22),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(94,231,255,0.10),transparent_24%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,11,9,0.85),rgba(3,11,9,0.98))]" />
      <div className="absolute inset-0 -z-10 bg-radial-dots bg-[size:18px_18px] opacity-20" />

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="font-display text-lg font-semibold">Forest Sentinel AI</p>
            <p className="text-xs tracking-[0.3em] text-forest-300/80">SMART FIRE AND WILDLIFE DEFENSE</p>
          </div>
          <div className="hidden gap-3 md:flex">
            <GlowButton subtle href="/dashboard">View Dashboard</GlowButton>
            <GlowButton href="#live">Live Monitoring <FiArrowRight /></GlowButton>
          </div>
        </header>

        <section className="grid items-center gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="inline-flex items-center gap-2 rounded-full border border-forest-400/20 bg-forest-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-forest-100">
                <FiShield /> AI Powered Smart Forest Protection
              </p>
              <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] text-white md:text-7xl">
                Futuristic monitoring for fire response and wildlife intelligence.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Track forest temperature in real time, detect ignition risks early, and protect wildlife with a command-center experience built for conservation teams and emergency response units.
              </p>
            </motion.div>
            <div className="flex flex-wrap gap-4">
              <GlowButton href="/dashboard">Live Monitoring <FiArrowRight /></GlowButton>
              <GlowButton subtle href="#features">Explore Features</GlowButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {landingStats.map((item) => (
                <GlassPanel key={item.label} className="p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                </GlassPanel>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-forest-500/30 via-transparent to-ember-500/30 blur-3xl animate-drift" />
            <GlassPanel className="relative overflow-hidden p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,34,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(26,166,80,0.2),transparent_25%)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Command preview</p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-white">Forest fire pulse map</h2>
                  </div>
                  <div className="rounded-2xl bg-ember-500/15 p-3 text-ember-200 shadow-ember">
                    <FiZap />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 16 }, (_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-2xl border border-white/10 ${index % 5 === 0 ? 'bg-ember-500/40' : index % 3 === 0 ? 'bg-forest-500/35' : 'bg-white/8'}`}
                    />
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <GlassPanel className="p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Temperature</p>
                    <p className="mt-2 text-3xl font-bold text-white">31.4 C</p>
                  </GlassPanel>
                  <GlassPanel className="p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fire risk</p>
                    <p className="mt-2 text-3xl font-bold text-ember-200">Safe</p>
                  </GlassPanel>
                  <GlassPanel className="p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Wildlife</p>
                    <p className="mt-2 text-3xl font-bold text-forest-200">Active</p>
                  </GlassPanel>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </section>

        <section id="features" className="py-8 md:py-12">
          <SectionHeading
            title="Features designed for a startup-level control room"
            subtitle="A polished monitoring experience with glassmorphism, live telemetry, and forest-first visual language."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <GlassPanel key={feature.title} className="p-5 transition duration-300 hover:-translate-y-1 hover:border-forest-400/30">
                  <div className="mb-4 inline-flex rounded-2xl bg-forest-500/15 p-3 text-forest-200">
                    <Icon />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{feature.description}</p>
                </GlassPanel>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-6">
            <SectionHeading title="How the system works" subtitle="From edge sensing to live response, every stage is designed for speed and clarity." />
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-500 to-ember-500 text-sm font-semibold text-midnight-900">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
          <div className="grid gap-5 md:grid-cols-2" id="live">
            <GlassPanel className="p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Real time detection</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Heatmap and fire events</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Monitor hot pixels, risk zones, and suppression triggers across the reserve.</p>
            </GlassPanel>
            <GlassPanel className="p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Wildlife protection</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Non-intrusive tracking</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Visualize movement while keeping patrol routes clear and habitat disruption low.</p>
            </GlassPanel>
            <GlassPanel className="p-6 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">AI monitoring</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Predictive alert synthesis</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                The dashboard combines temperature, smoke, camera labels, and GPS placement into a resilient AI-assisted monitoring layer with gentle but urgent visual cues.
              </p>
            </GlassPanel>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-400">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>AI Powered Smart Forest Fire and Wildlife Monitoring System</p>
            <p>Contact: forest-sentinel@example.com</p>
          </div>
        </footer>
      </div>
    </div>
  );
}