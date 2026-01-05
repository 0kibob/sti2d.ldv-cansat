from fastapi import FastAPI
from fastapi import Header
from fastapi.middleware.cors import CORSMiddleware
from databased import DataBase
import uvicorn
import os

DB_PATH = "data/missions.db"
PASS_KEY = "secretkey1234"
os.makedirs("data", exist_ok=True)

app: FastAPI = FastAPI()
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db: DataBase = DataBase(DB_PATH)
db.init()


def check_key(key: str | None): return key == PASS_KEY


@app.get("/api")
async def home():
    return {"success": True}


# Get all mission for display
@app.get("/api/missions")
async def get_missions(): return db.get_missions()

# Get all trashed mission for display
@app.get("api/missions/trash")
async def trash_missions(): return db.get_trash_missions()

# Get a mission based on is id
@app.get("/api/missions/get")
async def get_mission(id: int | None = None):
    if not id: return {"success": False}
    return db.get_mission(id)


# Mark a mission as deleted based on is id
@app.get("/api/missions/mark")
async def mark_mission(id: int | None = None, x_api_key: str | None = Header(None)):
    if not check_key(x_api_key): return {"success": False}
    if not id: return {"success": False}
    return db.mark_mission(id)

# Unmark a deleted mission based on is id
@app.get("/api/missions/restore")
async def restore_mission(id: int | None = None, x_api_key: str | None = Header(None)):
    if not check_key(x_api_key): return {"success": False}
    if not id: return {"success": False}
    return db.restore_mission(id)

# Delete a mission based on is id
@app.get("/api/missions/delete")
async def delete_mission(id: int | None = None, x_api_key: str | None = Header(None)):
    if not check_key(x_api_key): return {"success": False}
    if not id: return {"success": False}
    return db.delete_mission(id)


# Edit the content of a mission based on is id
@app.post("/api/missions/edit")
async def edit_mission(id: int | None = None, mission: dict | None = None, x_api_key: str | None = Header(None)):
    if not check_key(x_api_key): return {"success": False}
    if not id: return {"success": False}
    if not mission: return {"success": False}
    pass

# Create a new mission
@app.post("/api/missions/create")
async def create_mission(mission: dict | None = None, x_api_key: str | None = Header(None)):
    if not check_key(x_api_key): return {"success": False} 
    if not mission: return {"success": False}
    return {"success": True, "message": "Mission created"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)