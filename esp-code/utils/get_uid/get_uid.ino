#include <SPI.h>
#include <MFRC522.h>


#define SS_PIN 21    // SDA pin
#define RST_PIN 22   // RST pin

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance

void setup() {
  Serial.begin(115200);   // Initialize serial communications
  SPI.begin();            // Initialize SPI bus
  mfrc522.PCD_Init();     // Initialize MFRC522 card reader
  Serial.println("Place your card to the reader...");
}

void loop() {
  // Check if a new card is present
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Check if the card can be read
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Print the UID (Unique Identifier) of the card
  Serial.print("Card UID: ");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.println();

  // Halt PICC (to stop communication with the card)
  mfrc522.PICC_HaltA();
}
