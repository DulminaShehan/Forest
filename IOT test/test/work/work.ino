#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// ================= WIFI =================
#define WIFI_SSID "Dulmina"
#define WIFI_PASSWORD "dula1790"

// ================= FIREBASE =================
#define API_KEY "AIzaSyDfZW0VTLNs4w7RWhB_UQoDgu_EbXWBt8Q"
#define DATABASE_URL "https://esp32-3c0b8-default-rtdb.asia-southeast1.firebasedatabase.app"

// ================= FIREBASE OBJECTS =================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ================= PINS =================
#define MQ2_PIN 36
#define MQ9_PIN 35
#define RAIN_PIN 32
#define VOLTAGE_PIN 34

#define DHT_PIN 4
#define DHTTYPE DHT22

DHT dht(DHT_PIN, DHTTYPE);

// ================= DEVICE ID =================
String deviceID = "device01";

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n🚀 System Starting...");

  // WiFi Connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("\n✔ WiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Firebase Config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Anonymous Sign Up
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✔ Firebase Auth Success");
  } else {
    Serial.printf("❌ Auth Error: %s\n",
                  config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("✔ Firebase Ready");

  // Sensors
  dht.begin();

  analogSetAttenuation(ADC_11db);

  Serial.println("⏳ MQ Sensors Warming Up...");
  delay(20000);

  Serial.println("✔ System Ready");
}

// ================= READ AVERAGE =================
int readAvg(int pin) {
  long sum = 0;

  for (int i = 0; i < 20; i++) {
    sum += analogRead(pin);
    delay(5);
  }

  return sum / 20;
}

// ================= LOOP =================
void loop() {

  int mq2 = readAvg(MQ2_PIN);
  int mq9 = readAvg(MQ9_PIN);
  int rain = readAvg(RAIN_PIN);

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  int battery = readAvg(VOLTAGE_PIN);

  if (isnan(temp)) temp = -1;
  if (isnan(hum)) hum = -1;

  Serial.println("\n==============================");
  Serial.print("MQ2      : "); Serial.println(mq2);
  Serial.print("MQ9      : "); Serial.println(mq9);
  Serial.print("Rain     : "); Serial.println(rain);
  Serial.print("Temp     : "); Serial.println(temp);
  Serial.print("Humidity : "); Serial.println(hum);
  Serial.print("Battery  : "); Serial.println(battery);
  Serial.println("==============================");

  // Firebase JSON
  FirebaseJson json;

  json.set("mq2", mq2);
  json.set("mq9", mq9);
  json.set("rain", rain);
  json.set("temp", temp);
  json.set("humidity", hum);
  json.set("battery", battery);

  String path = "/esp32/" + deviceID;

  Serial.println("📡 Sending Data...");

  if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
    Serial.println("✔ Data Uploaded");
  } else {
    Serial.print("❌ Upload Failed: ");
    Serial.println(fbdo.errorReason());
  }

  delay(3000);
}