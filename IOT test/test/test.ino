#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <Adafruit_AMG88xx.h>

// ================= WIFI =================
#define WIFI_SSID "Dulmina"
#define WIFI_PASSWORD "dula1790"

// ================= FIREBASE =================
#define API_KEY "AIzaSyAFrR3ykHZf48g-JrjHfPkzqBzaCDOXdVs"
#define DATABASE_URL "https://forestmonitoringsystem-44d84-default-rtdb.asia-southeast1.firebasedatabase.app/"

// ================= OBJECTS =================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

Adafruit_AMG88xx amg;
float pixels[64];

void setup() {
  Serial.begin(115200);

  // ================= WIFI CONNECT =================
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nWiFi Connected!");

  // ================= FIREBASE SETUP =================
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // ================= AMG8833 INIT =================
  Wire.begin(21, 22);

  if (!amg.begin()) {
    Serial.println("AMG8833 NOT FOUND!");
    while (1);
  }

  Serial.println("AMG8833 Ready!");
}

void loop() {

  // ================= READ SENSOR =================
  amg.readPixels(pixels);

  float maxTemp = 0;

  // find hottest point
  for (int i = 0; i < 64; i++) {
    if (pixels[i] > maxTemp) {
      maxTemp = pixels[i];
    }
  }

  Serial.print("Max Temp: ");
  Serial.println(maxTemp);

  // ================= FIRE DETECTION LOGIC =================
  String fireStatus;

  if (maxTemp > 60) {
    fireStatus = "FIRE";
    Serial.println("🔥 FIRE DETECTED!");
  } else {
    fireStatus = "SAFE";
    Serial.println("✅ SAFE");
  }

  // ================= SEND TO FIREBASE =================

  if (Firebase.RTDB.setFloat(&fbdo, "/forest/maxTemperature", maxTemp)) {
    Serial.println("Temperature Sent");
  } else {
    Serial.println(fbdo.errorReason());
  }

  if (Firebase.RTDB.setString(&fbdo, "/forest/fireStatus", fireStatus)) {
    Serial.println("Fire Status Sent");
  } else {
    Serial.println(fbdo.errorReason());
  }

  delay(3000);
}