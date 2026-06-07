import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions, Vibration } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Chip, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { LineChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';
import { Share } from 'react-native';
import ThermalViewer from '../components/ThermalViewer';
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

const screenWidth = Dimensions.get('window').width - 32;

export default function DashboardScreen({ route }) {
  const { role } = route.params;
  const { user } = useContext(AuthContext);
  const [device01, setDevice01] = useState(null);
  const [device02, setDevice02] = useState(null);
  const [locations, setLocations] = useState(null);
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [refreshing, setRefreshing] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [message, setMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    let currentSnapshot = null;

    const loadCache = async () => {
      const cache = await loadCachedSnapshot();
      if (cache) {
        setDevice01(cache.device01);
        setDevice02(cache.device02Latest);
        setLastSeen(cache.updatedAt ? new Date(cache.updatedAt) : null);
      }
    };

    const networkUnsubscribe = NetInfo.addEventListener(state => {
      setConnected(Boolean(state.isConnected));
      setConnectionType(state.type || 'unknown');
    });

    const liveUnsubscribe = subscribeLiveData(async payload => {
      if (payload.device01) {
        setDevice01(payload.device01);
      }
      if (payload.device02Latest) {
        setDevice02(payload.device02Latest);
      }
      const now = new Date();
      setLastSeen(now);
      currentSnapshot = {
        device01: payload.device01 || device01,
        device02Latest: payload.device02Latest || device02,
        updatedAt: now.getTime(),
      };
      await cacheSnapshot(currentSnapshot);
    });

    const locationsUnsubscribe = subscribeLocations(snapshot => {
      setLocations(snapshot);
    });

    const loadHistory = async () => {
      try {
        const result = await fetchRecentHistory(role === 'OFFICER' ? 7 : 1);
        setHistory(result);
      } catch (error) {
        console.log('History load error', error);
      }
    };

    loadCache();
    if (role === 'OFFICER') {
      loadHistory();
    }

    return () => {
      liveUnsubscribe();
      locationsUnsubscribe();
      networkUnsubscribe();
    };
  }, [role]);

  useEffect(() => {
    if (device02?.fire_detected) {
      Vibration.vibrate([0, 400, 200, 400], false);
      setMessage('Fire detected!');
      setSnackbarVisible(true);
    }
  }, [device02?.fire_detected]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const latest = await fetchLatestData();
      if (latest.device01) setDevice01(latest.device01);
      if (latest.device02Latest) setDevice02(latest.device02Latest);
      setLastSeen(new Date());
    } catch (error) {
      showMessage('Refresh failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    if (!history || !history.length) {
      showMessage('No historical data available yet.');
      return;
    }
    const csvRows = [
      'timestamp,max_temp,min_temp,fire_detected,hotspot_detected,temperature,humidity,mq2,mq9,rain,battery',
      ...history.map(item => {
        const date = item.timestamp ? new Date(item.timestamp).toISOString() : '';
        return [
          date,
          item.max_temp ?? '',
          item.min_temp ?? '',
          item.fire_detected ?? '',
          item.hotspot_detected ?? '',
          item.temp ?? '',
          item.humidity ?? '',
          item.mq2 ?? '',
          item.mq9 ?? '',
          item.rain ?? '',
          item.battery ?? '',
        ].join(',');
      }),
    ].join('\n');

    try {
      await Share.share({
        title: 'Forest IoT CSV Export',
        message: csvRows,
      });
    } catch (error) {
      showMessage('Export failed.');
    }
  };

  const handleSendSos = async () => {
    try {
      await sendSos(user?.uid ?? 'anonymous', role);
      showMessage('SOS request sent successfully.');
    } catch (error) {
      showMessage('Unable to send SOS.');
    }
  };

  const showMessage = text => {
    setMessage(text);
    setSnackbarVisible(true);
  };

  const rainStatus = formatRainStatus(device01?.rain);
  const battery = batteryPercent(device01?.battery);
  const tempLabel = mapTemperatureToLabel(device02?.max_temp);

  const chartData = useMemo(() => {
    if (!history || !history.length) {
      return null;
    }
    const points = history.slice(-12);
    return {
      labels: points.map(item => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [
        {
          data: points.map(item => item.max_temp ?? 0),
          color: () => '#ff9f00',
          strokeWidth: 2,
        },
      ],
    };
  }, [history]);

  return (
    <View style={styles.fullScreen}>
      <ConnectivityBanner connected={connected} connectionType={connectionType} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Title style={styles.title}>Live Forest IoT Dashboard</Title>
        <Paragraph style={styles.subtitle}>
          Role: {role === 'OFFICER' ? 'Government Officer' : 'Hiker'}
        </Paragraph>

        <View style={styles.sectionRow}>
          <Card style={styles.smallCard}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Last update</Text>
              <Title>{formatTimestamp(lastSeen)}</Title>
            </Card.Content>
          </Card>
          <Card style={styles.smallCard}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Fire status</Text>
              <Title style={device02?.fire_detected ? styles.alertText : styles.okText}>
                {device02?.fire_detected ? 'ALERT' : 'Normal'}
              </Title>
            </Card.Content>
          </Card>
        </View>

        <SensorCard label="MQ2" value={device01?.mq2} unit="ppm" />
        <SensorCard label="MQ9" value={device01?.mq9} unit="ppm" />
        <SensorCard label="Rain" value={rainStatus} />
        <SensorCard label="Temperature" value={device01?.temp} unit="°C" />
        <SensorCard label="Humidity" value={device01?.humidity} unit="%" />
        <SensorCard label="Battery" value={battery != null ? `${battery}%` : 'Unknown'} />

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Thermal Camera</Title>
            <Paragraph style={styles.cardSubtitle}>8x8 thermal grid rendered as a smooth 512x512 view.</Paragraph>
            <ThermalViewer pixels={device02?.pixels || []} minTemp={device02?.min_temp} maxTemp={device02?.max_temp} />
            <View style={styles.thermalMetaRow}>
              <Chip style={styles.chip}>Max {device02?.max_temp ?? 'N/A'}°C</Chip>
              <Chip style={styles.chip}>Min {device02?.min_temp ?? 'N/A'}°C</Chip>
              <Chip style={styles.chip}>{device02?.hotspot_detected ? 'Hotspot' : 'No hotspot'}</Chip>
            </View>
            <Paragraph style={styles.subtitle}>Thermal intensity: {tempLabel}</Paragraph>
          </Card.Content>
        </Card>

        {role === 'OFFICER' ? (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Historical Temperature</Title>
                {chartData ? (
                  <LineChart
                    data={chartData}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <Paragraph>No history available yet.</Paragraph>
                )}
                <Button mode="contained" onPress={handleExport} style={styles.actionButton}>
                  Export CSV
                </Button>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Device Locations</Title>
                {locations?.device01 || locations?.device02 ? (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: locations?.device01?.latitude || locations?.device02?.latitude || 37.78825,
                      longitude: locations?.device01?.longitude || locations?.device02?.longitude || -122.4324,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                  >
                    {locations?.device01 ? (
                      <Marker
                        coordinate={{
                          latitude: locations.device01.latitude,
                          longitude: locations.device01.longitude,
                        }}
                        title="Device 01"
                        description="Gas + weather sensor"
                      />
                    ) : null}
                    {locations?.device02 ? (
                      <Marker
                        coordinate={{
                          latitude: locations.device02.latitude,
                          longitude: locations.device02.longitude,
                        }}
                        title="Device 02"
                        description="Thermal camera"
                      />
                    ) : null}
                  </MapView>
                ) : (
                  <Paragraph>Location data not configured.</Paragraph>
                )}
              </Card.Content>
            </Card>
          </>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Hiker Safety</Title>
              <Paragraph>Only the essential conditions are shown for quick decision-making.</Paragraph>
              <Button mode="contained" onPress={handleSendSos} style={styles.actionButton}>
                Send SOS
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={4000}>
        {message}
      </Snackbar>
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#121212',
  backgroundGradientFrom: '#121212',
  backgroundGradientTo: '#232323',
  decimalPlaces: 1,
  color: () => '#ffb703',
  labelColor: () => '#ffffff',
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#ffb703',
  },
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#c7c7c7',
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  smallCard: {
    flex: 1,
    marginBottom: 12,
    backgroundColor: '#1e1e1e',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
  },
  cardTitle: {
    color: '#ffffff',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#c7c7c7',
    marginBottom: 12,
  },
  thermalMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    marginTop: 8,
    backgroundColor: '#2a2a2a',
  },
  actionButton: {
    marginTop: 14,
  },
  map: {
    height: 240,
    marginTop: 12,
  },
  alertText: {
    color: '#ff4d4d',
  },
  okText: {
    color: '#8be9fd',
  },
});
