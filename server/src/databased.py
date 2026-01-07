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
            "mission TEXT NOT NULL, "
            "deleted INTEGER DEFAULT 0)"
        )

        con.commit()
        con.close()


    def get_missions(self) -> list:
        all_mission: list = []

        con = self.get_con()
        cur = con.cursor()

        cur.execute("SELECT id, mission FROM missions WHERE deleted = 0")
        rows = cur.fetchall()
        con.close()

        if not rows: return {"success": False, "data": []}

        for m_id, m_json in rows:
            mission: dict = {}
            metadata: dict = json.loads(m_json).get("metadata")

            mission["id"] = m_id
            mission["name"] = metadata.get("name")
            mission["datetime"] = metadata.get("datetime")
            mission["position"] = metadata.get("position").get("name")
            all_mission.append(mission)

        return {"success": True, "data": all_mission}


    def get_trash_missions(self) -> list:
        all_mission: list = []

        con = self.get_con()
        cur = con.cursor()

        cur.execute("SELECT id, mission FROM missions WHERE deleted = 1")
        rows = cur.fetchall()
        con.close()

        if not rows: return {"success": False, "data": []}

        for m_id, m_json in rows:
            mission: dict = {}
            metadata: dict = json.loads(m_json).get("metadata")

            mission["id"] = m_id
            mission["name"] = metadata.get("name")
            mission["datetime"] = metadata.get("datetime")
            mission["position"] = metadata.get("position").get("name")
            all_mission.append(mission)

        return {"success": True, "data": all_mission}


    def get_mission(self, m_id: int) -> dict:
        con = self.get_con()
        cur = con.cursor()

        cur.execute("SELECT mission FROM missions WHERE id = ?", (m_id,))
        row = cur.fetchone()
        con.close()

        if row is None: return {}

        return {"success": True, "data": json.loads(row[0])}

    
    def mark_mission(self, m_id: int) -> bool:
        con = self.get_con()
        cur = con.cursor()

        cur.execute("UPDATE missions SET deleted = 1 WHERE id = ? AND deleted = 0",(m_id,))
        success = cur.rowcount > 0

        con.commit()
        con.close()

        return {"success": success}


    def restore_mission(self, m_id: int) -> bool:
        con = self.get_con()
        cur = con.cursor()

        cur.execute("UPDATE missions SET deleted = 0 WHERE id = ? AND deleted = 1",(m_id,))

        success = cur.rowcount > 0
        con.commit()
        con.close()

        return {"success": success}


    def delete_mission(self, m_id: int) -> bool:
        con = self.get_con()
        cur = con.cursor()

        cur.execute("DELETE FROM missions WHERE id = ? AND deleted = 1",(m_id,))
        success = cur.rowcount > 0

        con.commit()
        con.close()

        return {"success": success}


    def edit_mission(self, m_id: int, data: dict):
        con = sqlite3.connect(self.path)
        cur = con.cursor()
        
        cur.execute("UPDATE missions SET mission = ? WHERE id = ?", (json.dumps(data), m_id))
        success = cur.rowcount > 0
        
        con.commit()
        con.close()

        return {"success": success}


    def create_mission(self, data: dict):
        con = sqlite3.connect(self.path)
        cur = con.cursor()

        cur.execute("INSERT INTO missions (mission) VALUES (?)", (json.dumps(data),))
        success = cur.rowcount > 0

        con.commit()
        con.close()

        return {"success": success}