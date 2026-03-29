#pragma once

#include <Arduino.h>

const uint32_t BAUD_RATE = 115200;
const uint32_t LOG_RATE = 9600;
const uint8_t BME_ADDR = 0x76;
const uint8_t LSM_ADDR = 0x6A;

constexpr uint8_t BUFFER_SIZE = 5;
constexpr uint32_t SAMPLE_PERIOD = 1000; // 1s
// constexpr uint32_t SEND_PERIOD   = 1000 * BUFFER_SIZE; // 5s

struct Pins
{
    // POWER
    static const uint8_t POW_BTN = D2;
    static const uint8_t POW_LED = D0;
    // ANTENNA
    static const uint8_t ANT_BTN = D1;
    static const uint8_t ANT_LED = D3;
    // SERVO
    static const uint8_t SRV_DAT = D15;
    // BME280
    static const uint8_t BME_SDA = D4;
    static const uint8_t BME_SCL = D5;
    // OPENLOG
    static const uint8_t LOG_TXD = D6;
    static const uint8_t LOG_RXD = D7;
    // WIO_SX1262
    static const uint8_t WIO_SCK = D8;
    static const uint8_t WIO_MISO = D9;
    static const uint8_t WIO_MOSI = D10;
    static const uint8_t WIO_BUSY = D16;
    static const uint8_t WIO_NRST = D17;
    static const uint8_t WIO_NSS = D18;
    static const uint8_t WIO_DIO = D14;
};

struct SensorEncoding
{
    float scale;
    float offset;
};

struct SensorConfig
{
    static constexpr SensorEncoding temperature = {100.0f, 40.0f,};
    static constexpr SensorEncoding pressure = {10.0f, 0.0f};
    static constexpr SensorEncoding accel = {1000.0f, 0.0f};
    static constexpr SensorEncoding gyro = {10.0f, 0.0f};
};
