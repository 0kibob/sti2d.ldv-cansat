#pragma once

#include "encoder.hpp"

void printPacketDebug(const Packet& pkt)
{
    Serial.print("T(raw)=");
    Serial.print(pkt.temp);
    Serial.print(" | P(raw)=");
    Serial.print(pkt.pressure);

    Serial.print(" | ax=");
    Serial.print(pkt.ax);
    Serial.print(" ay=");
    Serial.print(pkt.ay);
    Serial.print(" az=");
    Serial.print(pkt.az);

    Serial.print(" | gx=");
    Serial.print(pkt.gx);
    Serial.print(" gy=");
    Serial.print(pkt.gy);
    Serial.print(" gz=");
    Serial.println(pkt.gz);
}