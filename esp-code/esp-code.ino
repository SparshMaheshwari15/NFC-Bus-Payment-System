#include <SPI.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include "auth.h"  // Include the token header file

#define SS_PIN 21   // SDA pin
#define RST_PIN 22  // RST pin

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance


void setup() {
  Serial.begin(115200);        
  SPI.begin();                 // Initialize SPI bus
  mfrc522.PCD_Init();          // Initialize MFRC522 card reader
  WiFi.begin(ssid, password);  // Connect to Wi-Fi
  
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.println("Place your card to the reader...");
}

void loop() {
  // Reset the loop if no new card present on the sensor/reader.
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  String cardID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    // Add leading zero if necessary and concatenate the byte value in HEX format
    cardID += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    cardID += String(mfrc522.uid.uidByte[i], HEX);

    // Add a space between bytes, but not after the last byte
    if (i < mfrc522.uid.size - 1) {
      cardID += " ";
    }
  }

  // Convert to uppercase
  cardID.toUpperCase();
  Serial.print("Card UID: ");
  Serial.println(cardID);

  if (cardID != "") {               // If a valid cardID is obtained
    deductBalance(cardID, amount);  // Deduct amount
  }
  // Halt PICC (card)
  mfrc522.PICC_HaltA();

  delay(2000);  // Wait for 2 seconds before reading again
}

void deductBalance(String cardID, int amount) {
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl); 

    // Set the content type and authorization header
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", AUTH_TOKEN);  
    http.addHeader("Authorization2", AUTH_TOKEN2);  

    // Create JSON payload
    String jsonPayload = "{\"card_id\": \"" + cardID + "\", \"amount\": " + String(amount) + "}";

    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
      String response = http.getString();  // Get response payload
      Serial.println("Response: " + response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();  // Free resources
  } else {
    Serial.println("WiFi not connected");
  }
}
