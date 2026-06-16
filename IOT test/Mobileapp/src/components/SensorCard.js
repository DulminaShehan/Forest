import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, R, S } from '../theme';

const CONFIG = {
  MQ2:         { icon: 'air-filter',      color: C.amber,   unit: 'ppm' },
  MQ9:         { icon: 'molecule-co',     color: '#FB923C', unit: 'ppm' },
  Rain:        { icon: 'weather-rainy',   color: C.info,    unit: ''    },
  Temperature: { icon: 'thermometer',     color: '#F87171', unit: '°C'  },
  Humidity:    { icon: 'water-percent',   color: '#67E8F9', unit: '%'   },
  Battery:     { icon: 'battery-80',      color: C.primary, unit: '%'   },
  Fire:        { icon: 'fire',            color: C.alert,   unit: ''    },
};

export default function SensorCard({ label, value, unit }) {
  const cfg = CONFIG[label] ?? { icon: 'gauge', color: C.primary, unit: unit ?? '' };
  const displayUnit = unit !== undefined ? unit : cfg.unit;
  const displayValue = value != null ? `${value}${displayUnit ? ' ' + displayUnit : ''}` : '—';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '20' }]}>
        <MaterialCommunityIcons name={cfg.icon} size={20} color={cfg.color} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Text style={[styles.value, { color: cfg.color }]} numberOfLines={1} adjustsFontSizeToFit>
        {displayValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.lg,
    padding: S.md,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
