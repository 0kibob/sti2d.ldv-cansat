const PACKET_SIZE = 16;

function bytesToUint16(buffer) {
    const result = [];
    for (let i = 0; i < buffer.length; i += 2) {
        const value = buffer[i] | (buffer[i + 1] << 8); // little-endian
        result.push(value);
    }
    return result;
}

const SCALE = {
    temperature: 100,
    pressure: 10,
    accel: 1000,
    gyro: 10
};

const OFFSET = {
    temperature: 40,
    pressure: 0,
    accel: 0,
    gyro: 0
};

function parseSensorBuffer(buffer) {
    const data = {
        temperature: [],
        pressure: [],
        accelX: [],
        accelY: [],
        accelZ: [],
        gyroX: [],
        gyroY: [],
        gyroZ: []
    };

    const uint16Array = bytesToUint16(buffer); // assign to uint16Array

    for (let offset = 0; offset + PACKET_SIZE / 2 <= uint16Array.length; offset += PACKET_SIZE / 2) {
        const tempRaw = uint16Array[offset + 0];
        data.temperature.push((tempRaw - OFFSET.temperature * SCALE.temperature) / SCALE.temperature);

        const presRaw = uint16Array[offset + 1];
        data.pressure.push(presRaw / SCALE.pressure);

        for (let i = 0; i < 3; i++) {
            let raw = uint16Array[offset + 2 + i];
            raw = raw > 0x7FFF ? raw - 0x10000 : raw;
            if (i === 0) data.accelX.push(raw / SCALE.accel);
            if (i === 1) data.accelY.push(raw / SCALE.accel);
            if (i === 2) data.accelZ.push(raw / SCALE.accel);
        }

        for (let i = 0; i < 3; i++) {
            let raw = uint16Array[offset + 5 + i];
            raw = raw > 0x7FFF ? raw - 0x10000 : raw;
            if (i === 0) data.gyroX.push(raw / SCALE.gyro);
            if (i === 1) data.gyroY.push(raw / SCALE.gyro);
            if (i === 2) data.gyroZ.push(raw / SCALE.gyro);
        }
    }

    return data;
}

module.exports = { parseSensorBuffer, bytesToUint16, PACKET_SIZE };