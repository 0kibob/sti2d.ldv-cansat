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
    if (radioState != RADIOLIB_ERR_NONE) { Serial.print("WIO FAIL"); }
}

bool isTelemetryEnable = true;
Packet packetBuffer[BUFFER_SIZE];
uint8_t packetIndex = 0;
uint32_t lastSampleTime = 0;

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
    int16_t radioState = 0;
    uint32_t now = millis();

    if (now - lastSampleTime >= SAMPLE_PERIOD)
    {
        lastSampleTime = now;
        Packet pkt = createPacket();

        if (packetIndex < BUFFER_SIZE) { packetBuffer[packetIndex++] = pkt; }
        // Serial1.write((uint8_t*)&pkt, sizeof(pkt));
        // Serial.write((uint8_t*)&pkt, sizeof(pkt));
        // printPacketDebug(pkt);
        
        if (packetIndex >= BUFFER_SIZE)
        {
            Serial.write((uint8_t*)packetBuffer, packetIndex * sizeof(Packet));
            radioState = radio.transmit((uint8_t*)packetBuffer, packetIndex * sizeof(Packet));
            packetIndex = 0;
        }
    }

    if (radioState != RADIOLIB_ERR_NONE) {Serial.print("WIO FAIL");}
}