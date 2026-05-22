#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#define WIFI_SSID "Dulmina"
#define WIFI_PASSWORD "dula1790"

#define API_KEY "AIzaSyAFrR3ykHZf48g-JrjHfPkzqBzaCDOXdVs"
#define DATABASE_URL "https://forestmonitoringsystem-44d84-default-rtdb.asia-southeast1.firebasedatabase.app"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {

  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.println("Connected!");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {

  int temp = random(25, 60);

  if (Firebase.RTDB.setInt(&fbdo, "/forest/temperature", temp)) {
    Serial.println("Data Sent");
  }
  else {
    Serial.println("Failed");
    Serial.println(fbdo.errorReason());
  }

  delay(5000);
}