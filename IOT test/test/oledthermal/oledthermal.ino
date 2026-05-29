#include <Wire.h>
#include <Adafruit_AMG88xx.h>

Adafruit_AMG88xx amg;

float pixels[64];

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!amg.begin()) {
    Serial.println("Sensor not found!");
    while (1);
  }

  Serial.println("Fire Detection System Started");
}

void loop() {

  amg.readPixels(pixels);

  float maxTemp = 0;
  int hotPixels = 0;

  for (int i = 0; i < 64; i++) {

    if (pixels[i] > maxTemp) {
      maxTemp = pixels[i];
    }

    // fire threshold
    if (pixels[i] > 45.0) {
      hotPixels++;
    }
  }

  Serial.print("Max Temp: ");
  Serial.println(maxTemp);

  Serial.print("Hot Pixels: ");
  Serial.println(hotPixels);

  // FIRE CONDITION
  if (maxTemp > 45.0 && hotPixels >= 3) {
    Serial.println("🔥 FIRE DETECTED!");
  }
  else if (maxTemp > 38.0) {
    Serial.println("⚠️ HIGH HEAT WARNING");
  }
  else {
    Serial.println("Normal");
  }

  delay(1000);
}