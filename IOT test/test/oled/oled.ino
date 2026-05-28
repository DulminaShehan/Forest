#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// OLED SPI Pins
#define OLED_MOSI 23
#define OLED_CLK  18
#define OLED_DC   2
#define OLED_CS   5
#define OLED_RESET 4

Adafruit_SH1106G display = Adafruit_SH1106G(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &SPI,
  OLED_DC,
  OLED_RESET,
  OLED_CS
);

void drawEyes(int eyeX) {

  display.clearDisplay();

  // Left eye
  display.fillRoundRect(15, 15, 40, 30, 8, SH110X_WHITE);

  // Right eye
  display.fillRoundRect(73, 15, 40, 30, 8, SH110X_WHITE);

  // Pupils
  display.fillCircle(30 + eyeX, 30, 6, SH110X_BLACK);
  display.fillCircle(88 + eyeX, 30, 6, SH110X_BLACK);

  display.display();
}

void setup() {

  Serial.begin(115200);

  if(!display.begin(0, true)) {
    Serial.println("OLED failed");
    while(1);
  }
}

void loop() {

  // Look left
  drawEyes(-5);
  delay(500);

  // Look center
  drawEyes(0);
  delay(500);

  // Look right
  drawEyes(5);
  delay(500);
}