import sqlite3
import json
import random
from datetime import datetime, timedelta

DB_PATH = "data/missions.db"


def random_mission(index: int) -> dict:
    base_lat = 40.7128
    base_lon = -74.0060

    duration = random.choice([1800, 3600, 5400])
    interval = random.choice([1, 2, 5])
    total_samples = duration // interval

    start_time = datetime(2025, 12, 19, 14, 30) + timedelta(hours=index)

    return {
        "metadata": {
            "name": f"Test Mission {index + 1}",
            "datetime": start_time.isoformat() + "Z",
            "position": {
                "name": "New York",
                "lat": round(base_lat + random.uniform(-0.01, 0.01), 6),
                "lon": round(base_lon + random.uniform(-0.01, 0.01), 6)
            },
            "duration_sec": duration
        },
        "sampling": {
            "interval_sec": interval,
            "total_samples": total_samples
        },
        "sensors": {
            "temperature_c": [
                round(random.uniform(20.0, 25.0), 2),
                round(random.uniform(20.0, 25.0), 2)
            ],
            "pressure_pa": [
                random.randint(101000, 101400),
                random.randint(101000, 101400)
            ],
            "acceleration_m_s2": [
                [
                    round(random.uniform(-0.05, 0.05), 3),
                    round(random.uniform(0.0, 0.2), 3),
                    round(random.uniform(-0.05, 0.05), 3)
                ],
                [
                    round(random.uniform(-0.05, 0.05), 3),
                    round(random.uniform(0.0, 0.2), 3),
                    round(random.uniform(-0.05, 0.05), 3)
                ]
            ],
            "gyro_deg_s": [
                [
                    round(random.uniform(0.0, 0.2), 3),
                    round(random.uniform(0.0, 0.2), 3),
                    round(random.uniform(0.0, 0.3), 3)
                ],
                [
                    round(random.uniform(0.0, 0.2), 3),
                    round(random.uniform(0.0, 0.2), 3),
                    round(random.uniform(0.0, 0.3), 3)
                ]
            ]
        }
    }


def main():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    cur.execute(
        "CREATE TABLE IF NOT EXISTS missions ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, "
        "mission TEXT NOT NULL)"
    )

    for i in range(20):
        mission = random_mission(i)
        cur.execute(
            "INSERT INTO missions (mission) VALUES (?)",
            (json.dumps(mission),)
        )

    con.commit()
    con.close()
    print("Database created with 5 randomized missions ✅")


if __name__ == "__main__":
    main()
