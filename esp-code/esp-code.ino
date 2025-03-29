#include <SPI.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include "auth.h"  // Include the token header file
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>
#include <Wire.h>

#define SS_PIN 21   // SDA pin
#define RST_PIN 22  // RST pin

// Define custom SDA and SCL pins for I2C
#define CUSTOM_SDA 4
#define CUSTOM_SCL 5

// #define BUZZER_PIN 13  // D13 for the buzzer
#define FAIL_LED 12

MFRC522 mfrc522(SS_PIN, RST_PIN);    // Create MFRC522 instance
LiquidCrystal_I2C lcd(0x27, 16, 2);  // set the LCD address to 0x3F for a 16 chars and 2 line display

String token;

void setup() {
  Serial.begin(115200);
  // Initialize I2C with custom SDA and SCL pins
  Wire.begin(CUSTOM_SDA, CUSTOM_SCL);  // Initialize I2C with custom pins
  lcd.begin();
  lcd.clear();
  lcd.backlight();             // Make sure backlight is on
  SPI.begin();                 // Initialize SPI bus
  mfrc522.PCD_Init();          // Initialize MFRC522 card reader
  WiFi.begin(ssid, password);  // Connect to Wi-Fi
  Serial.println("Connecting to WiFi");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting to WiFi");
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println(".");
  }
  Serial.println("Connected to WiFi");
  Serial.println(ssid);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connected to");
  lcd.setCursor(0, 1);
  lcd.print(ssid);
  // Send login request once connected
  sendLoginRequest();
  delay(5000);
  Serial.println("Place your card to the reader...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Place your card to the reader...");

  // pinMode(BUZZER_PIN, OUTPUT);  // Set buzzer pin as output
  pinMode(FAIL_LED, OUTPUT);
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

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sending request...");

    HTTPClient http;
    http.begin(serverUrl);

    // Set the content type and authorization header
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(token));
    http.addHeader("Authorization1", AUTH_TOKEN);
    http.addHeader("Authorization2", AUTH_TOKEN2);

    // Create JSON payload
    String jsonPayload = "{\"card_id\": \"" + cardID + "\", \"amount\": " + String(amount) + "}";

    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
      String response = http.getString();  // Get response payload
      Serial.println("Response: " + response);

      // Parse the JSON response
      StaticJsonDocument<500> doc;
      DeserializationError jsonError = deserializeJson(doc, response);

      if (jsonError) {
        Serial.print("JSON parsing failed: ");
        Serial.println(jsonError.c_str());
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("JSON parsing failed");
        delay(3000);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Place your card");
        return;  // Exit if parsing fails
      }

      const char* success = doc["success"];
      const char* errorMsg = doc["error"];
      int new_balance = doc["new_balance"];
      if (success && strlen(success) > 0) {
        // digitalWrite(BUZZER_PIN, HIGH);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(success);
        lcd.setCursor(0, 1);
        lcd.print("Balance: ");
        lcd.print(new_balance);
      } else if (errorMsg && strlen(errorMsg) > 0) {
        digitalWrite(FAIL_LED, HIGH);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(errorMsg);
      }
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Error on sending POST");
      digitalWrite(FAIL_LED, HIGH);
    }

    http.end();  // Free resources
  } else {
    Serial.println("WiFi not connected");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi not connected");
  }
  delay(3000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Place your card");
  // digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(FAIL_LED, LOW);
}

void sendLoginRequest() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Specify the URL of your login endpoint
    http.begin(loginUrl);  // Replace with your actual login URL

    // Set request headers (optional)
    http.addHeader("Content-Type", "application/json");

    // Create the JSON payload with username and password
    // String requestBody = "{\"username\":\"" + String(driverLoginId) + "\",\"password\":\"" + String(driverLoginPass) + "\"}";
    String requestBody = "{\"username\":\"abcd\",\"password\":\"abcd\"}";
    // Send the POST request with the payload
    int httpResponseCode = http.POST(requestBody);

    // Check for a response
    if (httpResponseCode > 0) {
      String response = http.getString();  // Get the response to the request
      Serial.println(httpResponseCode);    // Print HTTP return code
      Serial.println(response);            // Print server response (JWT token)

      // Parse token from the response
      DynamicJsonDocument doc(512);
      DeserializationError error = deserializeJson(doc, response);

      if (!error) {
        // Use as<String>() to properly convert the token from JSON
        String tempToken = doc["token"].as<String>();        // Extract token as String
        token = tempToken.c_str();                           // Convert String to const char*
        Serial.println("Token received: " + String(token));  // Verify the token
      } else {
        Serial.print("Failed to parse JSON: ");
        Serial.println(error.c_str());
      }
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    // Close the connection
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}