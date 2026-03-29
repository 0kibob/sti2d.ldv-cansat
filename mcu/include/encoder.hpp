#pragma once
#include <Arduino.h>
#include "config.hpp"

struct Packet {
    uint16_t temp;
    uint16_t pressure;
    int16_t ax;
    int16_t ay;
    int16_t az;
    int16_t gx;
    int16_t gy;
    int16_t gz;
} __attribute__((packed));

static inline uint16_t encode_u16(float value, SensorEncoding config)
{
    int32_t raw = (int32_t)((value + config.offset) * config.scale);

    if (raw < 0) raw = 0;
    if (raw > 65535) raw = 65535;

    return (uint16_t)raw;
}

static inline int16_t encode_i16(float value, SensorEncoding config)
{
    int32_t raw = (int32_t)((value + config.offset) * config.scale);

    if (raw < -32768) raw = -32768;
    if (raw > 32767) raw = 32767;

    return (int16_t)raw;
}

Packet makePacket(float t, float p, float ax, float ay, float az, float gx, float gy, float gz)
{
    Packet pkt;

    pkt.temp = encode_u16(t, SensorConfig::temperature);
    pkt.pressure = encode_u16(p, SensorConfig::pressure);

    pkt.ax = encode_i16(ax, SensorConfig::accel);
    pkt.ay = encode_i16(ay, SensorConfig::accel);
    pkt.az = encode_i16(az, SensorConfig::accel);

    pkt.gx = encode_i16(gx, SensorConfig::gyro);
    pkt.gy = encode_i16(gy, SensorConfig::gyro);
    pkt.gz = encode_i16(gz, SensorConfig::gyro);

    return pkt;
}