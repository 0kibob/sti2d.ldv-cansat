# 🚀 Server using FastAPI

## 📦 Installation
Install dependencies:
```bash
pip install fastapi uvicorn
```

## ▶️ Run the server
```bash
python server.py
```

## 🐳 Docker
Build image:
```bash
docker build --tag cansat-server .
```

Run container:
```bash
docker run -d -p 8000:8000 cansat-server
```