# SampleCan - Data Server (FastAPI)

## Contents

* [Introduction](#introduction)
* [Development](#developement)
* [Deployments](#deployments)

## Introduction

**SampleCan Data Server** is a lightweight API built with **FastAPI** for serving and managing application data.  
It is designed to be simple, fast, and easy to deploy for both local development and production environments.

## Development
#### Prerequisites:
* `python 3.10+`
* `pip`
* `git`
* `docker`

#### Setup:
1. Clone the repository
```bash
git clone https://github.com/0kibob/sti2d.ldv-cansat.git
cd server/src
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```

#### Run:
Simply run the server.py file.
```bash
python server.py
```

## Deployments

#### Docker
Build image:
```bash
docker build --tag samplecan-data-server .
```

Run container:
```bash
docker run -d -p 8000:8000 samplecan-data-server
```