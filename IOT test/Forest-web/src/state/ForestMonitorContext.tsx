import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onValue, ref } from 'firebase/database';
import { toast } from 'react-toastify';
import { advanceForestState, createInitialForestState } from '@/data/mock';
import { getFirebaseDatabase, hasFirebaseConfig } from '@/services/firebase';
import type { ForestMonitorState, RiskLevel } from '@/types';

interface ForestMonitorContextValue {
  state: ForestMonitorState;
  statusLabel: string;
  online: boolean;
  loading: boolean;
}

const ForestMonitorContext = createContext<ForestMonitorContextValue | undefined>(undefined);

const riskForTemperature = (temperature: number): RiskLevel => {
  if (temperature > 58) return 'danger';
  if (temperature > 42) return 'warning';
  return 'safe';
};

const updateRiskFromSnapshot = (state: ForestMonitorState): ForestMonitorState => ({
  ...state,
  fireRisk: state.fireStatus.active ? 'danger' : riskForTemperature(state.temperature),
  heatmap: state.heatmap
});

export function ForestMonitorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ForestMonitorState>(() => createInitialForestState());
  const [loading, setLoading] = useState(true);
  const lastAlertId = useRef<string | null>(null);
  const database = useMemo(() => getFirebaseDatabase(), []);

  useEffect(() => {
    if (database && hasFirebaseConfig) {
      const paths = ['/forest/temperature', '/forest/fireStatus', '/forest/animalDetection', '/forest/smoke', '/forest/alerts'] as const;
      const unsubscribers = paths.map((path) =>
        onValue(ref(database, path), (snapshot) => {
          const value = snapshot.val();
          if (value === null || value === undefined) {
            return;
          }

          setState((current) => {
            const next = { ...current };

            if (path === '/forest/temperature' && typeof value === 'number') {
              next.temperature = value;
            }
            if (path === '/forest/smoke' && typeof value === 'number') {
              next.smoke = value;
            }
            if (path === '/forest/fireStatus' && typeof value === 'object') {
              next.fireStatus = {
                active: Boolean(value.active),
                zone: typeof value.zone === 'string' ? value.zone : current.fireStatus.zone,
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
            if (path === '/forest/animalDetection' && typeof value === 'object') {
              next.animalDetection = {
                count: typeof value.count === 'number' ? value.count : current.animalDetection.count,
                active: Boolean(value.active),
                lastDetected: typeof value.lastDetected === 'string' ? value.lastDetected : current.animalDetection.lastDetected,
                zones: Array.isArray(value.zones) ? value.zones.filter((item: unknown): item is string => typeof item === 'string') : current.animalDetection.zones
              };
            }
            if (path === '/forest/alerts' && Array.isArray(value)) {
              next.alerts = value.slice(0, 8).map((item) => ({
                id: String(item.id ?? `${Date.now()}`),
                title: String(item.title ?? 'Forest alert'),
                message: String(item.message ?? 'Realtime alert received.'),
                zone: String(item.zone ?? 'Unknown'),
                level: item.level === 'danger' || item.level === 'warning' ? item.level : 'safe',
                time: String(item.time ?? 'just now')
              }));
            }

            return updateRiskFromSnapshot({
              ...next,
              loading: false,
              online: true,
              lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              activeSensors: 5
            });
          });
        })
      );

      const readyTimer = window.setTimeout(() => setLoading(false), 800);

      return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
        window.clearTimeout(readyTimer);
      };
    }

    const interval = window.setInterval(() => {
      setState((current) => {
        const next = advanceForestState(current);
        if (next.alerts[0]?.id !== lastAlertId.current) {
          lastAlertId.current = next.alerts[0]?.id ?? null;
          const alert = next.alerts[0];
          if (alert) {
            const method = alert.level === 'danger' ? 'error' : alert.level === 'warning' ? 'warning' : 'info';
            toast[method](`${alert.title} - ${alert.zone}`, {
              position: 'top-right',
              autoClose: 2400,
              hideProgressBar: true,
              theme: 'dark'
            });
          }
        }
        return { ...next, loading: false };
      });
      setLoading(false);
    }, 2800);

    const readyTimer = window.setTimeout(() => setLoading(false), 900);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(readyTimer);
    };
  }, [database]);

  const value = useMemo<ForestMonitorContextValue>(
    () => ({
      state,
      statusLabel: state.online ? 'System online' : 'System offline',
      online: state.online,
      loading
    }),
    [loading, state]
  );

  return <ForestMonitorContext.Provider value={value}>{children}</ForestMonitorContext.Provider>;
}

export function useForestMonitor() {
  const context = useContext(ForestMonitorContext);
  if (!context) {
    throw new Error('useForestMonitor must be used inside ForestMonitorProvider');
  }
  return context;
}