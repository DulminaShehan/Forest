#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// Display size
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// SPI Pins
#define OLED_MOSI 23
#define OLED_CLK  18
#define OLED_DC   2
#define OLED_CS   5
#define OLED_RESET 4

// SH1106 display
Adafruit_SH1106G display = Adafruit_SH1106G(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &SPI,
  OLED_DC,
  OLED_RESET,
  OLED_CS
);

void setup() {

  Serial.begin(115200);

  // Start display
  if(!display.begin(0, true)) {
    Serial.println("Display not found");
    while(1);
  }

  // Clear screen
  display.clearDisplay();

  // Text settings
  display.setTextSize(3);
  display.setTextColor(SH110X_WHITE);

  // Position
  display.setCursor(10, 20);

  // Print text
  display.println("HELLO");

  // Show on OLED
  display.display();
}

void loop() {

}