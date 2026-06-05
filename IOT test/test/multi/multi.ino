#define MQ2_PIN 34
#define MQ9_PIN 35

#define RAIN_POWER_PIN 19
#define RAIN_AO_PIN 36

int readAvg(int pin) {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(pin);
    delay(5);
  }
  return sum / 10;
}

void setup() {
  Serial.begin(115200);

  pinMode(RAIN_POWER_PIN, OUTPUT);
  digitalWrite(RAIN_POWER_PIN, LOW);
}

void loop() {

  // Read MQ2
  int mq2 = readAvg(MQ2_PIN);

  // Read MQ9
  int mq9 = readAvg(MQ9_PIN);

  // Read Rain Sensor
  digitalWrite(RAIN_POWER_PIN, HIGH);
  delay(10);

  int rainValue = analogRead(RAIN_AO_PIN);

  digitalWrite(RAIN_POWER_PIN, LOW);

  int rainPercent = map(rainValue, 4095, 0, 0, 100);

  Serial.println("========== Sensor Data ==========");

  Serial.print("MQ2 Value: ");
  Serial.println(mq2);

  Serial.print("MQ9 Value: ");
  Serial.println(mq9);

  Serial.print("Rain Value: ");
  Serial.println(rainValue);

  Serial.print("Rain Percentage: ");
  Serial.print(rainPercent);
  Serial.println("%");

  if (rainPercent < 20) {
    Serial.println("Weather: Dry");
  }
  else if (rainPercent < 60) {
    Serial.println("Weather: Light Rain");
  }
  else {
    Serial.println("Weather: Heavy Rain");
  }

  Serial.println("---------------------------------");
  delay(1000);
}