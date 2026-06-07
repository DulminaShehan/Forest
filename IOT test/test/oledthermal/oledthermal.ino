#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_AMG88xx.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>   // only for JSON handling, but lightweight; if you don't have it, we can build raw string – I'll use raw string to avoid extra library

// ========== WiFi Credentials ==========
const char* ssid = "Dulmina";
const char* password = "dula1790";

// ========== Firebase REST API Configuration ==========
#define API_KEY "AIzaSyDfZW0VTLNs4w7RWhB_UQoDgu_EbXWBt8Q"
#define DATABASE_URL "https://esp32-3c0b8-default-rtdb.asia-southeast1.firebasedatabase.app"

// Global Firebase ID token (obtained after anonymous sign-in)
String idToken = "";

// ========== Sensor object ==========
Adafruit_AMG88xx amg;

float pixels[64];
float smoothedPixels[64];
float minTemp = 100.0;
float maxTemp = -100.0;

// ========== Fire Detection Config ==========
const float FIRE_TEMP_THRESHOLD = 50.0;
const float HOTSPOT_TEMP_THRESHOLD = 40.0;
const int MIN_FIRE_PIXELS = 3;

bool fireDetected = false;
bool hotspotDetected = false;
float maxDetectedTemp = 0.0;
int firePixelCount = 0;

struct FirePixel {
    int index;
    float temperature;
    int row;
    int col;
};
FirePixel firePixels[64];
int actualFireCount = 0;

// Smoothing filter
float smoothFilter(float newValue, float oldValue, float alpha = 0.3) {
    return oldValue * (1 - alpha) + newValue * alpha;
}

void checkForFire() {
    firePixelCount = 0;
    maxDetectedTemp = 0.0;
    actualFireCount = 0;
    for (int i = 0; i < 64; i++) {
        if (smoothedPixels[i] > maxDetectedTemp) maxDetectedTemp = smoothedPixels[i];
        if (smoothedPixels[i] >= FIRE_TEMP_THRESHOLD) {
            firePixels[actualFireCount].index = i;
            firePixels[actualFireCount].temperature = smoothedPixels[i];
            firePixels[actualFireCount].row = i / 8;
            firePixels[actualFireCount].col = i % 8;
            actualFireCount++;
            firePixelCount++;
        }
    }
    bool newFireDetected = (maxDetectedTemp >= FIRE_TEMP_THRESHOLD && firePixelCount >= MIN_FIRE_PIXELS);
    bool newHotspotDetected = (maxDetectedTemp >= HOTSPOT_TEMP_THRESHOLD && maxDetectedTemp < FIRE_TEMP_THRESHOLD);
    if (newFireDetected && !fireDetected) {
        fireDetected = true;
        triggerFireAlarm();
    } else if (!newFireDetected && fireDetected) fireDetected = false;
    if (newHotspotDetected && !hotspotDetected) {
        hotspotDetected = true;
        triggerHotspotAlert();
    } else if (!newHotspotDetected && hotspotDetected) hotspotDetected = false;
}

void triggerFireAlarm() {
    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║   🔥🔥🔥 FIRE DETECTED! 🔥🔥🔥        ║");
    Serial.println("╠════════════════════════════════════════╣");
    Serial.printf("║ Max Temperature: %.1f °C            ║\n", maxDetectedTemp);
    Serial.printf("║ Fire Pixels: %d                     ║\n", firePixelCount);
    Serial.println("╚════════════════════════════════════════╝");
    for (int i = 0; i < actualFireCount && i < 10; i++) {
        Serial.printf("  → Fire at pixel %d (Row %d, Col %d): %.1f °C\n",
                      firePixels[i].index, firePixels[i].row, firePixels[i].col, firePixels[i].temperature);
    }
}

void triggerHotspotAlert() {
    Serial.println("\n⚠️⚠️⚠️ HOTSPOT DETECTED ⚠️⚠️⚠️");
    Serial.printf("  Temperature: %.1f °C\n", maxDetectedTemp);
    Serial.printf("  Pixels affected: %d\n", firePixelCount);
}

