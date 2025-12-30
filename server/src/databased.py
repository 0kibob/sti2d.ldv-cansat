import sqlite3
import json

class DataBase:
    def __init__(self, path: str):
        self.path = path


    def get_con(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path)


    def init(self) -> None:
        con = self.get_con()
        cur = con.cursor()

        cur.execute(
            "CREATE TABLE IF NOT EXISTS missions ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "mission TEXT NOT NULL)"
        )

        con.commit()
        con.close()


    def get_missions(self) -> list:
        all_mission: list = []

        con = self.get_con()
        cur = con.cursor()

        cur.execute("SELECT id, mission FROM missions")
        rows = cur.fetchall()
        con.close()

        if rows is None: return []

        for m_id, m_json in rows:
            mission: dict = {}
            metadata: dict = json.loads(m_json).get("metadata")

            mission["id"] = m_id
            mission["name"] = metadata.get("name")
            mission["datetime"] = metadata.get("datetime")
            mission["position"] = metadata.get("position").get("name")
            all_mission.append(mission)

        return all_mission


    def get_mission(self, m_id: int) -> dict:
        con = self.get_con()
        cur = con.cursor()

        cur.execute("SELECT mission FROM missions WHERE id = ?", (m_id,))
        row = cur.fetchone()
        con.close()

        if row is None: return {}

        return json.loads(row[0])



    # def create_mission(self, data):
    #     con = sqlite3.connect(self.path)
    #     cur = con.cursor()
    #     cur.execute("INSERT INTO missions (mission) VALUES (?)", (json.dumps(data),))
    #     con.commit()
    #     con.close()