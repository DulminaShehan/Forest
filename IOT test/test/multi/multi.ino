#define POWER_PIN 19
#define AO_PIN 36

void setup() {
  Serial.begin(115200);

  pinMode(POWER_PIN, OUTPUT);
  digitalWrite(POWER_PIN, LOW); // Sensor OFF initially
}

void loop() {
  digitalWrite(POWER_PIN, HIGH); // Turn sensor ON
  delay(10);

  int rainValue = analogRead(AO_PIN);

  digitalWrite(POWER_PIN, LOW); // Turn sensor OFF

  int rainPercent = map(rainValue, 4095, 0, 0, 100);

  Serial.print("Rain Value: ");
  Serial.print(rainValue);

  Serial.print(" | Rain Percentage: ");
  Serial.print(rainPercent);
  Serial.println("%");

  if (rainPercent < 20) {
    Serial.println("Status: No Rain");
  }
  else if (rainPercent < 60) {
    Serial.println("Status: Light Rain");
  }
  else {
    Serial.println("Status: Heavy Rain");
  }

  Serial.println("--------------------");
  delay(1000);
}