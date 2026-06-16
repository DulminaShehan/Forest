import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Vibration,
  TouchableOpacity,
  Animated,
  Share,
  StatusBar,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { LineChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';
import SensorCard from '../components/SensorCard';
import ConnectivityBanner from '../components/ConnectivityBanner';
import { AuthContext } from '../../App';
import {
  subscribeLiveData,
  subscribeLocations,
  fetchRecentHistory,
  fetchLatestData,
  cacheSnapshot,
  loadCachedSnapshot,
  sendSos,
} from '../utils/firebase';
import { formatRainStatus, batteryPercent, formatTimestamp, mapTemperatureToLabel } from '../utils/thermalUtils';
import { C, R, S } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - S.lg * 2 - S.md * 2;

// ── Section header ────────────────────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.header}>
        <MaterialCommunityIcons name={icon} size={16} color={C.primary} />
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap:   { marginBottom: S.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: S.sm + 2 },
  title:  { fontSize: 12, fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: 1 },
});

// ── Fire alert banner ─────────────────────────────────────────────────────────
function FireAlertBanner({ visible }) {
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shake, { toValue: 4,  duration: 80, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -4, duration: 80, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0,  duration: 80, useNativeDriver: true }),
          Animated.delay(2500),
        ])
      ).start();
    }
    return () => shake.stopAnimation();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[fireBannerStyles.banner, { transform: [{ translateX: shake }] }]}>
      <MaterialCommunityIcons name="fire" size={22} color={C.alert} />
      <View style={fireBannerStyles.textWrap}>
        <Text style={fireBannerStyles.title}>FIRE DETECTED</Text>
        <Text style={fireBannerStyles.sub}>Immediate action required</Text>
      </View>
      <View style={fireBannerStyles.pulse}>
        <MaterialCommunityIcons name="alert-circle" size={20} color={C.alert} />
      </View>
    </Animated.View>
  );
}

const fireBannerStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.alertSurface,
    borderWidth: 1.5,
    borderColor: C.alertDark,
    borderRadius: R.md,
    padding: S.md,
    marginBottom: S.md,
    gap: S.sm,
  },
  textWrap: { flex: 1 },
  title:    { color: C.alert, fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  sub:      { color: C.alert, opacity: 0.7, fontSize: 12, marginTop: 2 },
  pulse:    { opacity: 0.9 },
});

