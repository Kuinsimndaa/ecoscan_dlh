#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ===== Konfigurasi WiFi (Hardcode) =====
const char* WIFI_SSID     = "Queens1";
const char* WIFI_PASSWORD = "queensi29";

// ===== Konfigurasi Server =====
const char* SERVER_URL = "https://ecoscan-web.dev-myproject.my.id/api/scan/rfid-device";

// ===== Pin RFID =====
#define SS_PIN   5
#define RST_PIN  22
#define SCK_PIN  18
#define MOSI_PIN 23
#define MISO_PIN 19

MFRC522 mfrc522(SS_PIN, RST_PIN);

// Forward declaration
void sendDataToServer(String uid);

void setup() {
  Serial.begin(115200);
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  mfrc522.PCD_Init();

  Serial.println("\n--- ECO-SCAN RFID SYSTEM ---");

  // Konek WiFi langsung (tanpa captive portal)
  Serial.printf("Menghubungkan ke WiFi: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Terhubung ke WiFi!");
    Serial.print("IP Address ESP32: ");
    Serial.println(WiFi.localIP());
    Serial.printf("Target Server: %s\n", SERVER_URL);
    Serial.println("Siap scan kartu RFID...");
  } else {
    Serial.println("\n❌ Gagal konek WiFi! Cek SSID dan password.");
    Serial.println("Melanjutkan tanpa WiFi...");
  }
}

void loop() {
  // Cek apakah ada kartu baru
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  // Ambil UID Kartu
  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidString += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  Serial.println("\n[RFID] Card detected! UID: " + uidString);

  // Kirim ke server
  sendDataToServer(uidString);

  // Beri jeda agar tidak terbaca berulang kali
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  delay(2000);
}

void sendDataToServer(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi tidak terhubung!");
    // Coba reconnect
    WiFi.reconnect();
    return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Bypass SSL certificate verification for ESP32

  HTTPClient http;
  http.begin(client, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(8000); // timeout 8 detik

  // Payload JSON
  JsonDocument doc;
  doc["rfid"] = uid;
  String requestBody;
  serializeJson(doc, requestBody);

  Serial.print("[HTTP] Mengirim: ");
  Serial.println(requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP] Response %d: %s\n", httpCode, response.c_str());

    if (httpCode == 200) {
      Serial.println(">>> ✅ TRANSAKSI BERHASIL <<<");
    } else if (httpCode == 429) {
      Serial.println(">>> ⏳ COOLDOWN: Tunggu 15 detik <<<");
    } else if (httpCode == 404) {
      Serial.println(">>> ❌ KARTU TIDAK TERDAFTAR <<<");
    } else {
      Serial.println(">>> ⚠️  TRANSAKSI GAGAL <<<");
    }
  } else {
    Serial.printf("[ERROR] HTTP error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
