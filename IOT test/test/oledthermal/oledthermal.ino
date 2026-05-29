#include <Wire.h>
#include <Adafruit_AMG88xx.h>

Adafruit_AMG88xx amg;

float pixels[64];

void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.begin(21, 22); // SDA, SCL

  Serial.println("AMG8833 Thermal Camera");

  bool status = amg.begin();

  if (!status) {
    Serial.println("Could not find AMG8833 sensor!");
    while (1);
  }

  Serial.println("AMG8833 Initialized!");
}

void loop() {

  // Read all 64 temperature values
  amg.readPixels(pixels);

  Serial.println("==== Thermal Image ====");

  for (int row = 0; row < 8; row++) {

    for (int col = 0; col < 8; col++) {

      float temp = pixels[row * 8 + col];

      Serial.print(temp);
      Serial.print(" C\t");
    }

    Serial.println();
  }

  // Find maximum temperature
  float maxTemp = pixels[0];

  for (int i = 1; i < 64; i++) {
    if (pixels[i] > maxTemp) {
      maxTemp = pixels[i];
    }
  }

  Serial.print("Max Temp: ");
  Serial.print(maxTemp);
  Serial.println(" C");

  Serial.println();

  delay(1000);
}