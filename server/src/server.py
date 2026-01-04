from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from databased import DataBase

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

@app.get("/")
async def home():
    return {"message": "Server is online"}

# Get all mission
@app.get("/gt_missions")
async def missions():
    return db.get_missions()

# Get a mission based on is id
@app.get("/gt_mission")
async def mission(m_id: int | None = None):
    return db.get_mission(m_id)

# Remove a mission based on is id
@app.get("/rm_mission")
async def rm_mission(m_id: int, key: str):
    if not key == PASS_KEY: return {"success": False}
    return db.delete_mission(m_id)

# Create a mission based
@app.get("/mk_mission")
async def mk_mission():
    return {"message": f"Mission created successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)