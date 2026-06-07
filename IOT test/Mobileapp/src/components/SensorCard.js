import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function SensorCard({ label, value, unit }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value != null ? `${value}${unit || ''}` : 'N/A'}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#1e1e1e',
  },
  label: {
    color: '#c7c7c7',
    marginBottom: 4,
  },
  value: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
});
