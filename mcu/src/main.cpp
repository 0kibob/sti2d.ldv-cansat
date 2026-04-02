#include <Arduino.h>

#include <Adafruit_BME280.h>
#include <RadioLib.h>
#include <LSM6DS3.h>

#include "encoder.hpp"
#include "config.hpp"
#include "debug.hpp"

Adafruit_BME280 bme;
LSM6DS3 imu(I2C_MODE, LSM_ADDR);
SX1262 radio = SX1262(new Module(Pins::WIO_NSS, Pins::WIO_DIO, Pins::WIO_NRST, Pins::WIO_BUSY));

Packet packetBuffer[BUFFER_SIZE];
uint8_t packetIndex = 0;
uint64_t lastSampleTime = 0;

bool isTelemetryEnable = true; // true by default
uint64_t lastTelemetryDebounceTime = 0;
bool isPowerEnable = true; // true by default
uint64_t lastPowerDebounceTime = 0;
bool isFalling = false; // Default false, true for testing

uint64_t lastAltitudeDebounceTime = 0;
float lastAltitude = 0;
float deltaAltitude = 0;

void setup()
{
    Serial.begin(BAUD_RATE);
    Serial1.begin(LOG_RATE);
    Wire.begin();
    SPI.begin();
    while (!Serial) {}
    if (!bme.begin(BME_ADDR)) { Serial.println("BME FAIL"); }
    if (imu.begin() != 0) { Serial.println("IMU FAIL"); }
    int radioState = radio.begin(RADIO_FREQ, RADIO_BNWH, RADIO_SPFC, RADIO_CDRT, RADIO_SYNC, RADIO_POWR, 8u, 1.8f, false);
    if (radioState != RADIOLIB_ERR_NONE) { Serial.print("WIO FAIL"); Serial.print(radioState); }
    pinMode(Pins::ANT_BTN, INPUT_PULLUP);
    pinMode(Pins::POW_BTN, INPUT_PULLUP);
    pinMode(Pins::ANT_LED, OUTPUT);
    pinMode(Pins::POW_LED, OUTPUT);
    // Faut fix mais ya plus de temps
    // Serial1.print("new ");
    // Serial1.print("mission.scm");
    // Serial1.write(13);
    // while (Serial1.available()) Serial.print(Serial1.read());
    // while(1) { if(Serial1.available()) if(Serial1.read() == '>') break; }
    // Serial1.print("append ");
    // Serial1.println("mission.scm");
    // Serial1.write(13);
    // while (Serial1.available()) Serial.print(Serial1.read());
    // while(1) { if(Serial1.available()) if(Serial1.read() == '<') break; }
    Serial.print("SUCCESS INIT");
}

Packet createPacket()
{
    float temp = bme.readTemperature();
    float pressure = bme.readPressure() / 100.0f;
    float ax = imu.readFloatAccelX();
    float ay = imu.readFloatAccelY();
    float az = imu.readFloatAccelZ();
    float gx = imu.readFloatGyroX();
    float gy = imu.readFloatGyroY();
    float gz = imu.readFloatGyroZ();
    return makePacket(temp, pressure, ax, ay, az, gx, gy, gz);
}

void loop()
{
    float ax = imu.readFloatAccelX();
    float ay = imu.readFloatAccelY();
    float az = imu.readFloatAccelZ();
    float accel = sqrtf(ax*ax + ay*ay + az*az);
    
    isFalling = accel < FALL_THRESHOLD;


    int16_t radioState = 0;
    uint32_t now = millis();

    // if (isFalling) {
    //     char buf[32];
    //     snprintf(buf, sizeof(buf), "value=%.2f", accel);
    //     radioState = radio.transmit(buf);
    // }

    if (now - lastSampleTime >= SAMPLE_PERIOD && isTelemetryEnable)
    {
        lastSampleTime = now;
        Packet pkt = createPacket();

        if (packetIndex < BUFFER_SIZE) { packetBuffer[packetIndex++] = pkt; }
        Serial1.write((uint8_t*)&pkt, sizeof(pkt));
        // printPacketDebug(pkt);
        
        if (packetIndex >= BUFFER_SIZE)
        {
            if (isFalling)
            {
                Serial.write((uint8_t*)packetBuffer, packetIndex * sizeof(Packet));
                radioState = radio.transmit((uint8_t*)packetBuffer, packetIndex * sizeof(Packet));
            }
            packetIndex = 0;
        }
    }

    if (radioState != RADIOLIB_ERR_NONE) {Serial.print("WIO ERROR");}

    if (digitalRead(Pins::ANT_BTN) == LOW && millis() - lastTelemetryDebounceTime > DEBOUNCE)
    {
        isTelemetryEnable = !isTelemetryEnable;
        lastTelemetryDebounceTime = millis();
    }

    if (digitalRead(Pins::POW_BTN) == LOW && millis() - lastPowerDebounceTime > DEBOUNCE)
    {
        isPowerEnable = !isPowerEnable;
        lastPowerDebounceTime = millis();
    }

    digitalWrite(Pins::ANT_LED, isTelemetryEnable);
    digitalWrite(Pins::POW_LED, isPowerEnable);

    
}