import React, { useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ThermalViewer({ pixels = [], minTemp, maxTemp }) {
  const html = useMemo(() => {
    const safePixels = pixels.length === 64 ? pixels : Array(64).fill(0);
    const serialized = JSON.stringify(safePixels);
    return `
      <html>
        <head>
          <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
          <style>body,html{margin:0;padding:0;background:#000;height:100%;width:100%;overflow:hidden;}</style>
        </head>
        <body>
          <canvas id="canvas" width="512" height="512"></canvas>
          <script>
            const pixels = ${serialized};
            function mapColor(value) {
              const v = Math.max(0, Math.min(1, (value - ${minTemp ?? 0}) / (${(maxTemp ?? 1) - (minTemp ?? 0)} || 1)));
              const blue = Math.max(0, 255 - Math.round(v * 255 * 1.3));
              const green = Math.max(0, Math.round(255 * Math.min(1, v * 2)));
              const red = Math.max(0, Math.round(255 * Math.max(0, (v - 0.5) * 2)));
              const whiteBlend = v > 0.95 ? Math.round((v - 0.95) / 0.05 * 255) : 0;
              return [
                Math.min(255, red + whiteBlend),
                Math.min(255, green + whiteBlend),
                Math.min(255, blue + whiteBlend),
                255,
              ];
            }
            function draw() {
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              const image = ctx.createImageData(8, 8);
              for (let y = 0; y < 8; y += 1) {
                for (let x = 0; x < 8; x += 1) {
                  const value = pixels[y * 8 + x] || 0;
                  const [r, g, b, a] = mapColor(value);
                  const index = (y * 8 + x) * 4;
                  image.data[index] = r;
                  image.data[index + 1] = g;
                  image.data[index + 2] = b;
                  image.data[index + 3] = a;
                }
              }
              const offscreen = document.createElement('canvas');
              offscreen.width = 8;
              offscreen.height = 8;
              const offCtx = offscreen.getContext('2d');
              offCtx.putImageData(image, 0, 0);
              ctx.imageSmoothingEnabled = true;
              ctx.drawImage(offscreen, 0, 0, 512, 512);
            }
            window.onload = draw;
          </script>
        </body>
      </html>
    `;
  }, [pixels, minTemp, maxTemp]);

  return (
    <View style={styles.wrapper}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
