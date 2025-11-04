if not __name__ == "__main__": quit()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Example endpoints ---

@app.get("/")
async def home():
    return {"message": "Server is online"}

@app.get("/square/{n}")
async def square(n: int):
    return {"number": n, "square": n * n}

@app.get("/greet")
async def greet(name: str = "World"):
    return {"greeting": f"Hello {name}"}

# Then test:

# GET http://localhost:8000/ → {"message":"Server is online"}

# GET http://localhost:8000/square/5 → {"number":5,"square":25}

# GET http://localhost:8000/greet?name=Timéo → {"greeting":"Hello Timéo"}

uvicorn.run(app, host = "0.0.0.0", port=8000)