// ── Stat badge (last update / fire status) ────────────────────────────────────
function StatBadge({ icon, label, value, valueColor }) {
  return (
    <View style={badgeStyles.card}>
      <View style={badgeStyles.iconRow}>
        <MaterialCommunityIcons name={icon} size={14} color={C.textMuted} />
        <Text style={badgeStyles.label}>{label}</Text>
      </View>
      <Text style={[badgeStyles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  card:    { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.md, padding: S.md },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  label:   { fontSize: 11, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  value:   { fontSize: 16, fontWeight: '700', color: C.text },
});

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardScreen({ route }) {
  const { role } = route.params;
  const { user } = useContext(AuthContext);

  const [device01, setDevice01]             = useState(null);
  const [device02, setDevice02]             = useState(null);
  const [locations, setLocations]           = useState(null);
  const [history, setHistory]               = useState([]);
  const [connected, setConnected]           = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [refreshing, setRefreshing]         = useState(false);
  const [lastSeen, setLastSeen]             = useState(null);
  const [snackMsg, setSnackMsg]             = useState('');
  const [snackVisible, setSnackVisible]     = useState(false);

  const showMessage = msg => { setSnackMsg(msg); setSnackVisible(true); };

  useEffect(() => {
    const loadCache = async () => {
      const cache = await loadCachedSnapshot();
      if (cache) {
        setDevice01(cache.device01);
        setDevice02(cache.device02Latest);
        setLastSeen(cache.updatedAt ? new Date(cache.updatedAt) : null);
      }
    };

    const netUnsub = NetInfo.addEventListener(state => {
      setConnected(Boolean(state.isConnected));
      setConnectionType(state.type || 'unknown');
    });

    const liveUnsub = subscribeLiveData(async payload => {
      if (payload.device01)      setDevice01(payload.device01);
      if (payload.device02Latest) setDevice02(payload.device02Latest);
      const now = new Date();
      setLastSeen(now);
      await cacheSnapshot({
        device01:       payload.device01       || device01,
        device02Latest: payload.device02Latest || device02,
        updatedAt:      now.getTime(),
      });
    });

    const locUnsub = subscribeLocations(snap => setLocations(snap));

    const loadHistory = async () => {
      try {
        const result = await fetchRecentHistory(role === 'OFFICER' ? 7 : 1);
        setHistory(result);
      } catch { /* silent */ }
    };

    loadCache();
    if (role === 'OFFICER') loadHistory();

    return () => { liveUnsub(); locUnsub(); netUnsub(); };
  }, [role]);

  useEffect(() => {
    if (device02?.fire_detected) {
      Vibration.vibrate([0, 400, 200, 400], false);
      showMessage('🔥 Fire detected! Take immediate action.');
    }
  }, [device02?.fire_detected]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const latest = await fetchLatestData();
      if (latest.device01)       setDevice01(latest.device01);
      if (latest.device02Latest) setDevice02(latest.device02Latest);
      setLastSeen(new Date());
    } catch { showMessage('Refresh failed.'); }
    finally { setRefreshing(false); }
  };

  const handleExport = async () => {
    if (!history?.length) { showMessage('No historical data available yet.'); return; }
    const csv = [
      'timestamp,max_temp,min_temp,fire_detected,hotspot_detected,temperature,humidity,mq2,mq9,rain,battery',
      ...history.map(item => [
        item.timestamp ? new Date(item.timestamp).toISOString() : '',
        item.max_temp ?? '', item.min_temp ?? '',
        item.fire_detected ?? '', item.hotspot_detected ?? '',
        item.temp ?? '', item.humidity ?? '',
        item.mq2 ?? '', item.mq9 ?? '',
        item.rain ?? '', item.battery ?? '',
      ].join(',')),
    ].join('\n');
    try {
      await Share.share({ title: 'Forest IoT CSV Export', message: csv });
    } catch { showMessage('Export failed.'); }
  };

  const handleSendSos = async () => {
    try {
      await sendSos(user?.uid ?? 'anonymous', role);
      showMessage('SOS request sent successfully.');
    } catch { showMessage('Unable to send SOS. Check your connection.'); }
  };

  const rainStatus = formatRainStatus(device01?.rain);
  const battery    = batteryPercent(device01?.battery);
  const tempLabel  = mapTemperatureToLabel(device02?.max_temp);
  const fireOn     = Boolean(device02?.fire_detected);

  const chartData = useMemo(() => {
    if (!history?.length) return null;
    const pts = history.slice(-12);
    return {
      labels: pts.map(i => new Date(i.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [{ data: pts.map(i => i.max_temp ?? 0), color: () => C.amber, strokeWidth: 2 }],
    };
  }, [history]);

  const isOfficer = role === 'OFFICER';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />

      {/* ── Top bar ───────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <MaterialCommunityIcons name="tree" size={20} color={C.primary} />
          <Text style={styles.topTitle}>Forest IoT</Text>
        </View>
        <View style={[styles.roleBadge, isOfficer ? styles.roleBadgeOfficer : styles.roleBadgeHiker]}>
          <MaterialCommunityIcons
            name={isOfficer ? 'shield-account' : 'hiking'}
            size={12}
            color={isOfficer ? C.amber : C.primary}
          />
          <Text style={[styles.roleText, { color: isOfficer ? C.amber : C.primary }]}>
            {isOfficer ? 'Officer' : 'Hiker'}
          </Text>
        </View>
      </View>

      <ConnectivityBanner connected={connected} connectionType={connectionType} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Fire alert ────────────────────────── */}
        <FireAlertBanner visible={fireOn} />

        {/* ── Status badges ─────────────────────── */}
        <View style={styles.badgeRow}>
          <StatBadge
            icon="clock-outline"
            label="Last Update"
            value={formatTimestamp(lastSeen)}
          />
          <View style={styles.badgeGap} />
          <StatBadge
            icon={fireOn ? 'fire' : 'check-circle-outline'}
            label="Fire Status"
            value={fireOn ? 'ALERT' : 'Normal'}
            valueColor={fireOn ? C.alert : C.primary}
          />
        </View>

        {/* ── Environmental sensors ─────────────── */}
        <Section icon="leaf" title="Environmental">
          <View style={styles.grid}>
            <View style={styles.gridCell}><SensorCard label="MQ2"         value={device01?.mq2}      unit="ppm" /></View>
            <View style={styles.gridCell}><SensorCard label="MQ9"         value={device01?.mq9}      unit="ppm" /></View>
            <View style={styles.gridCell}><SensorCard label="Temperature" value={device01?.temp}     unit="°C"  /></View>
            <View style={styles.gridCell}><SensorCard label="Humidity"    value={device01?.humidity} unit="%"   /></View>
            <View style={styles.gridCell}><SensorCard label="Rain"        value={rainStatus}                    /></View>
            <View style={styles.gridCell}><SensorCard label="Battery"     value={battery != null ? `${battery}` : null} unit="%" /></View>
          </View>
        </Section>

        {/* ── Thermal camera ────────────────────── */}
        <Section icon="camera-iris" title="Thermal Camera">
          <View style={styles.thermalCard}>
            <View style={styles.grid}>
              <View style={styles.gridCell}>
                <View style={styles.thermalValueCard}>
                  <View style={[styles.thermalValueIcon, { backgroundColor: C.alert + '22' }]}>
                    <MaterialCommunityIcons name="thermometer-high" size={20} color={C.alert} />
                  </View>
                  <Text style={styles.thermalValueLabel}>Max Temp</Text>
                  <Text style={[styles.thermalValueNum, { color: C.alert }]}>
                    {device02?.max_temp != null ? `${device02.max_temp}°C` : '—'}
                  </Text>
                </View>
              </View>
              <View style={styles.gridCell}>
                <View style={styles.thermalValueCard}>
                  <View style={[styles.thermalValueIcon, { backgroundColor: C.info + '22' }]}>
                    <MaterialCommunityIcons name="thermometer-low" size={20} color={C.info} />
                  </View>
                  <Text style={styles.thermalValueLabel}>Min Temp</Text>
                  <Text style={[styles.thermalValueNum, { color: C.info }]}>
                    {device02?.min_temp != null ? `${device02.min_temp}°C` : '—'}
                  </Text>
                </View>
              </View>
              <View style={styles.gridCell}>
                <View style={[styles.thermalValueCard, device02?.hotspot_detected && styles.thermalValueCardAlert]}>
                  <View style={[styles.thermalValueIcon, { backgroundColor: (device02?.hotspot_detected ? C.alert : C.primary) + '22' }]}>
                    <MaterialCommunityIcons
                      name={device02?.hotspot_detected ? 'fire-alert' : 'check-circle-outline'}
                      size={20}
                      color={device02?.hotspot_detected ? C.alert : C.primary}
                    />
                  </View>
                  <Text style={styles.thermalValueLabel}>Hotspot</Text>
                  <Text style={[styles.thermalValueNum, { color: device02?.hotspot_detected ? C.alert : C.primary }]}>
                    {device02?.hotspot_detected ? 'Detected' : 'Clear'}
                  </Text>
                </View>
              </View>
              <View style={styles.gridCell}>
                <View style={styles.thermalValueCard}>
                  <View style={[styles.thermalValueIcon, { backgroundColor: C.amber + '22' }]}>
                    <MaterialCommunityIcons name="thermometer-lines" size={20} color={C.amber} />
                  </View>
                  <Text style={styles.thermalValueLabel}>Intensity</Text>
                  <Text style={[styles.thermalValueNum, { color: C.amber, fontSize: 14 }]}>
                    {tempLabel || '—'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Section>

        {/* ── Officer-only sections ─────────────── */}
        {isOfficer ? (
          <>
            <Section icon="chart-line" title="Historical Temperature">
              <View style={styles.card}>
                {chartData ? (
                  <LineChart
                    data={chartData}
                    width={CHART_W}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withShadow={false}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="chart-timeline-variant" size={32} color={C.textDim} />
                    <Text style={styles.emptyText}>No history available yet</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="file-export-outline" size={16} color={C.bgDeep} />
                  <Text style={styles.exportBtnText}>Export CSV</Text>
                </TouchableOpacity>
              </View>
            </Section>

            <Section icon="map-marker-multiple" title="Device Locations">
              <View style={styles.card}>
                {locations?.device01 || locations?.device02 ? (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude:      locations?.device01?.latitude  || locations?.device02?.latitude  || 37.78825,
                      longitude:     locations?.device01?.longitude || locations?.device02?.longitude || -122.4324,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                  >
                    {locations?.device01 && (
                      <Marker
                        coordinate={{ latitude: locations.device01.latitude, longitude: locations.device01.longitude }}
                        title="Device 01"
                        description="Gas + weather sensor"
                      />
                    )}
                    {locations?.device02 && (
                      <Marker
                        coordinate={{ latitude: locations.device02.latitude, longitude: locations.device02.longitude }}
                        title="Device 02"
                        description="Thermal camera"
                      />
                    )}
                  </MapView>
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="map-marker-off" size={32} color={C.textDim} />
                    <Text style={styles.emptyText}>Location data not configured</Text>
                  </View>
                )}
              </View>
            </Section>
          </>
        ) : (
          /* ── Hiker safety section ─────────────── */
          <Section icon="shield-alert" title="Hiker Safety">
            <View style={styles.card}>
              <View style={styles.safetyRow}>
                <View style={styles.safetyInfo}>
                  <Text style={styles.safetyTitle}>
                    {fireOn ? 'Danger — Leave Area' : 'Conditions look safe'}
                  </Text>
                  <Text style={styles.safetySub}>
                    {fireOn
                      ? 'Fire detected nearby. Send SOS or evacuate immediately.'
                      : 'No fire alerts. Tap SOS if you need emergency help.'}
                  </Text>
                </View>
                <View style={[styles.safetyDot, { backgroundColor: fireOn ? C.alertSurface : C.primaryDeep }]}>
                  <MaterialCommunityIcons
                    name={fireOn ? 'fire' : 'forest'}
                    size={28}
                    color={fireOn ? C.alert : C.primary}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.sosBtn} onPress={handleSendSos} activeOpacity={0.85}>
                <MaterialCommunityIcons name="alarm-light-outline" size={18} color={C.white} />
                <Text style={styles.sosBtnText}>Send SOS</Text>
              </TouchableOpacity>
            </View>
          </Section>
        )}
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4000}
        style={styles.snack}
      >
        {snackMsg}
      </Snackbar>
    </View>
  );
}

const chartConfig = {
  backgroundColor:         C.surface,
  backgroundGradientFrom:  C.surface,
  backgroundGradientTo:    C.surfaceHigh,
  decimalPlaces:           1,
  color:                   () => C.amber,
  labelColor:              () => C.textMuted,
  propsForDots:            { r: '3', strokeWidth: '2', stroke: C.amber },
  propsForBackgroundLines: { stroke: C.border },
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingTop: 48,
    paddingBottom: S.sm,
    backgroundColor: C.bgDeep,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.3,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.full,
    borderWidth: 1,
  },
  roleBadgeOfficer: {
    borderColor: C.amberDeep,
    backgroundColor: C.amberSurface,
  },
  roleBadgeHiker: {
    borderColor: C.primaryDeep,
    backgroundColor: '#0A1F0A',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Scroll */
  scroll:  { flex: 1 },
  content: { padding: S.md, paddingBottom: S.xl },

  /* Status badges */
  badgeRow: {
    flexDirection: 'row',
    marginBottom: S.lg,
  },
  badgeGap: { width: S.sm },

  /* Sensor grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  gridCell: {
    width: '48.5%',
  },

  /* Generic card */
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.lg,
    padding: S.md,
    overflow: 'hidden',
  },

  /* Chart */
  chart: {
    borderRadius: R.sm,
    marginLeft: -S.sm,
  },

  /* Export */
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: C.primaryBtn,
    borderRadius: R.md,
    height: 44,
    marginTop: S.md,
  },
  exportBtnText: {
    color: C.bgDeep,
    fontWeight: '700',
    fontSize: 14,
  },

  /* Map */
  map: {
    height: 240,
    borderRadius: R.md,
    overflow: 'hidden',
  },

  /* Thermal */
  thermalCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.lg,
    padding: S.md,
    overflow: 'hidden',
  },
  thermalValueCard: {
    flex: 1,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: S.sm + 2,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  thermalValueCardAlert: {
    borderColor: C.alertDark,
    backgroundColor: C.alertSurface,
  },
  thermalValueIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.xs,
  },
  thermalValueLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  thermalValueNum: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Hiker safety */
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    marginBottom: S.md,
  },
  safetyInfo:  { flex: 1 },
  safetyTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 5 },
  safetySub:   { fontSize: 13, color: C.textMuted, lineHeight: 18 },
  safetyDot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.alertDark,
    borderRadius: R.md,
    height: 50,
  },
  sosBtnText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: S.xl,
    gap: S.sm,
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 13,
  },

  snack: { backgroundColor: C.surfaceHigh },
});
