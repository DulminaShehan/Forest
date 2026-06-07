export function formatRainStatus(rawValue) {
  if (rawValue == null) {
    return 'Unknown';
  }
  return rawValue > 1800 ? 'Wet' : 'Dry';
}

export function batteryPercent(rawValue) {
  if (rawValue == null) {
    return null;
  }
  const percent = Math.round((rawValue / 4095) * 100);
  return Math.min(100, Math.max(0, percent));
}

export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Unknown';
  }
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleString();
}

export function mapTemperatureToLabel(temp) {
  if (temp == null) return 'N/A';
  if (temp >= 60) return 'Extreme';
  if (temp >= 45) return 'High';
  if (temp >= 30) return 'Warm';
  if (temp >= 15) return 'Mild';
  return 'Cool';
}
