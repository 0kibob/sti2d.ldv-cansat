import struct
import random

# ----------------------------
# Configuration
# ----------------------------
PACKET_SIZE = 16
SAMPLES = 1000          # number of samples to generate
FILENAME = "test.scm"

# Sensor ranges (raw values, after scale/offset)
TEMP_MIN = 0            # temperature: -40°C → 0
TEMP_MAX = 12500        # 85°C → 12500
PRES_MIN = 3000         # 300 hPa → 3000 (scale x10)
PRES_MAX = 11000        # 1100 hPa → 11000
ACCEL_MIN = -16000      # ±16 g → -16000
ACCEL_MAX = 16000
GYRO_MIN = -20000       # ±2000 dps ×10 → -20000
GYRO_MAX = 20000

# ----------------------------
# Helper function to generate a single sample
# ----------------------------
def generate_sample():
    temp = random.randint(TEMP_MIN, TEMP_MAX)
    pres = random.randint(PRES_MIN, PRES_MAX)
    accelX = random.randint(ACCEL_MIN, ACCEL_MAX)
    accelY = random.randint(ACCEL_MIN, ACCEL_MAX)
    accelZ = random.randint(ACCEL_MIN, ACCEL_MAX)
    gyroX = random.randint(GYRO_MIN, GYRO_MAX)
    gyroY = random.randint(GYRO_MIN, GYRO_MAX)
    gyroZ = random.randint(GYRO_MIN, GYRO_MAX)

    # Pack in little-endian format
    # 'H' = uint16, 'h' = int16
    return struct.pack('<HHhhh hhh', temp, pres, accelX, accelY, accelZ, gyroX, gyroY, gyroZ)

# ----------------------------
# Generate file
# ----------------------------
with open(FILENAME, 'wb') as f:
    for _ in range(SAMPLES):
        f.write(generate_sample())

print(f"{SAMPLES} samples written to {FILENAME}")