import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';

export default function ConnectivityBanner({ connected, connectionType }) {
  return (
    <View style={styles.banner}>
      <Chip style={connected ? styles.online : styles.offline} textStyle={styles.chipText}>
        {connected ? 'Online' : 'Offline'}
      </Chip>
      <Text style={styles.text}>{connected ? `via ${connectionType}` : 'Cached data shown'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#151515',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  online: {
    backgroundColor: '#1b5e20',
  },
  offline: {
    backgroundColor: '#b71c1c',
  },
  chipText: {
    color: '#ffffff',
  },
  text: {
    color: '#c7c7c7',
  },
});
