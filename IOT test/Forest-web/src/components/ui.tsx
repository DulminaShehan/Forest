import { motion } from 'framer-motion';
import { FiActivity } from 'react-icons/fi';
import type { ReactNode } from 'react';
import type { RiskLevel } from '@/types';

const panelClasses = 'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-glow';

export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${panelClasses} ${className}`.trim()}>{children}</div>;
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-forest-300/80">Monitoring intelligence</p>
      <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">{title}</h2>
      {subtitle ? <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">{subtitle}</p> : null}
    </div>
  );
}

export function StatusPill({ label, tone = 'safe' }: { label: string; tone?: RiskLevel | 'online' | 'offline' }) {
  const classes: Record<typeof tone, string> = {
    safe: 'bg-forest-500/15 text-forest-200 ring-forest-400/25',
    warning: 'bg-amber-500/15 text-amber-200 ring-amber-400/25',
    danger: 'bg-rose-500/15 text-rose-200 ring-rose-400/25',
    online: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25',
    offline: 'bg-slate-500/15 text-slate-200 ring-slate-400/25'
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ring-1 ${classes[tone]}`}>{label}</span>;
}

export function GlowButton({ children, href, onClick, subtle = false }: { children: ReactNode; href?: string; onClick?: () => void; subtle?: boolean }) {
  const base = subtle
    ? 'border border-white/10 bg-white/5 text-white hover:border-forest-400/30 hover:bg-forest-400/10'
    : 'bg-gradient-to-r from-forest-500 via-forest-400 to-ember-500 text-midnight-900 shadow-ember';
  const className = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${base}`;

  return href ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/8 ${className}`.trim()} />;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  accent = 'forest'
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  accent?: 'forest' | 'ember' | 'sky';
}) {
  const accentStyles: Record<typeof accent, string> = {
    forest: 'from-forest-500/20 to-forest-500/5 text-forest-200',
    ember: 'from-ember-500/20 to-ember-500/5 text-ember-200',
    sky: 'from-cyan-500/20 to-sky-500/5 text-cyan-200'
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentStyles[accent]}`}>
        {icon}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <FiActivity className="mt-1 text-lg text-forest-300/70 transition group-hover:rotate-12 group-hover:text-white" />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-400">{description}</p>
    </motion.div>
  );
}