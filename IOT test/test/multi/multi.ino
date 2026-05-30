#include "DHT.h"

// --- Analog Pins ---
#define MQ2_AO_PIN   34
#define MQ9_AO_PIN   35
#define RAIN_AO_PIN  32

// --- Digital Pins ---
#define MQ2_DO_PIN   25
#define MQ9_DO_PIN   33
#define RAIN_DO_PIN  26

// --- Other Pins ---
#define DHT11_PIN    27
#define BUZZER_PIN   18

// --- DHT11 Setup ---
#define DHTTYPE DHT11
DHT dht(DHT11_PIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  
  // Digital inputs
  pinMode(MQ2_DO_PIN, INPUT);
  pinMode(MQ9_DO_PIN, INPUT);
  pinMode(RAIN_DO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  
  dht.begin();
  
  Serial.println("System ready – reading both analog & digital.");
  delay(2000);
}

void loop() {
  // ----- 1. MQ-2 (smoke/combustible gas) -----
  int mq2_analog = analogRead(MQ2_AO_PIN);
  bool mq2_digital = digitalRead(MQ2_DO_PIN);   // LOW = gas detected (adjust pot)
  
  // ----- 2. MQ-9 (CO / methane) -----
  int mq9_analog = analogRead(MQ9_AO_PIN);
  bool mq9_digital = digitalRead(MQ9_DO_PIN);
  
  // ----- 3. Rain Sensor -----
  int rain_analog = analogRead(RAIN_AO_PIN);    // lower value = more water
  bool rain_digital = digitalRead(RAIN_DO_PIN); // LOW = rain detected (adjust pot)
  
  // ----- 4. Temperature & Humidity -----
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    temperature = -1;
    humidity = -1;
  }
  
  // ----- 5. Alarm logic (example) -----
  bool alarm = false;
  if (!mq2_digital || !mq9_digital) {   // if either digital gas sensor triggers
    alarm = true;
  }
  digitalWrite(BUZZER_PIN, alarm ? HIGH : LOW);
  
  // ----- 6. Print everything -----
  Serial.println("====== Sensor Report ======");
  Serial.print("MQ-2:  Analog="); Serial.print(mq2_analog);
  Serial.print("   Digital="); Serial.println(mq2_digital ? "SAFE" : "GAS!");
  
  Serial.print("MQ-9:  Analog="); Serial.print(mq9_analog);
  Serial.print("   Digital="); Serial.println(mq9_digital ? "SAFE" : "GAS!");
  
  Serial.print("Rain:  Analog="); Serial.print(rain_analog);
  Serial.print("   Digital="); Serial.println(rain_digital ? "DRY" : "WET!");
  
  Serial.print("Temp:  "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
  Serial.println("============================");
  
  delay(2000);
}