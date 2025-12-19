from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app: FastAPI = FastAPI()

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return {"message": "Server is online"}

@app.get("/greet")
async def greet(name: str = "World"):
    return {"greeting": f"Hello {name}"}

@app.get("/missions")
async def missions(id: int | None = None):
    return {"mission": "none"} if id == None else {"mission": id}

# Then test:

# GET http://localhost:8000/ → {"message":"Server is online"}

# GET http://localhost:8000/square/5 → {"number":5,"square":25}

# GET http://localhost:8000/greet?name=Timéo → {"greeting":"Hello Timéo"}

if not __name__ == "__main__": quit()
uvicorn.run(app, host="0.0.0.0", port=8000)