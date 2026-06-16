import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, S } from '../theme';

export default function ConnectivityBanner({ connected, connectionType }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,   duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
    return () => pulse.stopAnimation();
  }, [connected]);

  const dotColor  = connected ? C.primary : C.alert;
  const typeLabel = connectionType && connectionType !== 'unknown' ? connectionType.toUpperCase() : null;

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity: connected ? pulse : 1 }]} />
        <Text style={[styles.status, { color: dotColor }]}>
          {connected ? 'Online' : 'Offline'}
        </Text>
        {typeLabel && (
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{typeLabel}</Text>
          </View>
        )}
      </View>
      {!connected && (
        <View style={styles.right}>
          <MaterialCommunityIcons name="database-clock-outline" size={14} color={C.textMuted} />
          <Text style={styles.cacheText}>Cached data</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingVertical: 10,
    backgroundColor: C.bgDeep,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
  },
  typePill: {
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  typeText: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cacheText: {
    fontSize: 12,
    color: C.textMuted,
  },
});
