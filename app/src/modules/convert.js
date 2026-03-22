const PACKET_SIZE = 16;

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

/**
 * Convert a raw buffer into readable sensor values
 * @param {Buffer} buffer
 * @returns {Object} { temperature, pressure, accelX, accelY, accelZ, gyroX, gyroY, gyroZ }
 */
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

    for (let offset = 0; offset + PACKET_SIZE <= buffer.length; offset += PACKET_SIZE) {
        // const tempRaw = buffer.readUInt16LE(offset + 0);
        // data.temperature.push((tempRaw / SCALE.temperature) - OFFSET.temperature);
        const tempRaw = buffer.readUInt16LE(offset + 0);
        data.temperature.push((tempRaw - OFFSET.temperature * SCALE.temperature) / SCALE.temperature);

        const presRaw = buffer.readUInt16LE(offset + 2);
        data.pressure.push(presRaw / SCALE.pressure);

        data.accelX.push(buffer.readInt16LE(offset + 4) / SCALE.accel);
        data.accelY.push(buffer.readInt16LE(offset + 6) / SCALE.accel);
        data.accelZ.push(buffer.readInt16LE(offset + 8) / SCALE.accel);

        data.gyroX.push(buffer.readInt16LE(offset + 10) / SCALE.gyro);
        data.gyroY.push(buffer.readInt16LE(offset + 12) / SCALE.gyro);
        data.gyroZ.push(buffer.readInt16LE(offset + 14) / SCALE.gyro);
    }

    return data;
}

module.exports = { parseSensorBuffer, PACKET_SIZE };