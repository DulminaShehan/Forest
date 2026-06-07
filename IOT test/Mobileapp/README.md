# Forest IoT Mobile App

A React Native Expo mobile app for Government Officers and Hikers that reads live ESP32 data from Firebase Realtime Database.

## Features

- Firebase Authentication (email/password + anonymous)
- Role selection: Government Officer or Hiker
- Real-time data updates from Firebase Realtime Database
- Thermal camera viewer using WebView + HTML5 Canvas
- Fire alert UI with local vibration
- Officer historical graph, map view, CSV export
- Hiker simplified emergency view + SOS trigger
- Offline cache of last sensor snapshot

## Setup

1. Install dependencies:

```bash
cd "d:\Forest\IOT test\Mobileapp"
npm install
```

2. Install Expo CLI if needed:

```bash
npm install -g expo-cli
```

3. Configure Firebase:

- Open `firebaseConfig.js`
- Replace the placeholder values with your Firebase project settings
- Ensure `databaseURL` points to your Realtime Database

4. Start the app:

```bash
npm run start
```

5. Open on your phone or simulator via Expo Go.

## Firebase Structure

Use the following Realtime Database structure:

```text
esp32/
  device01/
    mq2
    mq9
    rain
    temp
    humidity
    battery
  device02/
    latest/
      pixels[]
      max_temp
      min_temp
      fire_detected
      hotspot_detected
    history/
      timestamped entries
  locations/
    device01/
      latitude
      longitude
    device02/
      latitude
      longitude
  alerts/
    sos/
```

## Notes

- For officer push notifications and SOS integration, use Firebase Cloud Messaging or a Firebase Cloud Function that converts DB alerts into push notifications.
- The thermal image uses a WebView to render a smooth canvas from the 64-pixel grid.
