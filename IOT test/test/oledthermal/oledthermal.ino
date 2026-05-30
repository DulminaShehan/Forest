#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_AMG88xx.h>
#include <WebServer.h>

const char* ssid = "Dulmina";
const char* password = "dula1790";

WebServer server(80);
Adafruit_AMG88xx amg;

float pixels[64];
float smoothedPixels[64];
float minTemp = 100.0;
float maxTemp = -100.0;

// ========== FIRE DETECTION CONFIGURATION ==========
const float FIRE_TEMP_THRESHOLD = 50.0;    // Temperature threshold for fire detection (°C)
const float HOTSPOT_TEMP_THRESHOLD = 40.0; // Lower threshold for hotspot warning (°C)
const int MIN_FIRE_PIXELS = 3;              // Minimum number of pixels above threshold to trigger alarm
const int DETECTION_COOLDOWN = 5000;        // Cooldown between alarm triggers (milliseconds)

bool fireDetected = false;
bool hotspotDetected = false;
unsigned long lastAlarmTime = 0;
float maxDetectedTemp = 0.0;
int firePixelCount = 0;

// Store fire locations
struct FirePixel {
    int index;
    float temperature;
    int row;
    int col;
};
FirePixel firePixels[64];
int actualFireCount = 0;

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>FLIR Thermal Camera - Fire Detection</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            background: rgba(0,0,0,0.8);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        h1 {
            text-align: center;
            color: #fff;
            margin-bottom: 10px;
            font-size: 24px;
            letter-spacing: 2px;
        }
        
        .subtitle {
            text-align: center;
            color: #888;
            margin-bottom: 20px;
            font-size: 12px;
        }
        
        .thermal-container {
            position: relative;
            display: inline-block;
        }
        
        canvas {
            display: block;
            margin: 0 auto;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            cursor: crosshair;
        }
        
        .info-panel {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .info-card {
            background: rgba(0,0,0,0.6);
            border-radius: 10px;
            padding: 15px;
            flex: 1;
            min-width: 120px;
            border-left: 3px solid #ff6b35;
        }
        
        .info-label {
            color: #888;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-value {
            color: #ff6b35;
            font-size: 28px;
            font-weight: bold;
            margin-top: 5px;
        }
        
        .temp-bar {
            margin-top: 20px;
            background: linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000);
            height: 20px;
            border-radius: 10px;
            position: relative;
        }
        
        .temp-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            color: #888;
            font-size: 10px;
        }
        
        .crosshair-temp {
            position: absolute;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            font-family: monospace;
            border: 1px solid #ff6b35;
        }
        
        /* Fire Alert Styles */
        .alert-container {
            margin-top: 20px;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            animation: pulse 1s infinite;
        }
        
        .fire-alert {
            background: linear-gradient(135deg, #ff0000, #cc0000);
            border: 2px solid #ffaa00;
            box-shadow: 0 0 20px rgba(255,0,0,0.5);
        }
        
        .hotspot-alert {
            background: linear-gradient(135deg, #ff8800, #cc6600);
            border: 2px solid #ffcc00;
        }
        
        .safe-alert {
            background: linear-gradient(135deg, #00aa44, #008833);
        }
        
        .alert-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .alert-message {
            font-size: 14px;
        }
        
        .alert-temp {
            font-size: 32px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.85; }
            100% { opacity: 1; }
        }
        
        @media (max-width: 600px) {
            .info-value { font-size: 20px; }
            .info-label { font-size: 10px; }
            h1 { font-size: 18px; }
            .alert-title { font-size: 18px; }
            .alert-temp { font-size: 24px; }
        }
    </style>
</head>
<body>
<div class="container">
    <h1>🔥 FLIR Thermal Camera</h1>
    <div class="subtitle">ESP32 + AMG8833 | Fire & Hotspot Detection System</div>
    
    <div class="thermal-container">
        <canvas id="thermalCanvas" width="512" height="512"></canvas>
        <div id="crosshairTemp" class="crosshair-temp" style="display: none;"></div>
    </div>
    
    <div class="info-panel">
        <div class="info-card">
            <div class="info-label">Max Temperature</div>
            <div class="info-value" id="maxTemp">--.- °C</div>
        </div>
        <div class="info-card">
            <div class="info-label">Min Temperature</div>
            <div class="info-value" id="minTemp">--.- °C</div>
        </div>
        <div class="info-card">
            <div class="info-label">Average Temperature</div>
            <div class="info-value" id="avgTemp">--.- °C</div>
        </div>
        <div class="info-card">
            <div class="info-label">Center Temp</div>
            <div class="info-value" id="centerTemp">--.- °C</div>
        </div>
    </div>
    
    <div id="alertBox" class="alert-container safe-alert">
        <div class="alert-title">🟢 SYSTEM NORMAL</div>
        <div class="alert-message">No abnormal heat detected</div>
        <div class="alert-temp" id="alertTemp">--.- °C</div>
    </div>
    
    <div class="temp-bar"></div>
    <div class="temp-labels">
        <span>Cold (25°C)</span>
        <span>Warm (35°C)</span>
        <span>Hot (45°C+)</span>
        <span style="color:#ff0000">🔥 FIRE (>50°C)</span>
    </div>
</div>

<script>
    const canvas = document.getElementById("thermalCanvas");
    const ctx = canvas.getContext("2d");
    const crosshairDiv = document.getElementById("crosshairTemp");
    
    let currentData = [];
    let fireStatus = {
        detected: false,
        hotspot: false,
        maxTemp: 0,
        pixelCount: 0
    };
    
    // Enhanced color mapping with fire indication
    function getThermalColor(temp, minT, maxT) {
        // Fire threshold highlight
        if (temp >= 50) {
            return `rgb(255, 255, 255)`; // Pure white for fire
        }
        if (temp >= 45) {
            return `rgb(255, 255, 100)`; // Yellow-white for extreme heat
        }
        
        let t = (temp - minT) / (maxT - minT);
        t = Math.min(1, Math.max(0, t));
        
        let r, g, b;
        
        if (t < 0.125) {
            r = 0;
            g = 0;
            b = 255;
        } else if (t < 0.25) {
            let p = (t - 0.125) / 0.125;
            r = 0;
            g = 255 * p;
            b = 255;
        } else if (t < 0.375) {
            let p = (t - 0.25) / 0.125;
            r = 0;
            g = 255;
            b = 255 - 255 * p;
        } else if (t < 0.5) {
            let p = (t - 0.375) / 0.125;
            r = 255 * p;
            g = 255;
            b = 0;
        } else if (t < 0.625) {
            let p = (t - 0.5) / 0.125;
            r = 255;
            g = 255;
            b = 255 * p;
        } else if (t < 0.75) {
            let p = (t - 0.625) / 0.125;
            r = 255;
            g = 255 - 128 * p;
            b = 0;
        } else if (t < 0.875) {
            let p = (t - 0.75) / 0.125;
            r = 255;
            g = 127 - 127 * p;
            b = 0;
        } else {
            let p = (t - 0.875) / 0.125;
            r = 255;
            g = 255 * p;
            b = 255 * p;
        }
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    function bilinearInterpolate(data, x, y, size) {
        const x1 = Math.floor(x);
        const y1 = Math.floor(y);
        const x2 = Math.min(x1 + 1, size - 1);
        const y2 = Math.min(y1 + 1, size - 1);
        
        const q11 = data[y1 * size + x1];
        const q21 = data[y1 * size + x2];
        const q12 = data[y2 * size + x1];
        const q22 = data[y2 * size + x2];
        
        const fx = x - x1;
        const fy = y - y1;
        
        const top = q11 * (1 - fx) + q21 * fx;
        const bottom = q12 * (1 - fx) + q22 * fx;
        
        return top * (1 - fy) + bottom * fy;
    }
    
    function drawThermalImage(data, minT, maxT) {
        if (!data || data.length !== 64) return;
        
        const canvasSize = 512;
        const gridSize = 8;
        const pixelSize = canvasSize / gridSize;
        
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        for (let y = 0; y < canvasSize; y++) {
            for (let x = 0; x < canvasSize; x++) {
                const gridX = (x / canvasSize) * gridSize;
                const gridY = (y / canvasSize) * gridSize;
                let temp = bilinearInterpolate(data, gridX, gridY, gridSize);
                const color = getThermalColor(temp, minT, maxT);
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridSize; i++) {
            ctx.moveTo(i * pixelSize, 0);
            ctx.lineTo(i * pixelSize, canvasSize);
            ctx.moveTo(0, i * pixelSize);
            ctx.lineTo(canvasSize, i * pixelSize);
            ctx.stroke();
        }
    }
    
    function updateStats(data) {
        if (!data || data.length === 0) return;
        
        const maxT = Math.max(...data);
        const minT = Math.min(...data);
        const avgT = data.reduce((a, b) => a + b, 0) / data.length;
        const centerT = data[27];
        
        document.getElementById("maxTemp").innerHTML = maxT.toFixed(1) + " °C";
        document.getElementById("minTemp").innerHTML = minT.toFixed(1) + " °C";
        document.getElementById("avgTemp").innerHTML = avgT.toFixed(1) + " °C";
        document.getElementById("centerTemp").innerHTML = centerT.toFixed(1) + " °C";
        
        // Update alert based on fire detection
        const alertBox = document.getElementById("alertBox");
        const alertTemp = document.getElementById("alertTemp");
        
        let firePixelsCount = data.filter(t => t >= 50).length;
        let hotspotPixelsCount = data.filter(t => t >= 40 && t < 50).length;
        
        alertTemp.innerHTML = maxT.toFixed(1) + " °C";
        
        if (firePixelsCount >= 1) {
            alertBox.className = "alert-container fire-alert";
            alertBox.innerHTML = `
                <div class="alert-title">🔥 FIRE DETECTED! 🔥</div>
                <div class="alert-message">${firePixelsCount} pixel(s) above 50°C | IMMEDIATE ACTION REQUIRED</div>
                <div class="alert-temp">Max: ${maxT.toFixed(1)} °C</div>
            `;
        } else if (hotspotPixelsCount >= 2) {
            alertBox.className = "alert-container hotspot-alert";
            alertBox.innerHTML = `
                <div class="alert-title">⚠️ HOTSPOT DETECTED ⚠️</div>
                <div class="alert-message">${hotspotPixelsCount} pixel(s) above 40°C | Monitor situation</div>
                <div class="alert-temp">Max: ${maxT.toFixed(1)} °C</div>
            `;
        } else {
            alertBox.className = "alert-container safe-alert";
            alertBox.innerHTML = `
                <div class="alert-title">🟢 SYSTEM NORMAL</div>
                <div class="alert-message">No abnormal heat detected</div>
                <div class="alert-temp">Max: ${maxT.toFixed(1)} °C</div>
            `;
        }
        
        return {minT, maxT};
    }
    
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        if (mouseX >= 0 && mouseX < canvas.width && mouseY >= 0 && mouseY < canvas.height && currentData.length === 64) {
            const gridX = (mouseX / canvas.width) * 8;
            const gridY = (mouseY / canvas.height) * 8;
            const temp = bilinearInterpolate(currentData, gridX, gridY, 8);
            
            crosshairDiv.style.display = "block";
            crosshairDiv.style.left = (e.clientX + 15) + "px";
            crosshairDiv.style.top = (e.clientY - 20) + "px";
            
            let status = "";
            if (temp >= 50) status = " 🔥 FIRE!";
            else if (temp >= 40) status = " ⚠️ HOTSPOT";
            crosshairDiv.innerHTML = `${temp.toFixed(1)}°C${status}`;
        } else {
            crosshairDiv.style.display = "none";
        }
    });
    
    canvas.addEventListener("mouseleave", () => {
        crosshairDiv.style.display = "none";
    });
    
    async function fetchData() {
        try {
            const response = await fetch('/data');
            const data = await response.json();
            currentData = data;
            
            if (data && data.length === 64) {
                const {minT, maxT} = updateStats(data);
                drawThermalImage(data, minT, maxT);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    
    setInterval(fetchData, 100);
    fetchData();
</script>
</body>
</html>
)rawliteral";

// Smoothing filter
float smoothFilter(float newValue, float oldValue, float alpha = 0.3) {
    return oldValue * (1 - alpha) + newValue * alpha;
}

// Fire detection function
void checkForFire() {
    firePixelCount = 0;
    maxDetectedTemp = 0.0;
    actualFireCount = 0;
    
    for (int i = 0; i < 64; i++) {
        if (smoothedPixels[i] > maxDetectedTemp) {
            maxDetectedTemp = smoothedPixels[i];
        }
        
        if (smoothedPixels[i] >= FIRE_TEMP_THRESHOLD) {
            firePixels[actualFireCount].index = i;
            firePixels[actualFireCount].temperature = smoothedPixels[i];
            firePixels[actualFireCount].row = i / 8;
            firePixels[actualFireCount].col = i % 8;
            actualFireCount++;
            firePixelCount++;
        }
    }
    
    // Determine if fire/hotspot is detected
    bool newFireDetected = (maxDetectedTemp >= FIRE_TEMP_THRESHOLD && firePixelCount >= MIN_FIRE_PIXELS);
    bool newHotspotDetected = (maxDetectedTemp >= HOTSPOT_TEMP_THRESHOLD && maxDetectedTemp < FIRE_TEMP_THRESHOLD);
    
    // Handle alarm triggering with cooldown
    if (newFireDetected && !fireDetected) {
        fireDetected = true;
        lastAlarmTime = millis();
        triggerFireAlarm();
    } else if (!newFireDetected && fireDetected) {
        fireDetected = false;
    }
    
    if (newHotspotDetected && !hotspotDetected) {
        hotspotDetected = true;
        triggerHotspotAlert();
    } else if (!newHotspotDetected && hotspotDetected) {
        hotspotDetected = false;
    }
    
    // Update status without spamming
    if (fireDetected || hotspotDetected) {
        printStatusToSerial();
    }
}

// Trigger fire alarm
void triggerFireAlarm() {
    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║   🔥🔥🔥 FIRE DETECTED! 🔥🔥🔥        ║");
    Serial.println("╠════════════════════════════════════════╣");
    Serial.print("║ Max Temperature: ");
    Serial.print(maxDetectedTemp);
    Serial.println(" °C            ║");
    Serial.print("║ Fire Pixels: ");
    Serial.print(firePixelCount);
    Serial.println("                     ║");
    Serial.println("╚════════════════════════════════════════╝");
    
    // Print fire locations
    for (int i = 0; i < actualFireCount && i < 10; i++) {
        Serial.print("  → Fire at pixel ");
        Serial.print(firePixels[i].index);
        Serial.print(" (Row ");
        Serial.print(firePixels[i].row);
        Serial.print(", Col ");
        Serial.print(firePixels[i].col);
        Serial.print("): ");
        Serial.print(firePixels[i].temperature);
        Serial.println(" °C");
    }
}

// Trigger hotspot alert
void triggerHotspotAlert() {
    Serial.println("\n⚠️⚠️⚠️ HOTSPOT DETECTED ⚠️⚠️⚠️");
    Serial.print("  Temperature: ");
    Serial.print(maxDetectedTemp);
    Serial.println(" °C");
    Serial.print("  Pixels affected: ");
    Serial.println(firePixelCount);
}

// Print regular status updates
void printStatusToSerial() {
    static unsigned long lastStatusPrint = 0;
    if (millis() - lastStatusPrint > 2000) {
        if (fireDetected) {
            Serial.print("🔥 ACTIVE FIRE - ");
        } else if (hotspotDetected) {
            Serial.print("⚠️ HOTSPOT - ");
        }
        Serial.print("Max Temp: ");
        Serial.print(maxDetectedTemp);
        Serial.println(" °C");
        lastStatusPrint = millis();
    }
}

void handleRoot() {
    server.send_P(200, "text/html", index_html);
}

void handleData() {
    amg.readPixels(pixels);
    
    // Apply smoothing filter
    for (int i = 0; i < 64; i++) {
        if (pixels[i] > -20 && pixels[i] < 100) {
            smoothedPixels[i] = smoothFilter(pixels[i], smoothedPixels[i], 0.2);
        }
    }
    
    // Update min/max
    minTemp = 100.0;
    maxTemp = -100.0;
    for (int i = 0; i < 64; i++) {
        if (smoothedPixels[i] < minTemp) minTemp = smoothedPixels[i];
        if (smoothedPixels[i] > maxTemp) maxTemp = smoothedPixels[i];
    }
    
    // Run fire detection
    checkForFire();
    
    // Manual JSON string
    String jsonString = "[";
    for (int i = 0; i < 64; i++) {
        jsonString += String(smoothedPixels[i]);
        if (i < 63) jsonString += ",";
    }
    jsonString += "]";
    
    server.send(200, "application/json", jsonString);
}

void setup() {
    Serial.begin(115200);
    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║   🔥 FIRE DETECTION THERMAL CAMERA    ║");
    Serial.println("╠════════════════════════════════════════╣");
    Serial.println("║ AMG8833 Sensor + ESP32                ║");
    Serial.println("║ Fire Threshold: 50°C                  ║");
    Serial.println("║ Hotspot Threshold: 40°C               ║");
    Serial.println("╚════════════════════════════════════════╝\n");
    
    // Connect to WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
    
    // Initialize I2C
    Wire.begin(21, 22);
    
    // Initialize AMG8833 sensor
    Serial.println("Initializing AMG8833 sensor...");
    bool status = amg.begin();
    if (!status) {
        Serial.println("❌ AMG8833 not found!");
        Serial.println("Check wiring: VCC->3.3V, GND->GND, SDA->21, SCL->22");
        while (1) {
            delay(100);
        }
    }
    Serial.println("✅ AMG8833 sensor initialized!");
    
    // Configure sensor
    amg.setMovingAverageMode(true);
    
    // Initialize smoothed pixels
    for (int i = 0; i < 64; i++) {
        smoothedPixels[i] = 25.0;
    }
    
    // Setup web server
    server.on("/", handleRoot);
    server.on("/data", handleData);
    
    server.begin();
    Serial.println("🌐 Web server started!");
    Serial.println("\n✨ Open your browser and navigate to:");
    Serial.print("   http://");
    Serial.println(WiFi.localIP());
    Serial.println("\n🎯 Fire detection system is ACTIVE!");
}

void loop() {
    server.handleClient();
    delay(10);
}