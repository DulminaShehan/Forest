#define MQ9_PIN 35


void setup() {
  Serial.begin(115200);
}

void loop() {
  int gasValue = analogRead(MQ9_PIN);

  Serial.print("MQ9 Value: ");
  Serial.println(gasValue);

  delay(500);
}