// ========== Firebase Authentication (Anonymous Sign-in) ==========
bool firebaseSignIn() {
    WiFiClientSecure client;
    client.setInsecure(); // For testing; in production you should verify certificates
    HTTPClient http;
    String url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + String(API_KEY);
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    String body = "{\"returnSecureToken\":true}";
    int httpCode = http.POST(body);
    if (httpCode == 200) {
        String response = http.getString();
        // Parse JSON manually (avoid extra library) – find "idToken"
        int start = response.indexOf("\"idToken\":\"") + 11;
        int end = response.indexOf("\"", start);
        if (start > 10 && end > start) {
            idToken = response.substring(start, end);
            Serial.println("✅ Firebase anonymous sign-in successful");
            http.end();
            return true;
        }
    }
    Serial.printf("❌ Firebase sign-in failed, HTTP %d\n", httpCode);
    http.end();
    return false;
}

// ========== Send data to Firebase ==========
void sendToFirebase() {
    if (idToken.length() == 0) {
        Serial.println("No Firebase token, skipping send");
        return;
    }
    if (WiFi.status() != WL_CONNECTED) return;

    // Build JSON payload as a raw string (no ArduinoJson library needed)
    String timestamp = String(millis());
    String path = "/esp32/device02/" + timestamp + ".json?auth=" + idToken;
    String url = String(DATABASE_URL) + path;

    // Start building JSON
    String json = "{";
    json += "\"timestamp_ms\":" + String(millis()) + ",";
    json += "\"max_temp\":" + String(maxTemp) + ",";
    json += "\"min_temp\":" + String(minTemp) + ",";
    json += "\"avg_temp\":" + String((minTemp + maxTemp) / 2.0) + ",";
    json += "\"fire_detected\":" + String(fireDetected ? "true" : "false") + ",";
    json += "\"hotspot_detected\":" + String(hotspotDetected ? "true" : "false") + ",";
    json += "\"peak_temp\":" + String(maxDetectedTemp) + ",";
    json += "\"pixels\":[";
    for (int i = 0; i < 64; i++) {
        json += String(smoothedPixels[i]);
        if (i < 63) json += ",";
    }
    json += "]}";

    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.PUT(json);   // PUT creates/overwrites node
    if (httpCode == 200) {
        Serial.println("✅ Data sent to Firebase");
    } else {
        Serial.printf("❌ Firebase POST error: %d\n", httpCode);
        if (httpCode == 401) {
            Serial.println("Token expired, re-authenticating...");
            firebaseSignIn();   // try to get a new token
        }
    }
    http.end();

    // Also update "latest" node (overwrite)
    String latestPath = "/esp32/device02/latest.json?auth=" + idToken;
    String latestUrl = String(DATABASE_URL) + latestPath;
    http.begin(client, latestUrl);
    http.addHeader("Content-Type", "application/json");
    httpCode = http.PUT(json);
    if (httpCode == 200) {
        Serial.println("✅ Latest node updated");
    } else {
        Serial.printf("❌ Latest update failed: %d\n", httpCode);
    }
    http.end();
}

void setup() {
    Serial.begin(115200);
    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║   🔥 FIRE DETECTION THERMAL CAMERA    ║");
    Serial.println("║        + Firebase REST API            ║");
    Serial.println("╚════════════════════════════════════════╝\n");

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());

    // Authenticate with Firebase
    if (!firebaseSignIn()) {
        Serial.println("Failed to sign in to Firebase. Check API key.");
        while (1) delay(1000);
    }

    Wire.begin(21, 22);
    Serial.println("Initializing AMG8833 sensor...");
    if (!amg.begin()) {
        Serial.println("❌ AMG8833 not found! Check wiring.");
        while (1) delay(100);
    }
    Serial.println("✅ AMG8833 sensor initialized!");
    amg.setMovingAverageMode(true);
    for (int i = 0; i < 64; i++) smoothedPixels[i] = 25.0;

    Serial.println("🎯 Fire detection system is ACTIVE. Sending data to Firebase every 5 seconds.");
}

unsigned long lastFirebaseSend = 0;
const unsigned long FIREBASE_INTERVAL = 5000;

void loop() {
    amg.readPixels(pixels);
    for (int i = 0; i < 64; i++) {
        if (pixels[i] > -20 && pixels[i] < 100) {
            smoothedPixels[i] = smoothFilter(pixels[i], smoothedPixels[i], 0.2);
        }
    }

    minTemp = 100.0; maxTemp = -100.0;
    for (int i = 0; i < 64; i++) {
        if (smoothedPixels[i] < minTemp) minTemp = smoothedPixels[i];
        if (smoothedPixels[i] > maxTemp) maxTemp = smoothedPixels[i];
    }

    checkForFire();

    if (millis() - lastFirebaseSend >= FIREBASE_INTERVAL) {
        sendToFirebase();
        lastFirebaseSend = millis();
    }
    delay(10);
}