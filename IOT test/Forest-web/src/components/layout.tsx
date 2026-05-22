import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiAlertTriangle,
  FiCamera,
  FiChevronLeft,
  FiDatabase,
  FiGrid,
  FiMenu,
  FiSettings,
  FiShield,
  FiSun,
  FiMapPin
} from 'react-icons/fi';
import { GlassPanel, StatusPill } from '@/components/ui';
import { useForestMonitor } from '@/state/ForestMonitorContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/alerts', label: 'Alerts', icon: FiAlertTriangle },
  { to: '/analytics', label: 'Analytics', icon: FiActivity },
  { to: '/camera', label: 'Camera', icon: FiCamera },
  { to: '/devices', label: 'Devices', icon: FiDatabase },
  { to: '/settings', label: 'Settings', icon: FiSettings }
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
        <div>
          <p className="font-display text-lg font-semibold text-white">Forest Sentinel AI</p>
          <p className="text-xs tracking-[0.35em] text-forest-300/80">SMART PROTECTION GRID</p>
        </div>
        <div className="rounded-2xl bg-forest-500/15 p-3 text-forest-200 ring-1 ring-forest-400/20">
          <FiShield />
        </div>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition duration-300 ${active ? 'bg-forest-500/15 text-white ring-1 ring-forest-400/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon className={active ? 'text-forest-300' : 'text-slate-400'} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <GlassPanel className="mt-auto space-y-4 p-4">
        <div className="flex items-center gap-3">
          <StatusPill label="Live grid" tone="online" />
          <span className="text-xs text-slate-300">Realtime forest telemetry</span>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><FiMapPin className="text-forest-300" /> Reserve zone</span>
            <span>Sector 14</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><FiSun className="text-ember-300" /> Coverage</span>
            <span>96%</span>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { state, online, statusLabel } = useForestMonitor();

  return (
    <div className="min-h-screen bg-midnight-900 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(26,166,80,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,91,15,0.18),transparent_25%),linear-gradient(180deg,#030b09_0%,#071410_45%,#020607_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-80 border-r border-white/10 bg-midnight-900/70 backdrop-blur-2xl xl:block">
        <SidebarContent />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" />
          <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className="relative h-full w-80 bg-midnight-900/95 backdrop-blur-2xl">
            <div className="flex items-center justify-end p-4">
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full border border-white/10 bg-white/5 p-2 text-white">
                <FiChevronLeft />
              </button>
            </div>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </motion.aside>
        </div>
      ) : null}

      <div className="xl:pl-80">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-midnight-900/75 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white xl:hidden" onClick={() => setDrawerOpen(true)}>
                <FiMenu />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Forest intelligence command center</p>
                <h1 className="font-display text-xl font-semibold text-white md:text-2xl">{statusLabel}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill label={online ? 'online' : 'offline'} tone={online ? 'online' : 'offline'} />
              <GlassPanel className="hidden items-center gap-3 px-4 py-2 md:flex">
                <div className="rounded-2xl bg-ember-500/15 p-2 text-ember-200">
                  <FiAlertTriangle />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Latest sync</p>
                  <p className="text-sm text-white">{state.lastSync}</p>
                </div>
              </GlassPanel>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}