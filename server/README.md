# SampleCan - Data Server (FastAPI & Uvicorn)

<!-- ABOUT THE PROJECT -->
## About The Project

**SampleCan Data Server** is a lightweight API built with **FastAPI**, **Uvicorn** and **SQlite** for serving and managing application data.  
It is designed to be simple, fast, and easy to deploy for both local development and production environments.


<!-- TABLE OF CONTENTS -->
### Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Deployment](#deployment)


### Built With

- [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
- [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
- [![Uvicorn](https://img.shields.io/badge/Uvicorn-FF69B4?style=for-the-badge)](https://www.uvicorn.org/)


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* `python 3.12+`
* `pip`
* `git`
* `docker`

### Installation

1. Clone the repository

```bash
git clone https://github.com/0kibob/sti2d.ldv-cansat.git
cd server
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

### Use (Development / Debug)

Simply run the server.py file.
```bash
python src/server.py
```

The server will be available at:
`http://127.0.0.1:81`


<!-- DEPLOYMENT -->
## Deployment

### Docker

Build the deployment image for Docker:

```bash
docker build --tag samplecan-data-server .
```

### Test Deployment (host folder, for development)

Deploy the container:

#### Window:
```bash
docker run --name samplecan-data-server -d -p 8000:81 -v "${PWD}\data:/usr/src/app/data" samplecan-data-server
```

#### Linux:
```bash
docker run --name samplecan-data-server -d -p 8000:81 -v "$(pwd)/data:/usr/src/app/data" samplecan-data-server
```

### Final Deployment (named Docker volume, for production)

#### Cross-platform:
```bash
docker run --name samplecan-data-server -d -p 8000:81 -v samplecan-data:/usr/src/app/data samplecan-data-server
```

This uses a named Docker volume `samplecan-data` to persist data independently of the host (create a new one if none existing).
