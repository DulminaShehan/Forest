#include <DHT.h>

#define DHTPIN           4
#define DHTTYPE          DHT22

#define RAIN_DIGITAL_PIN 27
#define RAIN_ANALOG_PIN  33

#define MQ2_ANALOG_PIN   34
#define MQ9_ANALOG_PIN   35

DHT dht(DHTPIN, DHTTYPE);

int averageRead(int pin) {
  long total = 0;

  for (int i = 0; i < 20; i++) {
    total += analogRead(pin);
    delay(5);
  }

  return total / 20;
}

void setup() {
  Serial.begin(115200);

  pinMode(RAIN_DIGITAL_PIN, INPUT);

  analogReadResolution(12);

  dht.begin();

  Serial.println("Sensor Test Started");
}

void loop() {

  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  int mq2  = averageRead(MQ2_ANALOG_PIN);
  int mq9  = averageRead(MQ9_ANALOG_PIN);
  int rain = averageRead(RAIN_ANALOG_PIN);

  bool rainDetected = digitalRead(RAIN_DIGITAL_PIN) == LOW;

  Serial.println("--------------------------------");

  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.println(" C");

  Serial.print("Humidity: ");
  Serial.print(hum);
  Serial.println(" %");

  Serial.print("MQ2 Value: ");
  Serial.println(mq2);

  Serial.print("MQ9 Value: ");
  Serial.println(mq9);

  Serial.print("Rain Analog: ");
  Serial.println(rain);

  Serial.print("Rain Status: ");

  if (rainDetected)
    Serial.println("RAIN DETECTED");
  else
    Serial.println("NO RAIN");

  delay(2000);
}