#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_AMG88xx.h>

// ---------------- AMG8833 ----------------
Adafruit_AMG88xx amg;
float pixels[64];

// ---------------- OLED ----------------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_DC 2
#define OLED_CS 5
#define OLED_RESET 4

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &SPI, OLED_DC, OLED_RESET, OLED_CS);

// ---------------- Thermal Grid ----------------
float grid[32][32];

// Adjust this based on your room
float minT = 28.0;
float maxT = 35.0;

// ---------------- FIXED LERP ----------------
float myLerp(float a, float b, float t) {
  return a + t * (b - a);
}

// Convert temp → brightness (0–255)
int getIntensity(float t) {
  t = constrain(t, minT, maxT);
  return map(t * 100, minT * 100, maxT * 100, 0, 255);
}

// ---------------- INTERPOLATION ----------------
void interpolate() {
  for (int y = 0; y < 32; y++) {
    for (int x = 0; x < 32; x++) {

      float gx = x / 4.0;
      float gy = y / 4.0;

      int x1 = (int)gx;
      int y1 = (int)gy;

      int x2 = min(x1 + 1, 7);
      int y2 = min(y1 + 1, 7);

      float fx = gx - x1;
      float fy = gy - y1;

      float v1 = pixels[y1 * 8 + x1];
      float v2 = pixels[y1 * 8 + x2];
      float v3 = pixels[y2 * 8 + x1];
      float v4 = pixels[y2 * 8 + x2];

      float i1 = myLerp(v1, v2, fx);
      float i2 = myLerp(v3, v4, fx);

      grid[y][x] = myLerp(i1, i2, fy);
    }
  }
}

// ---------------- DRAW THERMAL IMAGE ----------------
void drawThermal() {

  int scaleX = 4;
  int scaleY = 2;

  for (int y = 0; y < 32; y++) {
    for (int x = 0; x < 32; x++) {

      float temp = grid[y][x];
      int intensity = getIntensity(temp);

      uint16_t color;

      if (intensity < 80) color = BLACK;
      else if (intensity < 160) color = SSD1306_WHITE;
      else color = SSD1306_WHITE;

      display.fillRect(
        x * scaleX,
        y * scaleY,
        scaleX,
        scaleY,
        color
      );
    }
  }
}

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);

  // AMG8833 (I2C default SDA=21 SCL=22)
  if (!amg.begin()) {
    Serial.println("AMG8833 NOT FOUND");
    while (1);
  }

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println("OLED NOT FOUND");
    while (1);
  }

  display.clearDisplay();
  display.display();

  Serial.println("🔥 FLIR Thermal Camera Ready");
}

// ---------------- LOOP ----------------
void loop() {

  amg.readPixels(pixels);

  interpolate();

  display.clearDisplay();
  drawThermal();
  display.display();

  delay(100);
}